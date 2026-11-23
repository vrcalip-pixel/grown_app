import { describe, expect, it } from "vitest";
import { loadPack } from "@/pack/load";
import type { LivePack } from "@/pack/schema";
import type { Answers } from "@/engine";
import { askGuide, buildContext, validRequest, type ModelCaller, type Turn } from "../ask";
import { checkReply, tidy, type RawReply } from "../check";

/**
 * These tests need no API key and cost nothing. They stand in for the model
 * with replies written to break the rules, and check that none of them reach
 * a person. The live-model version of this is in evals/.
 */

const pack = loadPack("traffic-ticket-long-beach") as LivePack;
const lines = pack.guide!.lines;

const regular: Answers = { where: "lb", kind: "moving", sev: "i", date: "future", school: "no", cdl: "no", money: "ok" };
const misdemeanor: Answers = { where: "lb", kind: "moving", sev: "m", date: "future", money: "ok" };
const q: Turn[] = [{ role: "user", text: "How much is it?" }];

const says = (reply: Partial<RawReply> | "refused"): ModelCaller => async () =>
  reply === "refused" ? "refused" : { type: "answer", fact_ids: ["tvs-18-months"], text: "", ...reply };
const ask = (reply: Partial<RawReply> | "refused", answers = regular) => askGuide(pack, answers, q, says(reply));

describe("what the model is given", () => {
  it("sees only the facts the engine showed this person", () => {
    const { system, check } = buildContext(pack, misdemeanor);
    expect(system).toContain("[fta-40508]");
    expect(system).not.toContain("[tvs-18-months]");
    expect(system).not.toContain("MyCitations");
    expect(check.allowedFacts.has("tvs-18-months")).toBe(false);
  });

  it("is told what the person answered, in words", () => {
    expect(buildContext(pack, misdemeanor).system).toContain("Yes, it says Misdemeanor or Must appear");
  });
});

describe("a good answer passes", () => {
  it("shows the answer with the sources behind its facts", async () => {
    const r = await ask({
      text: "Traffic school keeps this ticket off your public record. You can only use it once every 18 months.",
      fact_ids: ["tvs-18-months", "tvs-confidential"],
    });
    expect(r.kind).toBe("answer");
    expect(r.sources.map((s) => s.title)).toEqual(["California Rules of Court, Rule 4.104"]);
  });

  it("may repeat a number or a length of time that the verified text contains", async () => {
    const r = await ask(
      { text: "Missing a court date you promised to keep can be its own misdemeanor under Vehicle Code § 40508.", fact_ids: ["fta-40508"] },
      misdemeanor,
    );
    expect(r.kind).toBe("answer");
  });
});

describe("what the checker stops", () => {
  const blocked = async (text: string, fact_ids = ["tvs-18-months"], answers = regular) => {
    const r = await ask({ text, fact_ids }, answers);
    expect(r.kind, text).toBe("blocked");
    expect(r.text).toBe(lines.blocked.en);
  };

  it("a dollar figure", () => blocked("A red light ticket is usually about $490 with fees."));
  it("money in words", () => blocked("It will cost a few hundred dollars once fees are added."));
  it("an invented deadline", () => blocked("You have 30 days from the ticket date to respond.", ["infraction-deadline"]));
  it("an invented processing time", () => blocked("It usually shows up online in two to four weeks."));
  it("a vague length of time", () => blocked("It should show up in a few days."));
  it("a number that is not in the verified text", () => blocked("Traffic school is allowed once every 12 months."));
  it("a penalty range", () => blocked("The late penalty is between 100 and 300."));
  it("an answer that cites nothing", () => blocked("You can just ignore it and it will go away.", []));
  it("a fact id that does not exist", () => blocked("Immigration will not be told.", ["immigration-safe"]));
  it("a real fact this person was not shown", () =>
    blocked("You can take traffic school to keep it off your record.", ["tvs-confidential"], misdemeanor));
  it("an answer that runs long", () => blocked(Array(140).fill("word").join(" ")));
  it("an empty answer", () => blocked("   "));

  it("the same number is fine for one person and blocked for another", async () => {
    const text = "Traffic school is allowed once every 18 months.";
    expect((await ask({ text, fact_ids: ["tvs-18-months"] })).kind).toBe("answer");
    expect((await ask({ text, fact_ids: ["fta-40508"] }, misdemeanor)).kind).toBe("blocked");
  });
});

describe("fixed lines", () => {
  it("amounts and dates get the fixed line, whatever text the model sent with it", async () => {
    const r = await ask({ type: "no_amounts_or_dates", text: "Probably around $500.", fact_ids: [] });
    expect(r).toEqual({ kind: "no_amounts_or_dates", text: lines.no_amounts_or_dates.en, sources: [] });
  });

  it("off-pack questions get the fixed line and the official handoff link", async () => {
    const r = await ask({ type: "off_pack", text: "Immigration won't find out.", fact_ids: [] });
    expect(r.text).toBe(lines.off_pack.en);
    expect(r.sources).toEqual([{ title: pack.sources.selfhelp.title, url: pack.sources.selfhelp.url }]);
  });

  it("a model refusal gets the blocked line", async () => {
    expect((await ask("refused")).text).toBe(lines.blocked.en);
  });

  it("a model or network error gets the unavailable line", async () => {
    const r = await askGuide(pack, regular, q, async () => {
      throw new Error("network down");
    });
    expect(r).toEqual({ kind: "unavailable", text: lines.unavailable.en, sources: [] });
  });

  it("no fixed line contains a number or a dollar sign", () => {
    for (const l of Object.values(lines)) expect(l.en).not.toMatch(/\d|\$/);
  });
});

describe("checker details", () => {
  const ctx = { allowedFacts: new Set(["a"]), corpus: "Act this week. Once every 18 months. It can take 30 days or longer." };
  const check = (text: string) => checkReply({ type: "answer", fact_ids: ["a"], text }, ctx).ok;

  it("allows lengths of time exactly as the verified text has them", () => {
    expect(check("Do it this week.")).toBe(true);
    expect(check("Only once every 18 months.")).toBe(true);
    expect(check("It can take 30 days or longer.")).toBe(true);
  });
  it("blocks the same unit with a different amount", () => {
    expect(check("Do it next week.")).toBe(false);
    expect(check("Only once every 18 weeks.")).toBe(false);
    expect(check("About thirty days.")).toBe(false);
    expect(check("Within a week.")).toBe(false);
  });
  it("removes em dashes and markdown from model text", () => {
    expect(tidy("Go **today** — the clerk can help.")).toBe("Go today, the clerk can help.");
  });
});

describe("request limits", () => {
  const ok: Turn[] = [{ role: "user", text: "hi" }];
  it("accepts a normal request", () => expect(validRequest(pack, regular, ok)).toBe(true));
  it("rejects unfinished answers", () => expect(validRequest(pack, { where: "lb" }, ok)).toBe(false));
  it("rejects a very long question", () =>
    expect(validRequest(pack, regular, [{ role: "user", text: "x".repeat(501) }])).toBe(false));
  it("rejects too many turns", () =>
    expect(
      validRequest(
        pack,
        regular,
        Array.from({ length: 13 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", text: "x" })),
      ),
    ).toBe(false));
  it("rejects a conversation that does not end with the person", () =>
    expect(validRequest(pack, regular, [...ok, { role: "assistant", text: "x" }])).toBe(false));
  it("rejects junk", () => {
    expect(validRequest(pack, null, ok)).toBe(false);
    expect(validRequest(pack, regular, "hi")).toBe(false);
    expect(validRequest(pack, { ...regular, where: 5 }, ok)).toBe(false);
  });
});
