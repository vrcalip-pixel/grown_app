import { describe, expect, it } from "vitest";
import { voiceScore } from "../ReadAloud";

const best = (names: string[]) =>
  names
    .map((name) => ({ name, lang: "en-US" }))
    .sort((a, b) => voiceScore(b) - voiceScore(a))[0].name;

describe("read-aloud voice choice", () => {
  it("prefers a natural or enhanced voice when the device has one", () => {
    expect(best(["Microsoft David - English (United States)", "Microsoft Aria (Natural) - English (United States)"])).toMatch(/Aria/);
    expect(best(["Fred", "Samantha", "Ava (Premium)"])).toBe("Ava (Premium)");
  });

  it("on Windows with only the basic voices, picks Zira over David and Mark", () => {
    expect(best(["Microsoft David - English (United States)", "Microsoft Mark - English (United States)", "Microsoft Zira - English (United States)"])).toMatch(/Zira/);
  });

  it("never picks a novelty voice when a normal one exists", () => {
    expect(best(["Bad News", "Whisper", "Zarvox", "Samantha"])).toBe("Samantha");
  });

  it("prefers US English over other English voices of the same quality", () => {
    const voices = [
      { name: "Daniel", lang: "en-GB" },
      { name: "Tom", lang: "en-US" },
    ];
    expect(voices.sort((a, b) => voiceScore(b) - voiceScore(a))[0].name).toBe("Tom");
  });
});
