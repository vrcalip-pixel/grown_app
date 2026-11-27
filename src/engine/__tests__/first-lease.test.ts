import { describe, expect, it } from "vitest";
import { isComplete, resolve, visibleQuestions, type Answers } from "@/engine";
import { loadPack } from "@/pack/load";
import type { LivePack } from "@/pack/schema";

/** The first-lease guide: every path a person can take has to end in a plan. */

const pack = loadPack("first-lease") as LivePack;
const TODAY = new Date("2026-11-26T12:00:00");

/** Every complete set of answers a person can reach by tapping through the questions. */
function allPaths(): Answers[] {
  const done: Answers[] = [];
  const walk = (answers: Answers) => {
    const next = visibleQuestions(pack, answers).find((q) => answers[q.id] === undefined);
    if (!next) return void done.push(answers);
    for (const a of next.answers) walk({ ...answers, [next.id]: a.id });
  };
  walk({});
  return done;
}

describe("first-lease guide", () => {
  it("is a live guide in the housing category", () => {
    expect(pack.status).toBe("live");
    expect(pack.category).toBe("housing");
  });

  const paths = allPaths();

  it("gives every path one next move and a plain explanation", () => {
    expect(paths.length).toBeGreaterThan(20);
    for (const answers of paths) {
      expect(isComplete(pack, answers)).toBe(true);
      const r = resolve(pack, answers, { today: TODAY });
      expect(r.nextMove.text.length, JSON.stringify(answers)).toBeGreaterThan(10);
      expect(r.whatThisIs.lead.length, JSON.stringify(answers)).toBeGreaterThan(10);
      expect(r.showDate, "no ticket-style date card on a lease").toBe(false);
      expect(r.sources.length).toBeGreaterThan(0);
    }
  });

  it("never uses an em dash, and leaves no unfilled {variable}", () => {
    for (const answers of paths) {
      const text = JSON.stringify(resolve(pack, answers, { today: TODAY }));
      expect(text).not.toMatch(/—/);
      expect(text).not.toMatch(/\{\w+\}/);
    }
  });

  it("sends someone outside California elsewhere, with no California rules", () => {
    const r = resolve(pack, { where: "out" }, { today: TODAY });
    expect(r.branch).toBe("outside-ca");
    expect(r.facts).toEqual([]);
    expect(r.options).toEqual([]);
  });

  it("flags a deposit over one month's rent before signing, and names the small-landlord exception", () => {
    const r = resolve(pack, { where: "lb", stage: "offered", term: "fixed", deposit: "over", seen: "yes" }, { today: TODAY });
    expect(r.urgent[0].title).toMatch(/deposit/i);
    expect(r.urgent[0].body.join(" ")).toMatch(/two months/);
    expect(r.nextMove.text).toMatch(/in writing/);
    expect(r.facts).toContain("deposit-cap");
  });

  it("tells someone who has not seen the unit to see it first", () => {
    const r = resolve(pack, { where: "ca", stage: "offered", term: "month", deposit: "under", seen: "no" }, { today: TODAY });
    expect(r.nextMove.text).toMatch(/See the unit/);
  });

  it("shows the Long Beach ordinance only to Long Beach renters", () => {
    const lb = resolve(pack, { where: "lb", stage: "signed", term: "fixed", deposit: "under" }, { today: TODAY });
    const la = resolve(pack, { where: "la", stage: "signed", term: "fixed", deposit: "under" }, { today: TODAY });
    expect(lb.watchOut.join(" ")).toMatch(/Long Beach/);
    expect(la.watchOut.join(" ")).not.toMatch(/Long Beach/);
    expect(lb.faq.map((f) => f.id)).toContain("lb-help");
    expect(la.faq.map((f) => f.id)).not.toContain("lb-help");
  });

  it("drops a rule that is not in effect yet", () => {
    // Before July 1, 2024 the one-month deposit limit did not apply, so nothing citing it may show.
    const r = resolve(pack, { where: "lb", stage: "offered", term: "fixed", deposit: "over", seen: "yes" }, { today: new Date("2024-06-01T12:00:00") });
    expect(r.facts).not.toContain("deposit-cap");
    expect(r.urgent).toEqual([]);
  });

  it("uses its own heading for the options list", () => {
    const r = resolve(pack, { where: "lb", stage: "applying", seen: "yes" }, { today: TODAY });
    expect(r.optionsLabel).toBe("What to check");
  });
});
