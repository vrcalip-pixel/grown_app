import { z } from "zod";

/**
 * The reply checker. Every reply the model writes passes through here before a
 * person can see it. It is plain code with no AI in it, so it behaves the same
 * way every time. If a reply fails, the person gets a fixed line from the pack.
 */

/** What the model is asked to return. */
export const RawReply = z.object({
  type: z.enum(["answer", "no_amounts_or_dates", "off_pack"]),
  fact_ids: z.array(z.string()),
  text: z.string(),
});
export type RawReply = z.infer<typeof RawReply>;

export interface CheckContext {
  /** Facts the rules engine showed this person. The reply may cite only these. */
  allowedFacts: ReadonlySet<string>;
  /** Every verified word this person was shown, joined together. */
  corpus: string;
}

export type Verdict = { ok: true } | { ok: false; reason: string };

export const MAX_WORDS = 130;

const MONEY = /[$€£]|\b(dollars?|bucks|usd|cents?)\b/i;
const NUMBER = /\d+(?:[.,]\d+)*/g;
const TIME_PHRASE = /([\p{L}\p{N}'’-]+)\s+(days?|weeks?|months?|years?|hours?|minutes?)\b/giu;

const norm = (s: string) => s.toLowerCase().replace(/’/g, "'").replace(/\s+/g, " ");

export function checkReply(reply: RawReply, ctx: CheckContext): Verdict {
  // The other types are swapped for a fixed line, so their text is never shown.
  if (reply.type !== "answer") return { ok: true };

  const fail = (reason: string): Verdict => ({ ok: false, reason });
  const text = reply.text.trim();
  const corpus = norm(ctx.corpus);

  if (!text) return fail("empty answer");
  if (text.split(/\s+/).length > MAX_WORDS) return fail("answer too long");

  // 1. An answer has to stand on facts this person was shown.
  if (reply.fact_ids.length === 0) return fail("answer cites no fact");
  for (const id of reply.fact_ids) {
    if (!ctx.allowedFacts.has(id)) return fail(`cites a fact this person was not shown: ${id}`);
  }

  // 2. No money, ever. Grown doesn't show amounts.
  if (MONEY.test(text)) return fail("mentions money");

  // 3. Any number has to be one the verified text already contains.
  const known = new Set(corpus.match(NUMBER) ?? []);
  for (const n of text.match(NUMBER) ?? []) {
    if (!known.has(n)) return fail(`number not in verified text: ${n}`);
  }

  // 4. Any length of time ("a few weeks", "two days") has to appear in the
  //    verified text exactly as written.
  for (const m of text.matchAll(TIME_PHRASE)) {
    const phrase = norm(`${m[1]} ${m[2]}`);
    if (!corpus.includes(phrase)) return fail(`length of time not in verified text: ${phrase}`);
  }

  return { ok: true };
}

/** Plain copy only: no em dashes, no markdown. */
export function tidy(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
