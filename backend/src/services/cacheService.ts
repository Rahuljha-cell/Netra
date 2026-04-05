import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let connected = false;

const getClient = async (): Promise<RedisClientType | null> => {
  if (connected && client) return client;

  if (!process.env.REDIS_URL) return null;

  try {
    client = createClient({ url: process.env.REDIS_URL }) as RedisClientType;

    client.on('error', (err) => {
      console.warn('[Cache] Redis error:', err.message);
      connected = false;
    });

    client.on('connect', () => {
      connected = true;
    });

    await client.connect();
    return client;
  } catch (err) {
    console.warn('[Cache] Redis unavailable, using no-op cache');
    return null;
  }
};

export const cacheService = {
  async get(key: string): Promise<string | null> {
    try {
      const c = await getClient();
      if (!c) return null;
      return await c.get(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    try {
      const c = await getClient();
      if (!c) return;
      await c.set(key, value, { EX: ttlSeconds });
    } catch {
      // Silently fail - cache is optional
    }
  },

  async del(key: string): Promise<void> {
    try {
      const c = await getClient();
      if (!c) return;
      await c.del(key);
    } catch {
      // Silently fail
    }
  },

  async flush(): Promise<void> {
    try {
      const c = await getClient();
      if (!c) return;
      await c.flushDb();
    } catch {
      // Silently fail
    }
  },
};
