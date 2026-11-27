"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { lineId } from "@/voice/hash";

/**
 * "Read this to me." A button in the header that reads the current screen out
 * loud.
 *
 * It plays clips recorded ahead of time in the author's own voice. The clips
 * are plain audio files on this site, so nothing the person reads or taps is
 * sent anywhere. A line with no clip (a date the person typed, say) is spoken
 * by a voice that lives on the device. No AI runs when the button is tapped,
 * and a device voice that would send text to a server is never used.
 */

/** The screen's words, in reading order, skipping what is hidden or not content. */
export function readableChunks(root: HTMLElement, includeClosed = false): string[] {
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    const text = current.replace(/\s+/g, " ").trim();
    if (text) chunks.push(/[.!?:]$/.test(text) ? text : `${text}.`);
    current = "";
  };
  const BLOCK = new Set(["P", "DIV", "H1", "H2", "LI", "UL", "BUTTON", "DETAILS", "SMALL", "STRONG", "LABEL", "B", "SPAN"]);

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      current += node.textContent ?? "";
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.hasAttribute("data-noread") || node.getAttribute("aria-hidden") === "true") return;
    // Navigation rows and the feedback card are controls, not content.
    if (node.classList.contains("row") || node.classList.contains("fb") || node.classList.contains("ask")) return;
    if (node.tagName === "SUMMARY" || node.tagName === "INPUT" || node.tagName === "TEXTAREA") return;
    if (node.tagName === "BUTTON" && (node as HTMLButtonElement).disabled) return;

    const block = BLOCK.has(node.tagName);
    if (block) flush();
    // A closed "Show more" stays unread, the same as it stays unseen.
    const closed = node.tagName === "DETAILS" && !(node as HTMLDetailsElement).open && !includeClosed;
    if (!closed) node.childNodes.forEach(walk);
    if (block) flush();
  };

  walk(root);
  flush();
  return chunks;
}

/** A voice for this language that runs on the device, or null if there is none. */
function localVoice(lang: string): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.localService && v.lang.toLowerCase().startsWith(lang));
  return voices.sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null;
}

/**
 * Devices ship several voices of very different quality. This ranks them so the
 * most natural one on the device is used: the newer "natural", "enhanced" and
 * "premium" voices first, then the better standard ones, with the old robotic
 * and novelty voices last.
 */
export function voiceScore(v: { name: string; lang: string; default?: boolean }): number {
  let s = 0;
  if (/natural|neural|premium|enhanced|siri/i.test(v.name)) s += 100;
  if (/\b(samantha|ava|allison|susan|zoe|nicky|evan|nathan|joelle|noelle|aria|jenny|michelle|google us english)\b/i.test(v.name)) s += 40;
  if (/\bzira\b/i.test(v.name)) s += 10;
  if (/\b(david|mark|fred|albert|ralph|kathy|junior|espeak)\b/i.test(v.name)) s -= 30;
  if (/bad news|good news|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox/i.test(v.name)) s -= 200;
  if (v.lang === "en-US") s += 20;
  if (v.default) s += 5;
  return s;
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Which lines have a recorded clip, by language. Loaded once per visit. */
type Clips = Record<string, string[]>;
type ClipSets = Record<string, Set<string>>;
let clipList: Promise<ClipSets> | undefined;
function loadClips(): Promise<ClipSets> {
  if (!clipList) {
    clipList = fetch(`${BASE}/voice/manifest.json`)
      .then((r): Promise<Clips> => (r.ok ? r.json() : Promise.resolve({})))
      .then((m) => {
        const sets: ClipSets = {};
        for (const [lang, ids] of Object.entries(m)) sets[lang] = new Set(ids);
        return sets;
      })
      .catch((): ClipSets => ({}));
  }
  return clipList;
}

/** The part of the page that holds the current screen's words. Pages mark it with data-read. */
const screenNow = () => document.querySelector<HTMLElement>("[data-read]");

/**
 * The read-aloud button in the header. It reads whatever screen is showing and
 * stops by itself as soon as that screen is replaced.
 */
export function ReadAloud({ lang, startLabel, stopLabel }: { lang: string; startLabel: string; stopLabel: string }) {
  const path = usePathname();
  const [voiceLang, setVoiceLang] = useState("en");
  const [hasDeviceVoice, setHasDeviceVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [clips, setClips] = useState<Record<string, Set<string>>>({});
  const run = useRef(0);
  const watcher = useRef<MutationObserver | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadClips().then(setClips);
    // For building the list of lines to record. Not present on the live site.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __grownLines?: (el: HTMLElement) => string[] }).__grownLines = (el) => readableChunks(el, true);
    }
  }, []);

  // A screen says which language its words are in (the ticket guide is English only).
  useEffect(() => {
    setVoiceLang(screenNow()?.getAttribute("data-read") || lang);
  }, [path, lang]);

  // Device voices load after the page does, so check now and again when they arrive.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => setHasDeviceVoice(localVoice(voiceLang) !== null);
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, [voiceLang]);

  const stop = () => {
    run.current++;
    watcher.current?.disconnect();
    watcher.current = null;
    player.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Never keep reading after leaving the site's pages.
  useEffect(() => stop, []);

  const start = () => {
    const target = screenNow();
    if (!target) return;
    const readLang = target.getAttribute("data-read") || lang;
    const recorded = clips[readLang] ?? new Set<string>();
    const voice = localVoice(readLang);
    const chunks = readableChunks(target).filter((text) => recorded.has(lineId(text)) || voice);
    if (!chunks.length) return;

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const mine = ++run.current;
    setSpeaking(true);
    // Never keep reading a screen the person has left: each new screen replaces this element.
    watcher.current?.disconnect();
    watcher.current = new MutationObserver(() => {
      if (!target.isConnected) stop();
    });
    watcher.current.observe(document.body, { childList: true, subtree: true });

    // One audio element for the whole visit: phones only let sound start from a tap,
    // and an element that has played once is allowed to play the next clip.
    const audio = (player.current ??= new Audio());

    const playClip = (text: string) =>
      new Promise<void>((done) => {
        audio.onended = audio.onerror = () => done();
        audio.src = `${BASE}/voice/${readLang}/${lineId(text)}.mp3`;
        audio.play().catch(() => done());
      });
    const speak = (text: string) =>
      new Promise<void>((done) => {
        if (!voice) return done();
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang;
        // A touch slower than normal speech: calmer, and easier to follow.
        u.rate = 0.9;
        u.onend = u.onerror = () => done();
        window.speechSynthesis.speak(u);
      });

    let i = 0;
    const next = () => {
      if (run.current !== mine) return;
      if (i >= chunks.length) return stop();
      const text = chunks[i++];
      (recorded.has(lineId(text)) ? playClip(text) : speak(text)).then(next);
    };
    next();
  };

  const available = hasDeviceVoice || (clips[voiceLang]?.size ?? 0) > 0;
  if (!available) return null;
  const label = speaking ? stopLabel : startLabel;
  return (
    <button className={`readbtn${speaking ? " on" : ""}`} onClick={speaking ? stop : start} aria-pressed={speaking} aria-label={label} title={label}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {speaking ? (
          <rect x="6" y="6" width="12" height="12" rx="2" />
        ) : (
          <>
            <path d="M4 9v6h4l5 4V5L8 9z" />
            <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />
          </>
        )}
      </svg>
    </button>
  );
}
