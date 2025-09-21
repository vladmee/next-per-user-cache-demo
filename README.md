# Per-user Cache in Nextjs

/client # Next.js app (Vercel)
/server # Hono Cloudflare Worker (mock API)

- **Per-user caching** for a dashboard with 5 independent “widgets” (modules).

---

## Server (Cloudflare Worker)

Hono app that simulates endpoints with different delays. Each requires a `userId` (query string) and returns user-scoped data.

- `GET /api/widgets/:id?userId=...`
  - `id ∈ {1,2,3,4,5}` with artificial delays (e.g. 1s, 3s, 15s, 6s, 1s).

---

## Client (Nextjs)

It has a **Fake sign-in** where you only have to enter a username (any string).

It redirect to **Dashboard** where there're 5 widgets.

### How the data flow works

- Widgets fetch `GET /api/widget/[id]` (Nextjs route), not the server directly.
- The route:
  - calls the server,
  - **writes to KV** with a TTL (default: 10 minutes),
  - returns the data.
- On subsequent visits (within TTL) it serves **cached** data instantly and **revalidates in background**.

### Why it feels fast

When the user signs in:

- Navigates to `loading.tsx` first and doesn't wait for the modules to load.
- It **prewarms**, fires all 5 API calls server-side to seed the KV cache ASAP.
- Widgets are individual, load as soon as they are ready. Errors don't block.
- And each individual widget:
  1. shows a **module loading** fallback while its JS chunk loads,
  2. shows a **Suspense fallback** while data fetch runs,
  3. renders data; if the API ever errors, an error fallback can be shown without affecting the other modules.

If the data is cached already (within the TTL) most of these steps are skipped.

The prewarm helps. And also there is a prefetch at the dashboard level as a way to prioritize one or more of the modules. If the data is fetched and added in the client cache before the module hits the fetch in useSuspense it won't even fire another fetch it will directly render the data.

---

## Env & setup

### Client (Vercel)

- `MOCK_API` — your Cloudflare Worker URL, e.g. `https://mock-api.<acct>.workers.dev`
- `ENABLE_KV=true` — turn on KV writes/reads
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash (Vercel Marketplace)

### Server (Cloudflare)

- Standard Hono + Wrangler project in `/server`.
- Optional: `ALLOWED_ORIGINS` for CORS (if the browser talks to the Worker directly).

---

## Details

- **TTL** is per user (default 10m; adjust to your traffic/budget).
- **Prewarm** slightly increases request volume but improves first view after login.
- **Prefetch** is really optional, more of a way to prioritize what data you want first.

---

## Local dev

Terminal 1

cd server
wrangler dev --local

Terminal 2

cd client

.env.local:
MOCK_API=http://127.0.0.1:8787
ENABLE_KV=false (or true with valid Upstash creds)

npm run dev

Open `http://localhost:3000`, sign in with any username, and watch widgets resolve at different times. Refresh within TTL to see instant cached data + background refresh. Enjoy!
