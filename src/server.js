require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const { startAutoRenewalJob } = require('./modules/subscriptions/subscriptions.cron');

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to database');

    startAutoRenewalJob();

    const server = app.listen(env.PORT, () => {
      console.log(`[SERVER] Running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal) => {
      console.log(`[SERVER] ${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
};

start();
