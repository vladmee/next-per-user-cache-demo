# Per-user Cache in Nextjs

**Per-user caching** for a dashboard with 5 independent “widgets” (modules).

- _client_ : Next.js app (Vercel)
- _server_ : Hono Cloudflare Worker (mock API)

## Server (Cloudflare Worker)

Hono app that simulates endpoints with different delays. Each requires a `userId` and returns user-scoped data:

- `GET /api/widgets/:id?userId=...`
  - `id ∈ {1,2,3,4,5}` with artificial delays (e.g. 1s, 3s, 15s, 6s, 1s).

## Client (Nextjs)

It has a **fake sign-in** where you only have to enter a username (any string).

It redirects to **dashboard** where it displays 5 modules loading independent data.

### How the data flow works

- Each module fetches `GET /api/widget/[id]` (Nextjs route), not the server directly.
- The route:
  - calls the server,
  - **caches the user data in a KV** (can be any database) with a TTL (default: 10 minutes),
  - returns the data.
- On subsequent visits (within TTL) it serves **cached** data instantly and **revalidates in the background**.

### Why it feels fast

- When the user signs in, it **prewarms** the data: fires all 5 API calls server-side to seed the KV cache ASAP.
- Widgets are individual, they load as soon as they are ready. Errors don't block.
- And each individual widget:
  1. shows a **module loading** fallback while its JS chunk loads,
  2. shows a **Suspense fallback** while data fetch runs,
  3. renders data; if the API ever errors, an error fallback can be shown without affecting the other modules.

If the data is cached already (within the TTL) it feels instant.

## Env & setup

- `MOCK_API` — your Cloudflare Worker URL, e.g. `https://mock-api.<acct>.workers.dev`
- `ENABLE_KV=true` — turn on KV writes
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash (Vercel Marketplace)

## Details

- **TTL** is per user (default 10m; adjust to your traffic/budget).
- **Prewarm** slightly increases request volume but improves first view after login.
- **Prefetch** is really optional, more of a way to prioritize what data you want first.

## Files to check

`client/src/`

- `app/api` here is the proxy route that handles the caching
- `lib/kv.ts` interaction with the KV
- `app/actions.ts` prewarm by calling all routes after a successful sign in
- `dashboard/loading.tsx` this is the loading state shown before the modules are imported
- `components/widgets-grid.tsx` where all the modules are loaded (dynamic, suspense, error)
- `components/widgets/w*.tsx` example of a module, and `useSuspenseQuery` handling the data fetch
- `dashboard/page.tsx` prefetch
