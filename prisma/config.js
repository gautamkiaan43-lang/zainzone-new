// prisma/config.js
require('dotenv').config();        // load .env

module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
