/**
 * Makes the read-aloud clips in the author's own voice.
 *
 *   npm run voice
 *
 * It reads content/voice/lines.json (every line the app can show, by language),
 * asks ElevenLabs to speak each line that has no clip yet, and saves the clips
 * under public/voice. Lines that already have a clip are skipped, so running it
 * again after a wording change only makes the new lines. Clips for lines that
 * no longer exist are removed.
 *
 * The ElevenLabs key and voice id come from .env.local on this computer. They
 * are used here only. The live site just serves the finished audio files, so a
 * visitor never contacts ElevenLabs.
 */
import fs from "node:fs";
import path from "node:path";
import { lineId } from "../src/voice/hash";

const env: Record<string, string> = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}
const KEY = env.ELEVENLABS_API_KEY;
const VOICE = env.ELEVENLABS_VOICE_ID;
if (!KEY || !VOICE) {
  console.error("Add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to .env.local first.");
  process.exit(1);
}

const only = process.argv.slice(2); // optional: languages to make, e.g. "en"
const lines = JSON.parse(fs.readFileSync("content/voice/lines.json", "utf8")) as Record<string, string[]>;
const OUT = path.join("public", "voice");

async function makeClip(text: string, lang: string, file: string): Promise<true | string> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE)}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", language_code: undefined }),
  });
  if (!res.ok) return `${res.status} ${(await res.text()).slice(0, 300)}`;
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function main() {
  let made = 0;
  let chars = 0;
  let stopped = "";
  for (const [lang, list] of Object.entries(lines)) {
    if (only.length && !only.includes(lang)) continue;
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
    const todo = [...new Set(list)].filter((t) => !fs.existsSync(path.join(OUT, lang, `${lineId(t)}.mp3`)));
    console.log(`${lang}: ${list.length} lines, ${todo.length} to make (${todo.reduce((n, t) => n + t.length, 0)} characters)`);
    // Three at a time keeps within the service's limits.
    let at = 0;
    const worker = async () => {
      while (at < todo.length && !stopped) {
        const text = todo[at++];
        const result = await makeClip(text, lang, path.join(OUT, lang, `${lineId(text)}.mp3`));
        if (result === true) {
          made++;
          chars += text.length;
        } else {
          stopped = result;
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (stopped) break;
  }

  // The list the site reads: only clips that exist and still match a line. Remove the rest.
  const manifest: Record<string, string[]> = {};
  for (const [lang, list] of Object.entries(lines)) {
    const dir = path.join(OUT, lang);
    if (!fs.existsSync(dir)) continue;
    const wanted = new Set(list.map(lineId));
    const have: string[] = [];
    for (const f of fs.readdirSync(dir)) {
      const id = f.replace(/\.mp3$/, "");
      if (wanted.has(id)) have.push(id);
      else fs.unlinkSync(path.join(dir, f));
    }
    if (have.length) manifest[lang] = have.sort();
    console.log(`${lang}: ${have.length} of ${wanted.size} lines have a clip`);
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
  console.log(`made ${made} clips, ${chars} characters used`);
  if (stopped) {
    console.error(`Stopped early: ${stopped}`);
    process.exit(2);
  }
}

main();
