import mysql from 'mysql2/promise';

import { config } from './config.js';

export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  maxIdle: config.database.connectionLimit,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  dateStrings: true,
  decimalNumbers: true,
});

export async function testDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}
