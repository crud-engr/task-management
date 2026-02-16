import { createApp } from './app';
import { appConfig, sequelize, redis } from './config';

const app = createApp();

async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
  } catch (err) {
    console.warn('Database connection failed:', (err as Error).message);
  }

  app.listen(appConfig.port, () => {
    console.log(`Server running on http://localhost:${appConfig.port}`);
    console.log(`Environment: ${appConfig.nodeEnv}`);
  });
}

function gracefulShutdown(signal: string): void {
  console.log(`${signal} received. Shutting down gracefully.`);
  sequelize.close().then(() => console.log('Database connection closed'));
  redis.quit().then(() => console.log('Redis connection closed'));
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
