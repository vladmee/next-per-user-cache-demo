"use server";

import { headers } from "next/headers";

/**
 * Pre-warm per-user widget data
 * This populates KV so the dashboard can render from cache.
 */
export async function prewarmUserWidgets(userId: string) {
  if (!userId?.trim()) return;

  // Build an absolute base URL for server-side fetch
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
    `${proto}://${host}`;

  // Send the auth cookie explicitly for these server-side requests
  const cookie = `demo_uid=${encodeURIComponent(userId)}; Path=/; SameSite=Lax`;

  const ids = [1, 2, 3, 4, 5]; // This is mock. Basically a list of endpoints to hit.

  // Abort if upstream hangs too long (covers the 15s widget with buffer)
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);

  try {
    await Promise.allSettled(
      ids.map((id) => {
        fetch(`${base}/api/widget/${id}`, {
          // these are the Nextjs API routes
          method: "GET",
          headers: { cookie, accept: "application/json" },
          signal: ctrl.signal,
        });
      })
    );
  } finally {
    clearTimeout(timer);
  }
}
