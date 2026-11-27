import { NextResponse } from "next/server";
import { askGuide, validRequest } from "@/guide/ask";
import { callClaude, guideAvailable } from "@/guide/model";
import { loadPack } from "@/pack/load";

/**
 * The only server endpoint in Explainer. It receives a person's answers and their
 * question, asks the model, checks the reply, and returns it. Nothing in the
 * request is written to a log, a file or a database.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A simple brake on abuse: a few questions per visitor per window. The address
// is held in memory only for the length of the window and is never stored.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const seen = new Map<string, number[]>();

function allowed(key: string): boolean {
  const now = Date.now();
  const recent = (seen.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    seen.set(key, recent);
    return false;
  }
  recent.push(now);
  seen.set(key, recent);
  if (seen.size > 5000) {
    for (const [k, v] of seen) if (v.every((t) => now - t >= WINDOW_MS)) seen.delete(k);
  }
  return true;
}

/** Lets the page hide "Ask Explainer" when no key is set, without revealing anything else. */
export function GET() {
  return NextResponse.json({ available: guideAvailable() });
}

export async function POST(req: Request) {
  const pack = loadPack("traffic-ticket-long-beach");
  if (pack.status !== "live" || !pack.guide) return NextResponse.json({ error: "no guide" }, { status: 404 });
  const unavailable = { kind: "unavailable", text: pack.guide.lines.unavailable.en, sources: [] };

  if (!guideAvailable()) return NextResponse.json(unavailable, { status: 503 });

  const visitor = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!allowed(visitor)) return NextResponse.json(unavailable, { status: 429 });

  let body: { answers?: unknown; turns?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!validRequest(pack, body.answers, body.turns)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const reply = await askGuide(pack, body.answers as Record<string, string>, body.turns, callClaude);
  return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
}
