"use client";

import { useEffect, useRef, useState } from "react";
import type { Answers } from "@/engine";
import type { GuideReply, Turn } from "@/guide/ask";
import { LIMITS } from "@/guide/ask";

/**
 * "Ask Grown": a question box on the plan page. It is the one place in Grown
 * where something leaves the device, so it stays closed until the person has
 * read what is sent and chosen to go ahead. The conversation lives in this
 * component's memory and is gone when the page closes.
 */

interface Exchange {
  question: string;
  reply: GuideReply | null; // null while waiting
}

export function AskGrown({ answers, suggested }: { answers: Answers; suggested: string[] }) {
  const [available, setAvailable] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<Exchange[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = log.some((e) => e.reply === null);
  const full = log.length * 2 + 1 > LIMITS.maxTurns;

  // Only offer the panel when the server says it can answer.
  useEffect(() => {
    fetch("/api/guide")
      .then((r) => r.json())
      .then((d) => setAvailable(Boolean(d.available)))
      .catch(() => setAvailable(false));
  }, []);

  useEffect(() => {
    if (agreed) inputRef.current?.focus();
  }, [agreed]);

  if (!available) return null;

  const ask = async (text: string) => {
    const question = text.trim().slice(0, LIMITS.maxChars);
    if (!question || busy || full) return;
    setDraft("");

    // Only real answers are sent back as history. Fixed lines are left out.
    const turns: Turn[] = [];
    for (const e of log) {
      if (e.reply?.kind === "answer") {
        turns.push({ role: "user", text: e.question }, { role: "assistant", text: e.reply.text });
      }
    }
    turns.push({ role: "user", text: question });

    setLog((l) => [...l, { question, reply: null }]);
    let reply: GuideReply;
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, turns }),
      });
      const data = await res.json();
      reply = typeof data?.text === "string" ? data : { kind: "unavailable", text: "Ask Grown isn't available right now. Your plan on this page still stands.", sources: [] };
    } catch {
      reply = { kind: "unavailable", text: "Ask Grown isn't available right now. Your plan on this page still stands.", sources: [] };
    }
    setLog((l) => l.map((e, i) => (i === l.length - 1 ? { ...e, reply } : e)));
  };

  return (
    <div className="card ask">
      <h2 className="label">Ask Grown</h2>
      <div className="lead">Stuck on a word or a step?</div>

      {!agreed ? (
        <>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            Asking sends your question and the answers you tapped to Claude, an AI made by Anthropic, to write a reply.
            Grown doesn&apos;t save it. Please don&apos;t type your name, license number, or citation number.
          </p>
          <div className="row">
            <button className="btn" onClick={() => setAgreed(true)}>
              OK, ask a question
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="asklog" aria-live="polite">
            {log.map((e, i) => (
              <div key={i}>
                <p className="askq">{e.question}</p>
                {e.reply === null ? (
                  <p className="aska muted">Thinking it through…</p>
                ) : (
                  <div className={`aska${e.reply.kind === "answer" ? "" : " plain"}`}>
                    <p className="tight">{e.reply.text}</p>
                    {e.reply.sources.length > 0 && (
                      <p className="muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
                        {e.reply.kind === "answer" ? "From: " : "Look here: "}
                        {e.reply.sources.map((s, j) => (
                          <span key={s.url}>
                            {j > 0 && ", "}
                            <a href={s.url}>{s.title}</a>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {log.length === 0 && suggested.length > 0 && (
            <div className="chips">
              {suggested.map((s) => (
                <button key={s} className="chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {full ? (
            <p className="muted" style={{ margin: "10px 0 0" }}>
              That&apos;s the most questions Grown takes in one sitting. Your plan on this page still stands.
            </p>
          ) : (
            <form
              className="askform"
              onSubmit={(ev) => {
                ev.preventDefault();
                ask(draft);
              }}
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={draft}
                maxLength={LIMITS.maxChars}
                onChange={(ev) => setDraft(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" && !ev.shiftKey) {
                    ev.preventDefault();
                    ask(draft);
                  }
                }}
                aria-label="Your question"
                placeholder="Type your question"
              />
              <button className="btn" type="submit" disabled={busy || !draft.trim()}>
                Ask
              </button>
            </form>
          )}
          <p className="muted" style={{ margin: "10px 0 0", fontSize: 13 }}>
            Grown answers only from sources it has checked, and never guesses amounts or dates. It is not a lawyer.
          </p>
        </>
      )}
    </div>
  );
}
