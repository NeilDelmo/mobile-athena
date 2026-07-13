import { app } from './app.js';
import { config } from './config.js';
import { pool, testDatabaseConnection } from './database.js';

try {
  await testDatabaseConnection();
} catch (error) {
  console.error('Unable to connect to MySQL. Start MySQL in Laragon and run npm run db:setup.');
  console.error(error.message);
  process.exit(1);
}

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`ATHENA API listening on http://localhost:${config.port}/api`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing ATHENA API.`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
