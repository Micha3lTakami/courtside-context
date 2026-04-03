/**
 * Persistent cache layer — Upstash Redis in production, in-memory fallback for local dev.
 *
 * To enable Redis: add to .env.local:
 *   UPSTASH_REDIS_REST_URL=https://...
 *   UPSTASH_REDIS_REST_TOKEN=...
 *
 * Get free credentials at: https://console.upstash.com
 * Redis survives serverless cold starts, so every user hits warm cache.
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch { /* Redis unavailable — falling back to in-memory */ }

// In-memory fallback (local dev / no env vars)
const mem = new Map<string, { v: unknown; exp: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const val = await redis.get<T>(key);
      return val ?? null;
    } catch { /* fall through */ }
  }
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) { mem.delete(key); return null; }
  return hit.v as T;
}

export async function cacheSet(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, data, { ex: ttlSeconds });
      return;
    } catch { /* fall through */ }
  }
  mem.set(key, { v: data, exp: Date.now() + ttlSeconds * 1000 });
}
