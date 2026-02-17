import './models';
import { createApp } from './app';
import { appConfig, sequelize, redis } from './config';
import { migrateAll } from './database/migrations';
import { appQueue, setupJobProcessor } from './jobs';

const app = createApp();

function getTenantSchemas(): string[] {
  const raw = process.env.TENANT_SCHEMAS;
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    const tenantSchemas = getTenantSchemas();
    const { global: globalRan, tenants: tenantRan } = await migrateAll(tenantSchemas);
    if (globalRan.length) console.log('Migrations (global):', globalRan.join(', '));
    for (const [schema, ran] of Object.entries(tenantRan)) {
      if (ran.length) console.log(`Migrations (${schema}):`, ran.join(', '));
    }
  } catch (err) {
    console.warn('Database connection failed:', (err as Error).message);
  }

  setupJobProcessor();

  app.listen(appConfig.port, () => {
    console.log(`Server running on http://localhost:${appConfig.port}`);
    console.log(`Environment: ${appConfig.nodeEnv}`);
  });
}

function gracefulShutdown(signal: string): void {
  console.log(`${signal} received. Shutting down gracefully.`);
  appQueue
    .close()
    .then(() => console.log('Bull queue closed'))
    .catch((err) => console.warn('Queue close error:', (err as Error).message));
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
