type Client = {
  get<T = unknown>(k: string): Promise<T | null>;
  set<T = unknown>(k: string, v: T, opts?: { ex?: number }): Promise<void>;
} | null;

let upstashClient: Client = null;

async function getUpstash(): Promise<Client> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  if (!upstashClient) {
    const { Redis } = await import("@upstash/redis");
    const client = new Redis({ url, token });
    upstashClient = {
      async get<T>(k: string) {
        const v = await client.get<T>(k);
        return (v as T) ?? null;
      },
      async set<T>(k: string, v: T, opts?: { ex?: number }) {
        await client.set(k, v as unknown, opts?.ex ? { ex: opts.ex } : {});
      },
    };
  }
  return upstashClient;
}

// In-memory fallback (mostly for dev)
const mem = new Map<string, { value: unknown; exp: number }>();

export async function kvGet<T>(key: string): Promise<T | null> {
  const c = await getUpstash();
  if (c) {
    try {
      return (await c.get<T>(key)) ?? null;
    } catch {
      /* just fail silently because we have a fallback */
      console.warn("--- using the in-memory cache ---");
    }
  }
  const row = mem.get(key);
  if (!row) return null;
  if (row.exp && row.exp < Date.now()) {
    mem.delete(key);
    return null;
  }
  return row.value as T;
}

export async function kvSet<T>(key: string, value: T, ttlSec = 600) {
  const c = await getUpstash();
  if (c) {
    try {
      await c.set<T>(key, value, { ex: ttlSec });
      return;
    } catch {}
  }
  mem.set(key, { value, exp: Date.now() + ttlSec * 1000 });
}
