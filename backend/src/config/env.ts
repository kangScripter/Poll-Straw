import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:8081'),

  /** Public base URL for shared poll links (no trailing slash), e.g. https://share.pollstraw.com */
  SHARE_POLL_BASE_URL: z.string().url().default('https://share.pollstraw.com'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/** CORS in production: web app + share poll landing (if different host) */
export function getProductionCorsOrigins(): string | string[] {
  try {
    const shareOrigin = new URL(env.SHARE_POLL_BASE_URL).origin;
    const front = env.FRONTEND_URL.trim();
    if (shareOrigin === front) return front;
    return [front, shareOrigin];
  } catch {
    return env.FRONTEND_URL;
  }
}
