/**
 * Shared beforeAll/afterAll for DB, Redis, Socket. Import in test files so ts-jest transforms it.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { connectRedis, disconnectRedis } from '../config/redis.js';
import { initializeSocket } from '../socket/socketHandler.js';
import { httpServer } from '../app.js';

export async function globalSetup(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  initializeSocket(httpServer);
}

export async function globalTeardown(): Promise<void> {
  await disconnectDatabase();
  await disconnectRedis();
}
