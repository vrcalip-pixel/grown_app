import { Pack, type Cond, type LivePack, type Localized, type Parts } from "./schema";

export interface Report {
  errors: string[];
  warnings: string[];
}

/**
 * Checks a parsed YAML object against the schema, then checks everything the
 * schema can't: that every reference points at something real and that every
 * block able to state a rule cites a verified fact.
 */
export function validatePack(raw: unknown, name: string): Report & { pack?: Pack } {
  const parsed = Pack.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((i) => `${name}: ${i.path.join(".")}: ${i.message}`),
      warnings: [],
    };
  }
  const pack = parsed.data;
  if (pack.status === "preview") return { errors: [], warnings: [], pack };
  return { ...checkLive(pack, name), pack };
}

function checkLive(pack: LivePack, name: string): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (where: string, msg: string): void => {
    errors.push(`${name}: ${where}: ${msg}`);
  };

  const sources = new Set(Object.keys(pack.sources));
  const facts = new Map(pack.facts.map((f) => [f.id, f]));
  const defs = new Set(Object.keys(pack.defs ?? {}));
  const vars = new Set(Object.keys(pack.vars ?? {}));
  const answers = new Map(pack.questions.map((q) => [q.id, new Set(q.answers.map((a) => a.id))]));

  if (facts.size !== pack.facts.length) err("facts", "two facts share an id");
  for (const f of pack.facts) {
    if (!sources.has(f.source)) err(`facts.${f.id}`, `unknown source "${f.source}"`);
    if (f.confirm_source) warnings.push(`${name}: facts.${f.id}: source still needs a human to confirm it`);
  }
  for (const s of pack.base_sources ?? []) if (!sources.has(s)) err("base_sources", `unknown source "${s}"`);

  const cond = (c: Cond | undefined, where: string): void => {
    if (!c) return;
    if ("ref" in c) {
      if (!defs.has(c.ref)) err(where, `unknown rule name "${c.ref}"`);
    } else if ("all" in c) c.all.forEach((x) => cond(x, where));
    else if ("any" in c) c.any.forEach((x) => cond(x, where));
    else if ("not" in c) cond(c.not, where);
    else {
      const allowed = answers.get(c.q);
      if (!allowed) return err(where, `unknown question "${c.q}"`);
      for (const v of "eq" in c ? [c.eq] : c.in) {
        if (!allowed.has(v)) err(where, `"${v}" is not an answer to "${c.q}"`);
      }
    }
  };

  const text = (l: Localized | undefined, where: string): void => {
    if (!l) return;
    for (const s of [l.en, l.es ?? ""]) {
      for (const m of s.matchAll(/\{(\w+)\}/g)) {
        if (!vars.has(m[1])) err(where, `unknown text variable {${m[1]}}`);
      }
    }
  };
  const parts = (p: Parts, where: string): void => {
    if (Array.isArray(p)) p.forEach((x, i) => (cond(x.when, `${where}[${i}]`), text(x.text, `${where}[${i}]`)));
    else text(p, where);
  };
  const cites = (b: { facts?: string[]; no_claim?: boolean }, where: string): void => {
    const ids = b.facts ?? [];
    for (const id of ids) if (!facts.has(id)) err(where, `unknown fact "${id}"`);
    if (ids.length === 0 && !b.no_claim) {
      err(where, "cites no fact. Add facts: [...] or, if it states no rule, no_claim: true");
    }
    if (ids.length > 0 && b.no_claim) err(where, "has both facts and no_claim");
  };

  Object.entries(pack.defs ?? {}).forEach(([k, c]) => cond(c, `defs.${k}`));
  Object.entries(pack.vars ?? {}).forEach(([k, list]) => {
    list.forEach((v, i) => cond(v.when, `vars.${k}[${i}]`));
    if (list[list.length - 1].when) err(`vars.${k}`, "last entry must have no rule, so there is always a value");
  });

  for (const q of pack.questions) {
    cond(q.show_when, `questions.${q.id}`);
    text(q.text, `questions.${q.id}`);
    text(q.why, `questions.${q.id}`);
  }

  pack.branches.forEach((b, bi) => {
    const at = `branches.${b.id}`;
    cond(b.when, at);
    if (!b.when && bi !== pack.branches.length - 1) err(at, "only the last branch may have no rule");
    if (typeof b.show_date !== "boolean") cond(b.show_date, `${at}.show_date`);

    b.what.forEach((w, i) => {
      const w_ = `${at}.what[${i}]`;
      cond(w.when, w_), text(w.lead, w_), parts(w.detail, w_), cites(w, w_);
    });
    if (b.what[b.what.length - 1].when) err(`${at}.what`, "last entry must have no rule");

    b.next_move.forEach((n, i) => {
      const n_ = `${at}.next_move[${i}]`;
      cond(n.when, n_), text(n.text, n_), text(n.why, n_), cites(n, n_);
      if (n.link && !sources.has(n.link)) err(n_, `unknown source "${n.link}"`);
    });
    if (b.next_move[b.next_move.length - 1].when) err(`${at}.next_move`, "last entry must have no rule");

    (b.urgent ?? []).forEach((u, i) => {
      const u_ = `${at}.urgent[${i}]`;
      cond(u.when, u_), text(u.title, u_), u.body.forEach((p) => text(p, u_)), cites(u, u_);
    });
    (b.options ?? []).forEach((o) => {
      const o_ = `${at}.options.${o.id}`;
      cond(o.when, o_), text(o.title, o_), text(o.short, o_), parts(o.body, o_), cites(o, o_);
      (o.fit ?? []).forEach((f) => cond(f.when, `${o_}.fit`));
      if (o.source && !sources.has(o.source)) err(o_, `unknown source "${o.source}"`);
    });
    (b.watch_out ?? []).forEach((w, i) => {
      const w_ = `${at}.watch_out[${i}]`;
      cond(w.when, w_), text(w.text, w_), cites(w, w_);
    });
  });

  return { errors, warnings };
}
