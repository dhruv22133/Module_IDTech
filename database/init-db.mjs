import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!user || !password) {
  console.error('DB_USER and DB_PASSWORD are required to initialize the database.');
  process.exit(1);
}

const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

try {
  const schemaSql = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  const seedSql = await fs.readFile(new URL('./seed.sql', import.meta.url), 'utf8');

  await connection.query(schemaSql);
  await connection.query(seedSql);

  console.log('Database initialized successfully (schema + seed).');
} finally {
  await connection.end();
}
