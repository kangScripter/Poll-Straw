import { Redis } from 'ioredis';
import { env, isDevelopment } from './env.js';

// Create Redis client
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error: Error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  if (isDevelopment) {
    console.log('📤 Redis connection closed');
  }
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error: unknown) {
    console.error('❌ Redis connection failed:', error);
    // Redis is optional for basic functionality
    console.log('⚠️ Continuing without Redis...');
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}

// Helper functions for common Redis operations
export const redisHelpers = {
  // Vote duplicate prevention
  async hasVoted(pollId: string, identifier: string, type: 'ip' | 'session' | 'device'): Promise<boolean> {
    const key = `vote:${pollId}:${type}:${identifier}`;
    const exists = await redis.exists(key);
    return exists === 1;
  },

  async markVoted(pollId: string, identifier: string, type: 'ip' | 'session' | 'device', ttl: number = 86400): Promise<void> {
    const key = `vote:${pollId}:${type}:${identifier}`;
    await redis.setex(key, ttl, '1');
  },

  // Poll results caching
  async getCachedResults(pollId: string): Promise<string | null> {
    return redis.get(`poll:${pollId}:results`);
  },

  async cacheResults(pollId: string, results: object, ttl: number = 5): Promise<void> {
    await redis.setex(`poll:${pollId}:results`, ttl, JSON.stringify(results));
  },

  async invalidateResults(pollId: string): Promise<void> {
    await redis.del(`poll:${pollId}:results`);
  },

  // Real-time pub/sub
  async publishVoteUpdate(pollId: string, data: object): Promise<void> {
    await redis.publish(`poll:${pollId}`, JSON.stringify(data));
  },
};
