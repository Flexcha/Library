import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().default('postgresql://admin@localhost:5432/library_db'),
  JWT_SECRET: z.string().default('super-secret-jwt-key-for-development-only-change-in-prod-123456789'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  LOAN_DEFAULT_PERIOD_DAYS: z.string().default('14').transform((val) => parseInt(val, 10)),
  LOAN_MAX_RENEWALS: z.string().default('2').transform((val) => parseInt(val, 10)),
  FINE_DAILY_RATE: z.string().default('5000').transform((val) => parseFloat(val)),
  FINE_MAX_UNPAID_BEFORE_BLOCK: z.string().default('50000').transform((val) => parseFloat(val)),
  RESERVATION_PICKUP_WINDOW_DAYS: z.string().default('3').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
