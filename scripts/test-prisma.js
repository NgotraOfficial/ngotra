const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const sqlite = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);
const prisma = new PrismaClient({ adapter });

prisma.user.findMany()
  .then(u => {
    console.log('Users:', u.length);
    return prisma.$disconnect();
  })
  .catch(e => console.error(e));