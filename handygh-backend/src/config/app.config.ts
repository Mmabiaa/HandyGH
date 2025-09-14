import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  S3_BUCKET: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_PROVIDER_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  redisUrl: parsedEnv.data.REDIS_URL,
  s3: {
    bucket: parsedEnv.data.S3_BUCKET,
    region: parsedEnv.data.S3_REGION,
    accessKeyId: parsedEnv.data.S3_ACCESS_KEY_ID,
    secretAccessKey: parsedEnv.data.S3_SECRET_ACCESS_KEY,
  },
  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    expiration: parsedEnv.data.JWT_EXPIRATION,
    refreshExpiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  },
  smsProvider: {
    apiKey: parsedEnv.data.SMS_PROVIDER_API_KEY,
    url: parsedEnv.data.SMS_PROVIDER_URL,
  },
};

export default config;