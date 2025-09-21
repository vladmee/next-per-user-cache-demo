import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "../../../../lib/auth";
import { kvGet, kvSet } from "../../../../lib/kv";

export const runtime = "nodejs";

const TTL = 600; // 10m TTL per user

const kvEnabled =
  String(process.env.ENABLE_KV ?? "").toLowerCase() === "1" ||
  String(process.env.ENABLE_KV ?? "").toLowerCase() === "true";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await requireSession().catch(() => ({
    userId: undefined,
  }));
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (![1, 2, 3, 4, 5].includes(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const kvKey = `u:${userId}:w:${id}`;

  // Try warm cache first — only if KV is enabled.
  const cached = kvEnabled
    ? await kvGet<{ value: string; ts: number }>(kvKey)
    : null;

  console.log({ cached });
  if (cached) {
    // Fire background refresh
    refresh(id, userId, kvKey).catch(() => {});
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, max-age=5" },
    });
  }

  try {
    const fresh = await compute(id, userId);
    if (kvEnabled) {
      await kvSet(kvKey, fresh, TTL);
    }
    return NextResponse.json(fresh, {
      headers: { "Cache-Control": "private, max-age=5" },
    });
  } catch (err: unknown) {
    console.error("Widget upstream failed", { id, err: String(err) });

    // Degraded fallback (still 200) so UI can render something
    return NextResponse.json(
      {
        value: `Widget ${id} (degraded)`,
        ts: Date.now(),
        note: "upstream_failed",
      },
      { headers: { "Cache-Control": "private, max-age=5" } }
    );
  }
}

async function refresh(id: number, userId: string, kvKey: string) {
  try {
    const fresh = await compute(id, userId);
    await kvSet(kvKey, fresh, TTL);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
}

async function compute(id: number, userId: string) {
  const base = process.env.MOCK_API;
  if (!base) throw new Error("MOCK_API env is not set");

  const url = `${base.replace(
    /\/$/,
    ""
  )}/api/widgets/${id}?userId=${encodeURIComponent(userId)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) throw new Error(`Mock API ${resp.status}`);
    const json = (await resp.json()) as { value?: string; ts?: number };
    return {
      value: json.value ?? `Widget ${id} for ${userId}`,
      ts: json.ts ?? Date.now(),
    };
  } finally {
    clearTimeout(timeout);
  }
}
