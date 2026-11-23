"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

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
function localVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.localService && v.lang.startsWith("en"));
  return voices.find((v) => v.lang === "en-US" && v.default) ?? voices.find((v) => v.lang === "en-US") ?? voices[0] ?? null;
}

export function ReadAloud({ target, screenKey }: { target: RefObject<HTMLElement | null>; screenKey: string }) {
  const [available, setAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const run = useRef(0);

  // Voices load after the page does, so check now and again when they arrive.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const check = () => setAvailable(localVoice() !== null);
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  const stop = () => {
    run.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Never keep reading a screen the person has left.
  useEffect(() => stop, [screenKey]);

  const start = () => {
    const voice = localVoice();
    if (!target.current || !voice) return;
    const chunks = readableChunks(target.current);
    if (!chunks.length) return;
    window.speechSynthesis.cancel();
    const mine = ++run.current;
    setSpeaking(true);
    // One utterance per line: some browsers cut off long ones.
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      if (i === chunks.length - 1) {
        u.onend = u.onerror = () => {
          if (run.current === mine) setSpeaking(false);
        };
      }
      window.speechSynthesis.speak(u);
    });
  };

  if (!available) return null;
  return (
    <div className="readrow" data-noread>
      <button className="readbtn" onClick={speaking ? stop : start} aria-pressed={speaking}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {speaking ? (
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            <>
              <path d="M4 9v6h4l5 4V5L8 9z" />
              <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />
            </>
          )}
        </svg>
        {speaking ? "Stop reading" : "Read this to me"}
      </button>
    </div>
  );
}
