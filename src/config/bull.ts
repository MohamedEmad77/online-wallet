import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

const config = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  database: Number(process.env.REDIS_DATABASE) || 9,
  attempts: Number(process.env.REDIS_FAILURE_ATTEMPTS) || 5,
};

export default registerAs('bull', () => config);
