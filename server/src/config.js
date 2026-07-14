import 'dotenv/config';

function readInteger(name, fallback) {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readInteger('PORT', 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  ai: {
    provider: process.env.AI_PROVIDER ?? 'groq',
    apiKey: process.env.GROQ_API_KEY ?? '',
    model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
    baseUrl: (process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1').replace(/\/+$/, ''),
    timeoutMs: readInteger('AI_TIMEOUT_MS', 30000),
  },
  database: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: readInteger('DB_PORT', 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'athena_research',
    connectionLimit: readInteger('DB_CONNECTION_LIMIT', 10),
  },
};
