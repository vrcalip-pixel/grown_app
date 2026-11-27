"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * "Read this to me." Speaks the words on the current screen with a voice that
 * lives on the person's own device. No AI, no network: if the device only has
 * voices that send text to a server, the button does not appear at all.
 */

/** The screen's words, in reading order, skipping what is hidden or not content. */
export function readableChunks(root: HTMLElement): string[] {
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    const text = current.replace(/\s+/g, " ").trim();
    if (text) chunks.push(/[.!?:]$/.test(text) ? text : `${text}.`);
    current = "";
  };
  const BLOCK = new Set(["P", "DIV", "H1", "H2", "LI", "UL", "BUTTON", "DETAILS", "SMALL", "STRONG", "LABEL"]);

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
    const closed = node.tagName === "DETAILS" && !(node as HTMLDetailsElement).open;
    if (!closed) node.childNodes.forEach(walk);
    if (block) flush();
  };

  walk(root);
  flush();
  return chunks;
}

/** An English voice that runs on the device, or null if there is none. */
function localVoice(lang: string): SpeechSynthesisVoice | null {
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

/** The part of the page that holds the current screen's words. Pages mark it with data-read. */
const screenNow = () => document.querySelector<HTMLElement>("[data-read]");

/**
 * The read-aloud button in the header. It reads whatever screen is showing and
 * stops by itself as soon as that screen is replaced.
 */
export function ReadAloud({ lang, startLabel, stopLabel }: { lang: string; startLabel: string; stopLabel: string }) {
  const path = usePathname();
  const [voiceLang, setVoiceLang] = useState("en");
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const run = useRef(0);
  const watcher = useRef<MutationObserver | null>(null);

  // A screen says which language its words are in (the ticket guide is English only).
  useEffect(() => {
    setVoiceLang(screenNow()?.getAttribute("data-read") || lang);
  }, [path, lang]);

  // Voices load after the page does, so check now and again when they arrive.
  // The button hides if the device has no on-device voice for the language.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => setAvailable(localVoice(voiceLang) !== null);
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, [voiceLang]);

  const stop = () => {
    run.current++;
    watcher.current?.disconnect();
    watcher.current = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Never keep reading after leaving the site's pages.
  useEffect(() => stop, []);

  const start = () => {
    const target = screenNow();
    const voice = localVoice(target?.getAttribute("data-read") || lang);
    if (!target || !voice) return;
    const chunks = readableChunks(target);
    if (!chunks.length) return;
    window.speechSynthesis.cancel();
    const mine = ++run.current;
    setSpeaking(true);
    // Never keep reading a screen the person has left: each new screen replaces this element.
    watcher.current?.disconnect();
    watcher.current = new MutationObserver(() => {
      if (!target.isConnected) stop();
    });
    watcher.current.observe(document.body, { childList: true, subtree: true });
    // One utterance per line: some browsers cut off long ones.
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      // A touch slower than normal speech: calmer, and easier to follow.
      u.rate = 0.9;
      if (i === chunks.length - 1) {
        u.onend = u.onerror = () => {
          if (run.current === mine) stop();
        };
      }
      window.speechSynthesis.speak(u);
    });
  };

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
