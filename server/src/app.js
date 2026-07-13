import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import { errorHandler, notFoundHandler } from './error-handler.js';
import { dashboardRouter } from './routes/dashboards.js';
import { healthRouter } from './routes/health.js';
import { proposalRouter } from './routes/proposals.js';

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
      facultyDashboard: '/api/dashboards/faculty/:facultyId',
      researchHeadDashboard: '/api/dashboards/research-head',
      proposals: '/api/proposals',
    },
  });
});

app.use('/api/health', healthRouter);
app.use('/api/dashboards', dashboardRouter);
app.use('/api/proposals', proposalRouter);

app.use(notFoundHandler);
app.use(errorHandler);
