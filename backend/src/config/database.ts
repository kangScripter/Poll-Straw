import { PrismaClient } from '@prisma/client';
import { env, isDevelopment, isTest } from './env.js';

// Create Prisma client with logging in development
export const prisma = new PrismaClient({
  log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (isTest) {
      throw error;
    }
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📤 Database disconnected');
}
