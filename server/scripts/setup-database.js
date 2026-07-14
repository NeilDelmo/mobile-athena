import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import 'dotenv/config';
import mysql from 'mysql2/promise';

import { hashPassword } from '../src/auth-crypto.js';

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
  const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD ?? 'AthenaDemo2026!';
  const passwordHash = await hashPassword(demoPassword);
  await connection.query(
    `UPDATE \`${databaseName}\`.users
        SET password_hash = ?
      WHERE email LIKE '%@g.batstate-u.edu.ph'
        AND password_hash IS NULL`,
    [passwordHash],
  );
  console.log(`Database ${databaseName} is ready.`);
  console.log('University demo accounts are ready. Change DEMO_ACCOUNT_PASSWORD before sharing the server.');
} finally {
  await connection.end();
}
