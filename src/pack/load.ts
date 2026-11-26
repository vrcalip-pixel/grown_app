import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { LivePack, Pack, PreviewPack } from "./schema";
import { validatePack } from "./validate";

export const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export function listPackFiles(): string[] {
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .sort();
}

export function readRawPack(file: string): unknown {
  const raw = parse(fs.readFileSync(path.join(GUIDES_DIR, file), "utf8"), { merge: true });
  // Top-level keys starting with "_" only hold YAML anchors and are not content.
  if (raw && typeof raw === "object") {
    for (const k of Object.keys(raw)) if (k.startsWith("_")) delete raw[k];
  }
  return raw;
}

/** Server-only. Throws if the pack is invalid, so a bad pack can never render. */
export function loadPack(id: string): Pack {
  const { pack, errors } = validatePack(readRawPack(`${id}.yaml`), id);
  if (!pack || errors.length) throw new Error(`Guide pack "${id}" is invalid:\n${errors.join("\n")}`);
  return pack;
}

/** Every preview guide in a category, in the order given. */
export function loadPreviews(category: string, order: string[]): PreviewPack[] {
  return order.map((id) => {
    const p = loadPack(id);
    if (p.status !== "preview" || p.category !== category) throw new Error(`"${id}" is not a ${category} preview`);
    return p;
  });
}

/** The oldest check among a guide's facts, as an ISO date. A page never claims to be fresher than its stalest rule. */
export function checkedIso(pack: LivePack): string {
  return pack.facts.map((f) => f.verified_on).sort()[0];
}

export function checkedOn(pack: LivePack): string {
  return new Date(`${checkedIso(pack)}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
