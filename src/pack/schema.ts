import { z } from "zod";

/**
 * Guide-pack schema. A pack is content as data: questions, branch rules,
 * result blocks, and the verified facts every block has to cite.
 * The engine in src/engine reads packs; nothing here is guide-specific.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

/** Every user-facing string. Spanish may be null until a human has reviewed it. */
export const Localized = z
  .object({ en: z.string().min(1), es: z.string().min(1).nullable().optional() })
  .strict();
export type Localized = z.infer<typeof Localized>;

export type Cond =
  | { q: string; eq: string }
  | { q: string; in: string[] }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond }
  | { ref: string };

export const Cond: z.ZodType<Cond> = z.lazy(() =>
  z.union([
    z.object({ q: z.string(), eq: z.string() }).strict(),
    z.object({ q: z.string(), in: z.array(z.string()).min(1) }).strict(),
    z.object({ all: z.array(Cond).min(1) }).strict(),
    z.object({ any: z.array(Cond).min(1) }).strict(),
    z.object({ not: Cond }).strict(),
    z.object({ ref: z.string() }).strict(),
  ]),
);

/** Longer text: one string, or sentences that each appear only when their rule matches. */
export const Parts = z.union([
  Localized,
  z.array(z.object({ when: Cond.optional(), text: Localized }).strict()).min(1),
]);
export type Parts = z.infer<typeof Parts>;

export const Source = z
  .object({
    title: z.string().min(1),
    url: z.string().url(),
    covers: Localized,
    open_label: Localized.optional(),
  })
  .strict();

export const Fact = z
  .object({
    id: z.string().min(1),
    claim: Localized,
    source: z.string().min(1),
    verified_on: isoDate,
    verified_by: z.string().min(1),
    /** The day the rule takes effect. Blocks citing a fact that is not in effect yet are dropped. */
    operative_date: z.union([z.literal("in_effect_at_verification"), isoDate]),
    /** True when the source was attached by best guess and a human still has to confirm it. */
    confirm_source: z.boolean().optional(),
  })
  .strict();
export type Fact = z.infer<typeof Fact>;

/** Any block that can state a rule must cite facts, or say outright that it states none. */
const cites = {
  facts: z.array(z.string()).optional(),
  no_claim: z.boolean().optional(),
};

const Question = z
  .object({
    id: z.string().min(1),
    text: Localized,
    why: Localized,
    show_when: Cond.optional(),
    answers: z
      .array(z.object({ id: z.string().min(1), label: Localized, sub: Localized.optional() }).strict())
      .min(2),
  })
  .strict();

const What = z.object({ when: Cond.optional(), lead: Localized, detail: Parts, ...cites }).strict();

const Urgent = z
  .object({
    when: Cond.optional(),
    tone: z.enum(["warn", "urgent"]),
    title: Localized,
    body: z.array(Localized).min(1),
    ...cites,
  })
  .strict();

const NextMove = z
  .object({
    when: Cond.optional(),
    text: Localized,
    why: Localized.optional(),
    /** Source id to offer as the big "open this site" button. */
    link: z.string().optional(),
    ...cites,
  })
  .strict();

const Option = z
  .object({
    id: z.string().min(1),
    when: Cond.optional(),
    title: Localized,
    /** First matching rule wins. No match means no tag. */
    fit: z
      .array(z.object({ when: Cond.optional(), value: z.enum(["good", "no", "none"]) }).strict())
      .optional(),
    short: Localized,
    body: Parts,
    source: z.string().optional(),
    ...cites,
  })
  .strict();

const WatchOut = z.object({ when: Cond.optional(), text: Localized, ...cites }).strict();

const Branch = z
  .object({
    id: z.string().min(1),
    /** Branches are tried in order; the first whose rule matches wins. The last one needs no rule. */
    when: Cond.optional(),
    what: z.array(What).min(1),
    urgent: z.array(Urgent).optional(),
    next_move: z.array(NextMove).min(1),
    show_date: z.union([z.boolean(), Cond]),
    options: z.array(Option).optional(),
    watch_out: z.array(WatchOut).optional(),
  })
  .strict();
export type Branch = z.infer<typeof Branch>;

const base = {
  id: z.string().min(1),
  version: z.string().min(1),
  title: Localized,
};

export const LivePack = z
  .object({
    ...base,
    status: z.literal("live"),
    /** Sources always listed, whatever the answers. */
    base_sources: z.array(z.string()).optional(),
    sources: z.record(z.string(), Source),
    facts: z.array(Fact).min(1),
    /** Named rules, reused with { ref: name }. */
    defs: z.record(z.string(), Cond).optional(),
    /** Text variables, used as {name} in any string. First matching entry wins. */
    vars: z
      .record(z.string(), z.array(z.object({ when: Cond.optional(), text: Localized }).strict()).min(1))
      .optional(),
    questions: z.array(Question).min(1),
    branches: z.array(Branch).min(1),
  })
  .strict();
export type LivePack = z.infer<typeof LivePack>;

/** A guide whose facts are not verified yet. It can show its outline and nothing else. */
export const PreviewPack = z
  .object({
    ...base,
    status: z.literal("preview"),
    intro: Localized,
    rows: z.array(z.object({ q: Localized, a: Localized }).strict()).min(1),
    note: Localized,
  })
  .strict();
export type PreviewPack = z.infer<typeof PreviewPack>;

export const Pack = z.discriminatedUnion("status", [LivePack, PreviewPack]);
export type Pack = z.infer<typeof Pack>;
