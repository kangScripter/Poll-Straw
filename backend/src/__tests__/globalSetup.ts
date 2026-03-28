/**
 * Shared beforeAll/afterAll for DB, Redis, Socket. Import in test files so ts-jest transforms it.
 */
import { connectDatabase, disconnectDatabase } from '../config/database';
import { connectRedis, disconnectRedis } from '../config/redis';
import { initializeSocket } from '../socket/socketHandler';
import { httpServer } from '../app';

export async function globalSetup(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  initializeSocket(httpServer);
}

export async function globalTeardown(): Promise<void> {
  await disconnectDatabase();
  await disconnectRedis();
}
