import { Hono } from "hono";
import { cors } from "hono/cors";
const app = new Hono();
// CORS (allow local dev + your Vercel app). Adjust as needed.
app.use("*", cors({
    origin: (origin, c) => {
        const list = (c.env.CORS_ORIGINS ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        return list.length ? (list.includes(origin) ? origin : list[0]) : "*";
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
}));
app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));
// Variable delay util (uses await, not CPU)
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
// GET /api/delay/:seconds → wait N seconds then return JSON
app.get("/api/delay/:seconds", async (c) => {
    const seconds = Number(c.req.param("seconds"));
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 60) {
        return c.json({ error: "seconds must be 0..60" }, 400);
    }
    await wait(seconds * 1000);
    return c.json({ message: `Waited ${seconds}s`, ts: Date.now() });
});
// Widget delays (ms) mapped to ids 1..5
const WIDGET_DELAYS = {
    1: 800,
    2: 3000,
    3: 15000,
    4: 6000,
    5: 1000,
};
// GET /api/widgets/:id?userId=... → mock user-scoped payload
app.get("/api/widgets/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const userId = new URL(c.req.url).searchParams.get("userId") ?? "anon";
    const delay = WIDGET_DELAYS[id];
    if (!delay)
        return c.json({ error: "unknown widget id" }, 404);
    // Optional: emulate intermittent slowdowns by ±20%
    const jitter = Math.round(delay * (0.8 + Math.random() * 0.4));
    await wait(jitter);
    return c.json({
        widgetId: id,
        userId,
        delayMs: jitter,
        value: `Widget ${id} for ${userId}`,
        ts: Date.now(),
    }, 200);
});
// Example of user-specific cache hinting: Workers Cache is URL-keyed and public by default.
// We intentionally avoid caching user data at the edge here; let your Next proxy decide.
// If you want to demonstrate cache hits for public data, add Cache API usage here.
export default app;
