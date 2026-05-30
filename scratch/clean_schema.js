const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Remove comments about missing unique identifiers
content = content.replace(/\/\/\/ The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.\n/g, '');

// 2. Remove @@ignore statements
content = content.replace(/\s+@@ignore\n/g, '\n');

// 3. Add @id @default(autoincrement()) to id fields that are currently just Int
content = content.replace(/(\s+id\s+Int\s*)(\r?\n)/g, '$1 @id @default(autoincrement())$2');

// 4. Also clean up any trailing/double newlines or spaces caused by the replacements
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

// 5. Change provider to postgresql
content = content.replace(/provider = "mysql"/g, 'provider = "postgresql"');

// 6. Fix native type mismatches for PostgreSQL
content = content.replace(/@db\.LongText/g, '@db.Text');
content = content.replace(/@db\.DateTime\(0\)/g, '@db.Timestamp(0)');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Successfully cleaned schema.prisma and converted to PostgreSQL!');
