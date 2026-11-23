import { describe, expect, it } from "vitest";
import { loadPack } from "@/pack/load";
import type { LivePack } from "@/pack/schema";
import { validatePack } from "@/pack/validate";
import { cleanAnswers, daysUntil, isComplete, resolve, visibleQuestions, type Answers } from "..";
import { V11_QUESTIONS, v11Result } from "./v11-oracle";

const pack = loadPack("traffic-ticket-long-beach") as LivePack;
const today = new Date("2026-11-22T12:00:00");
const run = (a: Answers) => resolve(pack, a, { today });
const ids = (a: Answers) => visibleQuestions(pack, a).map((q) => q.id);
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/** Every set of answers a person can reach by tapping through the questions. */
function allPaths(): Answers[] {
  const out: Answers[] = [];
  const walk = (i: number, s: Answers) => {
    if (i === V11_QUESTIONS.length) return void out.push(s);
    const q = V11_QUESTIONS[i];
    if (q.only && !q.only(s)) return walk(i + 1, s);
    for (const a of q.a) walk(i + 1, { ...s, [q.k]: a });
  };
  walk(0, {});
  return out;
}

describe("parity with v1.1", () => {
  const paths = allPaths();

  it("covers every reachable path", () => {
    expect(paths.length).toBeGreaterThan(500);
  });

  it("asks the same questions as v1.1 on every path", () => {
    for (const s of paths) {
      const expected = V11_QUESTIONS.filter((q) => !q.only || q.only(s)).map((q) => q.k);
      expect(ids(s), JSON.stringify(s)).toEqual(expected);
      expect(isComplete(pack, s)).toBe(true);
    }
  });

  it("gives the same result as v1.1 on every path", () => {
    const fit = { good: true, no: false, none: null } as const;
    for (const s of paths) {
      // Pack 1.2 fixed one gap v1.1 had: a misdemeanor whose date already passed.
      // That path is tested on its own below and left out of the parity check.
      if (s.where !== "out" && s.sev === "m" && s.date === "passed") continue;
      const old = v11Result(s);
      const now = run(s);
      const at = JSON.stringify(s);
      expect(now.whatThisIs.lead, at).toBe(old.whatLead);
      expect(now.whatThisIs.detail, at).toBe(squash(old.what));
      expect(now.nextMove.text, at).toBe(old.next);
      expect(now.nextMove.why ?? "", at).toBe(old.nextWhy);
      expect(now.urgent.map((u) => [u.title, ...u.body].join("|")), at).toEqual(old.urgent);
      expect(
        now.options.map((o) => ({ title: o.title, fit: fit[o.fit], short: o.short, body: o.body, src: o.source?.title })),
        at,
      ).toEqual(old.opts.map((o) => ({ ...o, body: squash(o.body), src: pack.sources[o.src].title })));
      expect(now.watchOut, at).toEqual(old.watch);
      expect(now.showDate, at).toBe(old.showDate);
      expect(now.nextMove.link?.url, at).toBe(
        old.used.includes("lasc") ? pack.sources.lasc.url : old.used.includes("lb") ? pack.sources.lb.url : undefined,
      );

      // One deliberate difference, recorded in DECISIONS.md: on fix-it tickets
      // v1.1 showed claims from two sources (the written-trial link in "Fight it",
      // and the traffic school line in the missed-date card) without listing
      // them. The engine lists every source behind what it shows.
      const expectedSources = new Set(old.used);
      if (now.branch === "court-ticket" && s.kind === "fixit") {
        expectedSources.add("tbd");
        if (s.date === "passed") expectedSources.add("tvs");
      }
      expect(new Set(now.sources.map((x) => x.id)), at).toEqual(expectedSources);
    }
  });
});

describe("branches", () => {
  const base: Answers = { where: "lb", kind: "moving", sev: "i", date: "future", school: "no", cdl: "no", money: "ok" };

  it("outside California: says so and shows no options or date", () => {
    const r = run({ where: "out", kind: "moving", sev: "i", date: "future", school: "no", cdl: "no", money: "ok" });
    expect(r.branch).toBe("outside-ca");
    expect(r.options).toEqual([]);
    expect(r.showDate).toBe(false);
    expect(r.sources.map((s) => s.id)).toEqual(["selfhelp"]);
  });

  it("parking: sends the person to the city, not the court", () => {
    const r = run({ where: "lb", kind: "parking", date: "future", money: "ok" });
    expect(r.branch).toBe("parking");
    expect(r.nextMove.link?.url).toBe("https://www.longbeach.gov/");
    expect(r.options).toEqual([]);
    expect(ids({ where: "lb", kind: "parking" })).toEqual(["where", "kind", "date", "money"]);
  });

  it("misdemeanor: go in person, warn about § 40508, no pay-online options", () => {
    const r = run({ where: "lb", kind: "moving", sev: "m", date: "future", money: "ok" });
    expect(r.branch).toBe("misdemeanor");
    expect(r.nextMove.text).toMatch(/in person/);
    expect(r.nextMove.why).toMatch(/public defender/);
    expect(r.watchOut[0]).toMatch(/40508/);
    expect(r.options).toEqual([]);
    expect(r.nextMove.link).toBeUndefined();
    expect(ids({ where: "lb", kind: "moving", sev: "m" })).not.toContain("school");
  });

  it("misdemeanor with a missed date: urgent card, contact the court today, no date counter", () => {
    const r = run({ where: "lb", kind: "moving", sev: "m", date: "passed", money: "ok" });
    expect(r.branch).toBe("misdemeanor");
    expect(r.urgent.map((u) => u.tone)).toEqual(["urgent"]);
    expect(r.urgent[0].body.join(" ")).toMatch(/40508/);
    expect(r.urgent[0].body.join(" ")).toMatch(/public defender/);
    expect(r.nextMove.text).toMatch(/court named on your ticket today/);
    expect(r.nextMove.text).not.toMatch(/in your phone/);
    expect(r.showDate).toBe(false);
    expect(r.watchOut).toEqual([]);
    expect(r.options).toEqual([]);
    expect(r.sources.map((s) => s.id)).toEqual(["selfhelp", "fta"]);
  });

  it("misdemeanor check is asked even when the person is not sure how they got the ticket", () => {
    expect(ids({ where: "lb", kind: "unsure" })).toContain("sev");
    expect(run({ where: "lb", kind: "unsure", sev: "m", date: "future", money: "ok" }).branch).toBe("misdemeanor");
  });

  it("can't tell: warns not to pay online yet", () => {
    const r = run({ ...base, sev: "cant" });
    expect(r.urgent.map((u) => u.tone)).toEqual(["warn"]);
    expect(r.whatThisIs.lead).toMatch(/Check the box first/);
  });

  it("date passed: urgent card, look it up today, traffic school no longer tagged a good fit", () => {
    const r = run({ ...base, date: "passed" });
    expect(r.urgent.map((u) => u.tone)).toEqual(["urgent"]);
    expect(r.nextMove.text).toMatch(/today/);
    expect(r.showDate).toBe(false);
    expect(r.options.find((o) => o.id === "traffic-school")?.fit).toBe("none");
    expect(r.sources.map((s) => s.id)).toContain("fta");
  });

  it("can't find a date: look it up, the notice can be slow", () => {
    const r = run({ ...base, date: "none" });
    expect(r.nextMove.why).toMatch(/30 days or longer/);
  });

  it("fix-it: fix, prove, small fee", () => {
    const r = run({ where: "lb", kind: "fixit", sev: "i", date: "future", money: "ok" });
    expect(r.nextMove.text).toMatch(/proof of correction/);
    expect(r.options.map((o) => o.id)).toEqual(["fixit-proof", "fixit-fight"]);
    expect(r.watchOut.join(" ")).not.toMatch(/Traffic school/);
  });

  it("regular ticket, money is fine: traffic school first", () => {
    const r = run(base);
    expect(r.nextMove.text).toMatch(/choose traffic school/);
    expect(r.options.map((o) => [o.id, o.fit])).toEqual([
      ["traffic-school", "good"],
      ["lower-amount", "none"],
      ["fight", "none"],
      ["pay", "none"],
    ]);
  });

  it("regular ticket, money is hard: traffic school, then ask to lower it", () => {
    const r = run({ ...base, money: "no" });
    expect(r.nextMove.text).toMatch(/^First ask for traffic school/);
    expect(r.options.find((o) => o.id === "lower-amount")?.fit).toBe("good");
  });

  it("commercial driver: traffic school is not offered as the next move", () => {
    const r = run({ ...base, cdl: "yes" });
    expect(r.nextMove.text).toMatch(/^Decide by your due date/);
    expect(r.options.find((o) => o.id === "traffic-school")?.fit).toBe("no");
    expect(r.options.find((o) => o.id === "pay")?.fit).toBe("good");
  });

  it("outside Long Beach: names the county court without the Long Beach line", () => {
    expect(run({ ...base, where: "ca" }).whatThisIs.detail).toMatch(/county where you got the ticket\. You are not/);
    expect(run(base).whatThisIs.detail).toMatch(/not the City of Long Beach/);
  });
});

describe("engine guarantees", () => {
  it("a changed answer can't leave a stale one behind", () => {
    const stale: Answers = { where: "lb", kind: "parking", sev: "m", school: "no", cdl: "yes", date: "future", money: "ok" };
    expect(cleanAnswers(pack, stale)).toEqual({ where: "lb", kind: "parking", date: "future", money: "ok" });
    expect(run(stale).branch).toBe("parking");
  });

  it("is not complete until every asked question is answered", () => {
    expect(isComplete(pack, { where: "lb", kind: "moving" })).toBe(false);
  });

  it("never shows a dollar figure", () => {
    for (const s of allPaths()) expect(JSON.stringify(run(s))).not.toMatch(/\$\s?\d/);
  });

  it("every block shown is backed by a fact, except on the out-of-scope branch", () => {
    for (const s of allPaths()) {
      const r = run(s);
      if (r.branch !== "outside-ca") expect(r.facts.length, JSON.stringify(s)).toBeGreaterThan(0);
    }
  });

  it("drops a rule that is not in effect yet, and shows it once it is", () => {
    const future: LivePack = structuredClone(pack);
    future.facts.push({
      id: "future-law",
      claim: { en: "A rule that starts later." },
      source: "selfhelp",
      verified_on: "2026-11-22",
      verified_by: "test",
      operative_date: "2027-01-01",
    });
    future.branches.find((b) => b.id === "misdemeanor")!.watch_out!.push({
      text: { en: "Only true from 2027." },
      facts: ["future-law"],
    });
    const a: Answers = { where: "lb", kind: "moving", sev: "m", date: "future", money: "ok" };
    expect(resolve(future, a, { today: new Date("2026-12-31T12:00:00") }).watchOut).not.toContain("Only true from 2027.");
    expect(resolve(future, a, { today: new Date("2027-01-01T12:00:00") }).watchOut).toContain("Only true from 2027.");
  });

  it("counts days from the date on the paper", () => {
    expect(daysUntil("2026-11-29", today)).toBe(7);
    expect(daysUntil("2026-11-22", today)).toBe(0);
    expect(daysUntil("2026-11-21", today)).toBe(-1);
  });
});

describe("pack validator", () => {
  const raw = () => structuredClone(pack) as unknown as Record<string, any>;

  it("passes the shipped packs", () => {
    expect(validatePack(raw(), "t").errors).toEqual([]);
    expect(loadPack("lease-long-beach").status).toBe("preview");
  });

  it("fails a fact with no source or no date", () => {
    const a = raw();
    delete a.facts[0].source;
    expect(validatePack(a, "t").errors.length).toBeGreaterThan(0);
    const b = raw();
    delete b.facts[0].operative_date;
    expect(validatePack(b, "t").errors.length).toBeGreaterThan(0);
    const c = raw();
    delete c.facts[0].verified_on;
    expect(validatePack(c, "t").errors.length).toBeGreaterThan(0);
  });

  it("fails a block that states a rule but cites no fact", () => {
    const a = raw();
    delete a.branches[2].watch_out[0].facts;
    expect(validatePack(a, "t").errors.join("\n")).toMatch(/cites no fact/);
  });

  it("fails a reference to a fact, source, question or answer that does not exist", () => {
    const a = raw();
    a.branches[2].watch_out[0].facts = ["nope"];
    expect(validatePack(a, "t").errors.join("\n")).toMatch(/unknown fact/);
    const b = raw();
    b.facts[0].source = "nope";
    expect(validatePack(b, "t").errors.join("\n")).toMatch(/unknown source/);
    const c = raw();
    c.questions[2].show_when = { q: "kind", eq: "nope" };
    expect(validatePack(c, "t").errors.join("\n")).toMatch(/not an answer/);
  });

  it("refuses to let a preview pack carry results", () => {
    const lease = structuredClone(loadPack("lease-long-beach")) as unknown as Record<string, any>;
    lease.branches = [];
    expect(validatePack(lease, "t").errors.length).toBeGreaterThan(0);
  });
});
