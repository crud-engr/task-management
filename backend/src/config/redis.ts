import Redis from 'ioredis';
import { redisConfig } from './env';

export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  db: redisConfig.db ?? 0,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

export async function testRedisConnection(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
