import { config } from 'dotenv';

config();

const envConfig = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  S3_BUCKET: process.env.S3_BUCKET || '',
  S3_REGION: process.env.S3_REGION || '',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  OTP_EXPIRATION: process.env.OTP_EXPIRATION || '5m',
  SMS_PROVIDER_API_KEY: process.env.SMS_PROVIDER_API_KEY || '',
  SMS_PROVIDER_URL: process.env.SMS_PROVIDER_URL || '',
};

export default envConfig;