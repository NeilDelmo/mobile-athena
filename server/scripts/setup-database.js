import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import 'dotenv/config';
import mysql from 'mysql2/promise';

const databaseName = process.env.DB_NAME ?? 'athena_research';

if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME may contain only letters, numbers, and underscores.');
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(currentDirectory, '../database/schema.sql');
const schema = (await fs.readFile(schemaPath, 'utf8')).replaceAll('{{DB_NAME}}', databaseName);

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  multipleStatements: true,
});

try {
  await connection.query(schema);
  console.log(`Database ${databaseName} is ready.`);
} finally {
  await connection.end();
}
