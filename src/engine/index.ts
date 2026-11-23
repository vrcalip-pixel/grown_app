import type { Cond, LivePack, Localized, Parts } from "@/pack/schema";

/**
 * The rules engine. Pure and deterministic: the same pack, answers and date
 * always give the same result. Nothing here knows about traffic tickets, and
 * nothing here generates text. Every word in a Result comes from the pack.
 */

export type Answers = Record<string, string>;
export type Lang = "en" | "es";
export type Fit = "good" | "no" | "none";

export interface ResultSource {
  id: string;
  title: string;
  url: string;
  covers: string;
}

export interface Result {
  branch: string;
  urgent: { tone: "warn" | "urgent"; title: string; body: string[] }[];
  nextMove: { text: string; why?: string; link?: { label: string; url: string } };
  whatThisIs: { lead: string; detail: string };
  showDate: boolean;
  options: {
    id: string;
    title: string;
    fit: Fit;
    short: string;
    body: string;
    source?: { title: string; url: string };
  }[];
  watchOut: string[];
  /** Built-in questions that apply to this person, each with its author-written answer. */
  faq: { id: string; question: string; text: string; sources: { title: string; url: string }[] }[];
  sources: ResultSource[];
  /** Ids of the verified facts behind what is shown. The AI layer may speak only from these. */
  facts: string[];
}

export interface Options {
  lang?: Lang;
  /** Injected so tests can pin the date. Used only to check operative dates. */
  today?: Date;
}

export function test(cond: Cond | undefined, answers: Answers, defs: LivePack["defs"] = {}): boolean {
  if (!cond) return true;
  if ("ref" in cond) return test(defs[cond.ref], answers, defs);
  if ("all" in cond) return cond.all.every((c) => test(c, answers, defs));
  if ("any" in cond) return cond.any.some((c) => test(c, answers, defs));
  if ("not" in cond) return !test(cond.not, answers, defs);
  const a = answers[cond.q];
  if (a === undefined) return false;
  return "eq" in cond ? a === cond.eq : cond.in.includes(a);
}

/** The questions this person should be asked, given what they have said so far. */
export function visibleQuestions(pack: LivePack, answers: Answers): LivePack["questions"] {
  return pack.questions.filter((q) => test(q.show_when, answers, pack.defs));
}

/** Drops answers to questions that are no longer asked, so a changed answer can't leave a stale one behind. */
export function cleanAnswers(pack: LivePack, answers: Answers): Answers {
  const kept: Answers = {};
  for (const q of pack.questions) {
    const a = answers[q.id];
    if (a !== undefined && test(q.show_when, kept, pack.defs) && q.answers.some((x) => x.id === a)) {
      kept[q.id] = a;
    }
  }
  return kept;
}

export function isComplete(pack: LivePack, answers: Answers): boolean {
  const clean = cleanAnswers(pack, answers);
  return visibleQuestions(pack, clean).every((q) => clean[q.id] !== undefined);
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function resolve(pack: LivePack, rawAnswers: Answers, opts: Options = {}): Result {
  const lang = opts.lang ?? "en";
  const today = isoDay(opts.today ?? new Date());
  const answers = cleanAnswers(pack, rawAnswers);
  const ok = (c: Cond | undefined) => test(c, answers, pack.defs);

  const factById = new Map(pack.facts.map((f) => [f.id, f]));
  const usedFacts = new Set<string>();
  const usedSources = new Set<string>(pack.base_sources ?? []);

  /** A block counts only if its rule matches and every fact it cites is in effect today. */
  const live = (b: { when?: Cond; facts?: string[] }) =>
    ok(b.when) &&
    (b.facts ?? []).every((id) => {
      const f = factById.get(id);
      return !!f && (f.operative_date === "in_effect_at_verification" || f.operative_date <= today);
    });
  const cite = (b: { facts?: string[] }) => {
    for (const id of b.facts ?? []) {
      usedFacts.add(id);
      usedSources.add(factById.get(id)!.source);
    }
  };

  const vars: Record<string, string> = {};
  const pick = (l: Localized) => (lang === "es" && l.es ? l.es : l.en);
  for (const [name, list] of Object.entries(pack.vars ?? {})) {
    const hit = list.find((v) => ok(v.when));
    if (hit) vars[name] = pick(hit.text);
  }
  const t = (l: Localized) => pick(l).replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  const join = (p: Parts) =>
    Array.isArray(p)
      ? p
          .filter((x) => ok(x.when))
          .map((x) => t(x.text))
          .join(" ")
      : t(p);

  const branch = pack.branches.find((b) => ok(b.when));
  if (!branch) throw new Error(`Pack "${pack.id}" has no branch for these answers`);

  const what = branch.what.find(live);
  const next = branch.next_move.find(live);
  if (!what || !next) throw new Error(`Branch "${branch.id}" has no content in effect for these answers`);
  cite(what);
  cite(next);
  if (next.link) usedSources.add(next.link);

  const urgent = (branch.urgent ?? []).filter(live);
  const options = (branch.options ?? []).filter(live);
  const watch = (branch.watch_out ?? []).filter(live);
  [...urgent, ...options, ...watch].forEach(cite);
  for (const o of options) if (o.source) usedSources.add(o.source);

  // Built-in questions. Their facts are not added to the plan's source list:
  // that list covers what is on the page, and these appear only when tapped.
  const faq = (pack.guide?.builtin ?? []).filter(live).map((b) => {
    const cited = new Set((b.from_next_move ? next.facts ?? [] : b.facts ?? []).map((id) => factById.get(id)!.source));
    return {
      id: b.id,
      question: t(b.question),
      text: b.from_next_move ? [t(next.text), next.why ? t(next.why) : ""].filter(Boolean).join(" ") : join(b.text!),
      sources: Object.entries(pack.sources)
        .filter(([id]) => cited.has(id))
        .map(([, s]) => ({ title: s.title, url: s.url })),
    };
  });

  const linkSource = next.link ? pack.sources[next.link] : undefined;

  return {
    branch: branch.id,
    urgent: urgent.map((u) => ({ tone: u.tone, title: t(u.title), body: u.body.map(t) })),
    nextMove: {
      text: t(next.text),
      why: next.why ? t(next.why) : undefined,
      link: linkSource
        ? { label: linkSource.open_label ? t(linkSource.open_label) : linkSource.title, url: linkSource.url }
        : undefined,
    },
    whatThisIs: { lead: t(what.lead), detail: join(what.detail) },
    showDate: typeof branch.show_date === "boolean" ? branch.show_date : ok(branch.show_date),
    options: options.map((o) => ({
      id: o.id,
      title: t(o.title),
      fit: (o.fit ?? []).find((f) => ok(f.when))?.value ?? "none",
      short: t(o.short),
      body: join(o.body),
      source: o.source ? { title: pack.sources[o.source].title, url: pack.sources[o.source].url } : undefined,
    })),
    watchOut: watch.map((w) => t(w.text)),
    faq,
    // Listed in the order the pack declares them, so the list is stable.
    sources: Object.entries(pack.sources)
      .filter(([id]) => usedSources.has(id))
      .map(([id, s]) => ({ id, title: s.title, url: s.url, covers: t(s.covers) })),
    facts: [...usedFacts],
  };
}

/** Whole days from today until the date typed off the paper. Negative means it passed. */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const d = new Date(`${isoDate}T00:00:00`);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 864e5);
}
