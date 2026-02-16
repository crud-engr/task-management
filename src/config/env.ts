import dotenv from 'dotenv';
import path from 'path';
import type { AppConfig, DatabaseConfig, RedisConfig } from '../interfaces';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return parsed;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

export const appConfig: AppConfig = {
  env: getEnv('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
};

export const databaseConfig: DatabaseConfig = {
  host: getEnv('DB_HOST', 'localhost'),
  port: getEnvNumber('DB_PORT', 5432),
  name: getEnv('DB_NAME', 'task_management'),
  user: getEnv('DB_USER', 'postgres'),
  password: getEnv('DB_PASSWORD', ''),
  dialect: 'postgres',
  logging: getEnvBool('DB_LOGGING', false),
};

export const redisConfig: RedisConfig = {
  host: getEnv('REDIS_HOST', 'localhost'),
  port: getEnvNumber('REDIS_PORT', 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  db: getEnvNumber('REDIS_DB', 0),
};
