const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

const isPostgres = () => {
    const dbUrl = process.env.DATABASE_URL || '';
    return dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql') || process.env.DB_PROVIDER === 'postgres';
};

// -------------------------------------------------------------
// POSTGRESQL IMPLEMENTATION
// -------------------------------------------------------------
let pgPool = null;

const getPgDatabaseUrl = () => {
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
        return dbUrl;
    }
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 5432;
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'zanzone';
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

// Helper to translate MySQL queries to PostgreSQL syntax
function translateQuery(sql) {
    if (!sql) return { sql, isInsert: false };
    
    let pgSql = sql;
    
    // 1. Translate null-safe equal <=> to IS NOT DISTINCT FROM
    pgSql = pgSql.replace(/<=>/g, 'IS NOT DISTINCT FROM');
    
    // 2. Translate DATABASE() to current_database()
    pgSql = pgSql.replace(/DATABASE\(\)/gi, 'current_database()');
    
    // 3. Append RETURNING * to INSERT INTO if not already present
    const isInsert = /^\s*insert\s+into/i.test(pgSql);
    if (isInsert && !/returning/i.test(pgSql)) {
        pgSql += ' RETURNING *';
    }
    
    // 4. Translate ? to $1, $2, $3, etc.
    let index = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${index++}`);
    
    return { sql: pgSql, isInsert };
}

// Wrap a PG result to match mysql2 format
function wrapPgResult(res) {
    const rows = res.rows || [];
    rows.insertId = res.rows[0]?.id || null;
    rows.affectedRows = res.rowCount;
    return [rows, res.fields];
}

function wrapPgClient(client) {
    return {
        query: async (sql, params) => {
            const { sql: pgSql } = translateQuery(sql);
            const res = await client.query(pgSql, params);
            return wrapPgResult(res);
        },
        execute: async (sql, params) => {
            const { sql: pgSql } = translateQuery(sql);
            const res = await client.query(pgSql, params);
            return wrapPgResult(res);
        },
        release: () => {
            if (client.release) client.release();
        }
    };
}

// -------------------------------------------------------------
// MYSQL IMPLEMENTATION
// -------------------------------------------------------------
let mysqlPool = null;

const getMysqlConfig = () => {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'zanzone',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        charset: 'utf8mb4',
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000
    };
};

// -------------------------------------------------------------
// DUAL-DATABASE DB WRAPPER EXPORT
// -------------------------------------------------------------
const dbWrapper = {
    query: async (sql, params) => {
        // Centralised query with automatic retry on transient connection errors
        const attempt = async (retry = false) => {
            try {
                if (isPostgres()) {
                    if (!pgPool) pgPool = new Pool({ connectionString: getPgDatabaseUrl(), max: 10 });
                    const { sql: pgSql } = translateQuery(sql);
                    const res = await pgPool.query(pgSql, params);
                    return wrapPgResult(res);
                } else {
                    if (!mysqlPool) mysqlPool = mysql.createPool(getMysqlConfig());
                    // Use pool.query directly; mysql2 will manage connections internally
                    return mysqlPool.query(sql, params);
                }
            } catch (err) {
                // Detect fatal connection errors and attempt a pool reset once
                const fatalCodes = ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT'];
                if (!retry && fatalCodes.includes(err.code)) {
                    console.warn('⚠️ Detected MySQL connection error, resetting pool:', err.code);
                    if (mysqlPool) {
                        try { await mysqlPool.end(); } catch (_) {}
                        mysqlPool = null;
                    }
                    // Recreate pool and retry the query
                    return attempt(true);
                }
                throw err;
            }
        };
        return attempt();
    },
    execute: async (sql, params) => {
        // Same retry logic for execute (which returns result metadata)
        const attempt = async (retry = false) => {
            try {
                if (isPostgres()) {
                    if (!pgPool) pgPool = new Pool({ connectionString: getPgDatabaseUrl(), max: 10 });
                    const { sql: pgSql } = translateQuery(sql);
                    const res = await pgPool.query(pgSql, params);
                    return wrapPgResult(res);
                } else {
                    if (!mysqlPool) mysqlPool = mysql.createPool(getMysqlConfig());
                    return mysqlPool.execute(sql, params);
                }
            } catch (err) {
                const fatalCodes = ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT'];
                if (!retry && fatalCodes.includes(err.code)) {
                    console.warn('⚠️ Detected MySQL connection error on execute, resetting pool:', err.code);
                    if (mysqlPool) {
                        try { await mysqlPool.end(); } catch (_) {}
                        mysqlPool = null;
                    }
                    return attempt(true);
                }
                throw err;
            }
        };
        return attempt();
    },
    getConnection: async () => {
        if (isPostgres()) {
            if (!pgPool) pgPool = new Pool({ connectionString: getPgDatabaseUrl(), max: 10 });
            const client = await pgPool.connect();
            return wrapPgClient(client);
        } else {
            if (!mysqlPool) mysqlPool = mysql.createPool(getMysqlConfig());
            const conn = await mysqlPool.getConnection();
            return conn;
        }
    },
    end: async () => {
        if (pgPool) await pgPool.end();
        if (mysqlPool) await mysqlPool.end();
    }
};

// Lazy initialization – runs once on module load without overwriting existing pools
;(async () => {
  try {
    if (isPostgres()) {
      if (!pgPool) pgPool = new Pool({ connectionString: getPgDatabaseUrl(), max: 10 });
      await pgPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL Connected Successfully');
    } else {
      if (!mysqlPool) mysqlPool = mysql.createPool(getMysqlConfig());
      // Listen for unexpected errors on the pool
      mysqlPool.on('error', (err) => {
        console.error('⚠️ MySQL pool error:', err);
        // Force recreation of the pool on fatal errors
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
          mysqlPool.end().catch(() => {});
          mysqlPool = null;
          setTimeout(() => {
            console.log('🔄 Recreating MySQL pool after error...');
            mysqlPool = mysql.createPool(getMysqlConfig());
          }, 2000);
        }
      });
      const conn = await mysqlPool.getConnection();
      console.log('✅ MySQL Connected Successfully');
      conn.release();
    }
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
    // If the pool encounters a fatal error, attempt recreation after a short delay
    if (mysqlPool) {
      try {
        mysqlPool.end();
      } catch (_) {}
      mysqlPool = null;
      setTimeout(() => {
        console.log('🔄 Reinitializing MySQL pool...');
        mysqlPool = mysql.createPool(getMysqlConfig());
      }, 2000);
    }
  }

})();

module.exports = dbWrapper;
