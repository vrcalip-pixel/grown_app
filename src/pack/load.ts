import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { Pack } from "./schema";
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
