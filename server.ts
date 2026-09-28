import { createApp } from './src/app.ts';
import { env } from './src/config/env.ts';
import { prisma } from './src/config/prisma.ts';
import { seedDatabase } from './prisma/seed.ts';
import { registerCirculationJobs } from './src/modules/circulation/scheduledJobs.ts';
import { registerReservationJobs } from './src/modules/reservation/scheduledJobs.ts';
import { registerNotificationJobs } from './src/modules/notification/scheduledJobs.ts';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';
import fs from 'fs';

async function bootstrap() {
  // Ensure database has rich demo data
  try {
    const bookCount = await prisma.book.count();
    if (bookCount < 20) {
      console.log('Seeding comprehensive library demo data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('Error during auto-seed check:', err);
  }

  const app = createApp();

  // Register scheduled background tasks
  registerCirculationJobs();
  registerReservationJobs();
  registerNotificationJobs();

  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    // Vite middleware for development HMR & frontend serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from Vite build in production
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
    console.log(`API endpoints available at http://0.0.0.0:${port}/api/v1`);
    console.log(`Swagger documentation at http://0.0.0.0:${port}/api-docs`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
