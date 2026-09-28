import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { env } from './config/env.ts';
import { apiRouter } from './routes/index.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { swaggerRouter } from './config/swagger.ts';

export const createApp = () => {
  const app = express();

  // Helmet with relaxed content security policy for Swagger UI & React Vite dev
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Allow during dev/preview
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());

  // Health check endpoint (for docker & monitoring)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // Swagger Documentation
  app.use('/api-docs', swaggerRouter);

  // REST API v1
  app.use('/api/v1', apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
};
