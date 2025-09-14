import { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'handygh:',
};

export default redisConfig;