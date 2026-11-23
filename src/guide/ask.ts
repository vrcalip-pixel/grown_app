import { cleanAnswers, isComplete, resolve, visibleQuestions, type Answers, type Result } from "@/engine";
import type { LivePack } from "@/pack/schema";
import { checkReply, tidy, type CheckContext, type RawReply } from "./check";

/**
 * Grown Guide: answers a person's question about their own result.
 *
 * The split that matters: the rules engine decides what is true for this
 * person, and the model only rewords it. The model sees nothing but the facts
 * and text the engine already showed, and its reply is checked by plain code
 * before anyone reads it.
 */

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

export interface GuideReply {
  kind: "answer" | "no_amounts_or_dates" | "off_pack" | "blocked" | "unavailable";
  text: string;
  sources: { title: string; url: string }[];
}

/** The model call, injected so tests can stand in for the model. */
export type ModelCaller = (system: string, turns: Turn[]) => Promise<RawReply | "refused">;

export const LIMITS = { maxTurns: 12, maxChars: 500 };

function resultText(r: Result): string[] {
  return [
    r.nextMove.text,
    r.nextMove.why ?? "",
    r.whatThisIs.lead,
    r.whatThisIs.detail,
    ...r.urgent.flatMap((u) => [u.title, ...u.body]),
    ...r.options.flatMap((o) => [o.title, o.short, o.body]),
    ...r.watchOut,
  ].filter(Boolean);
}

export function buildContext(pack: LivePack, answers: Answers) {
  const result = resolve(pack, answers);
  const facts = pack.facts.filter((f) => result.facts.includes(f.id));
  const check: CheckContext = {
    allowedFacts: new Set(result.facts),
    corpus: [...facts.map((f) => f.claim.en), ...resultText(result)].join("\n"),
  };

  const said = visibleQuestions(pack, answers)
    .map((q) => `- ${q.text.en} -> ${q.answers.find((a) => a.id === answers[q.id])?.label.en ?? "(no answer)"}`)
    .join("\n");

  const system = `You are Grown Guide, part of Grown, a free tool that helps young adults understand an official paper (here, a California traffic ticket) when they have no one to ask. Many are stressed, and some are reading for a parent. You sound like a calm older sibling who has done this before: warm, plain, brief, never joking about legal risk.

Your one job is to help this person understand the plan Grown already gave them. A rules engine built that plan from facts a person checked against official sources. You explain and reword those facts. You do not add to them, because in testing an earlier assistant invented a deadline, fee figures and a processing time that were wrong, and people act on what they read here.

So:
- Use only the VERIFIED FACTS and THE PLAN below. If the answer is not there, do not use what you know from elsewhere, even if you are sure.
- Never give a dollar amount, a fee, a number of days or weeks, a deadline, or how long something takes, unless that exact wording is in the verified facts. If the person asks for one, reply with type "no_amounts_or_dates".
- If the question is about anything else you can't answer from below (immigration, insurance prices, another kind of paper, whether they will win, what a lawyer would do), reply with type "off_pack". This is the right answer, not a failure.
- Otherwise reply with type "answer". List in fact_ids the ids of the facts your answer rests on. Every answer rests on at least one.
- Keep an answer under 80 words, in short everyday sentences a 14-year-old could follow. No lists, no headings, no markdown, no em dashes. Don't use numbers or lengths of time that aren't in the facts.
- If the person sounds scared or overwhelmed, slow down: shorter sentences, lead with the one next move, and say plainly that this is fixable when the plan supports that.
- You are not a lawyer and this is not legal advice. Don't tell the person what a court will decide.
- For "type" values other than "answer", leave text empty. Grown shows its own fixed wording.

WHAT THIS PERSON TOLD GROWN
${said}

THE PLAN GROWN GAVE THEM
Next move: ${result.nextMove.text}
${result.nextMove.why ? `Why: ${result.nextMove.why}` : ""}
What this is: ${result.whatThisIs.lead} ${result.whatThisIs.detail}
${result.urgent.map((u) => `Urgent: ${u.title} ${u.body.join(" ")}`).join("\n")}
${result.options.map((o) => `Option, ${o.title}: ${o.short} ${o.body}`).join("\n")}
${result.watchOut.map((w) => `Watch out: ${w}`).join("\n")}

VERIFIED FACTS (cite by id)
${facts.map((f) => `[${f.id}] ${f.claim.en}`).join("\n")}`;

  return { result, system, check };
}

export function validRequest(pack: LivePack, answers: unknown, turns: unknown): turns is Turn[] {
  if (!answers || typeof answers !== "object" || !Array.isArray(turns)) return false;
  const a = answers as Answers;
  if (Object.values(a).some((v) => typeof v !== "string")) return false;
  if (!isComplete(pack, a) || Object.keys(cleanAnswers(pack, a)).length === 0) return false;
  if (turns.length === 0 || turns.length > LIMITS.maxTurns) return false;
  return (
    turns.every(
      (t, i) =>
        t &&
        typeof t.text === "string" &&
        t.text.trim().length > 0 &&
        t.text.length <= LIMITS.maxChars &&
        t.role === (i % 2 === 0 ? "user" : "assistant"),
    ) && turns[turns.length - 1].role === "user"
  );
}

export async function askGuide(pack: LivePack, answers: Answers, turns: Turn[], call: ModelCaller): Promise<GuideReply> {
  const lines = pack.guide?.lines;
  if (!lines) throw new Error(`Pack "${pack.id}" has no guide section`);
  const handoff = pack.sources[pack.guide!.handoff_source];
  const fixed = (kind: GuideReply["kind"], withHandoff = false): GuideReply => ({
    kind,
    text: lines[kind as keyof typeof lines].en,
    sources: withHandoff ? [{ title: handoff.title, url: handoff.url }] : [],
  });

  const { system, check } = buildContext(pack, cleanAnswers(pack, answers));

  let raw: RawReply | "refused";
  try {
    raw = await call(system, turns);
  } catch {
    return fixed("unavailable");
  }
  if (raw === "refused") return fixed("blocked");
  if (raw.type === "no_amounts_or_dates") return fixed("no_amounts_or_dates");
  if (raw.type === "off_pack") return fixed("off_pack", true);

  const cleaned = { ...raw, text: tidy(raw.text) };
  if (!checkReply(cleaned, check).ok) return fixed("blocked");

  const sourceIds = new Set(pack.facts.filter((f) => cleaned.fact_ids.includes(f.id)).map((f) => f.source));
  return {
    kind: "answer",
    text: cleaned.text,
    sources: Object.entries(pack.sources)
      .filter(([id]) => sourceIds.has(id))
      .map(([, s]) => ({ title: s.title, url: s.url })),
  };
}
