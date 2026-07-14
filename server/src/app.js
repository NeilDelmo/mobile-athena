import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import { errorHandler, notFoundHandler } from './error-handler.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { dashboardRouter } from './routes/dashboards.js';
import { healthRouter } from './routes/health.js';
import { notificationRouter } from './routes/notifications.js';
import { proposalRouter } from './routes/proposals.js';
import { researchCallRouter } from './routes/research-calls.js';

export const app = express();

const allowedOrigins = config.corsOrigin === '*'
  ? '*'
  : config.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api', (request, response) => {
  response.json({
    name: 'ATHENA Research API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      chat: '/api/chat',
      facultyDashboard: '/api/dashboards/faculty',
      researchHeadDashboard: '/api/dashboards/research-head',
      proposals: '/api/proposals',
      researchCalls: '/api/research-calls',
      notifications: '/api/notifications',
    },
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/dashboards', dashboardRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/research-calls', researchCallRouter);

app.use(notFoundHandler);
app.use(errorHandler);
