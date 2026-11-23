"use client";

import { useEffect, useRef, useState } from "react";
import type { Answers, Result } from "@/engine";
import type { GuideReply, Turn } from "@/guide/ask";
import { LIMITS } from "@/guide/ask";

/**
 * "Ask Grown", on the plan page. Two layers:
 *
 * 1. Built-in questions. Tap one and the answer appears. The answers were
 *    written by the author from verified facts and chosen by the rules engine.
 *    No AI is involved and nothing leaves the device. This layer always works.
 *
 * 2. Ask in your own words. Only offered when the server has an AI key. It is
 *    the one place in Grown where something leaves the device, so it stays
 *    closed until the person has read what is sent and chosen to go ahead.
 *
 * The conversation lives in this component's memory and is gone when the page closes.
 */

interface Exchange {
  question: string;
  reply: GuideReply | null; // null while waiting
  builtin: boolean;
}

const UNAVAILABLE: GuideReply = {
  kind: "unavailable",
  text: "Ask Grown isn't available right now. Your plan on this page still stands.",
  sources: [],
};

export function AskGrown({ answers, faq }: { answers: Answers; faq: Result["faq"] }) {
  const [aiAvailable, setAiAvailable] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState<Exchange[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = log.some((e) => e.reply === null);
  const typed = log.filter((e) => !e.builtin).length;
  const full = typed * 2 + 1 > LIMITS.maxTurns;

  // Only offer free-typed questions when the server says it can answer them.
  useEffect(() => {
    fetch("/api/guide")
      .then((r) => r.json())
      .then((d) => setAiAvailable(Boolean(d.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    if (agreed) inputRef.current?.focus();
  }, [agreed]);

  const remaining = faq.filter((f) => !asked.includes(f.id));
  if (faq.length === 0 && !aiAvailable) return null;

  const tap = (item: Result["faq"][number]) => {
    setAsked((a) => [...a, item.id]);
    setLog((l) => [
      ...l,
      { question: item.question, builtin: true, reply: { kind: "answer", text: item.text, sources: item.sources } },
    ]);
  };

  const ask = async (text: string) => {
    const question = text.trim().slice(0, LIMITS.maxChars);
    if (!question || busy || full) return;
    setDraft("");

    // Only earlier typed questions with real answers go back as history.
    const turns: Turn[] = [];
    for (const e of log) {
      if (!e.builtin && e.reply?.kind === "answer") {
        turns.push({ role: "user", text: e.question }, { role: "assistant", text: e.reply.text });
      }
    }
    turns.push({ role: "user", text: question });

    setLog((l) => [...l, { question, reply: null, builtin: false }]);
    let reply: GuideReply;
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, turns }),
      });
      const data = await res.json();
      reply = typeof data?.text === "string" ? data : UNAVAILABLE;
    } catch {
      reply = UNAVAILABLE;
    }
    setLog((l) => l.map((e, i) => (i === l.length - 1 ? { ...e, reply } : e)));
  };

  return (
    <div className="card ask">
      <h2 className="label">Ask Grown</h2>
      <div className="lead">Stuck on a word or a step?</div>

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

      {remaining.length > 0 && (
        <div className="chips">
          {remaining.map((item) => (
            <button key={item.id} className="chip" onClick={() => tap(item)}>
              {item.question}
            </button>
          ))}
        </div>
      )}

      {aiAvailable && !agreed && (
        <div className="askown">
          <p className="muted tight">
            <b>Want to ask in your own words?</b> That sends your question and the answers you tapped to Claude, an AI
            made by Anthropic, to write a reply. Grown doesn&apos;t save it. Please don&apos;t type your name, license
            number, or citation number.
          </p>
          <div className="row">
            <button className="btn ghost" onClick={() => setAgreed(true)}>
              OK, let me type a question
            </button>
          </div>
        </div>
      )}

      {aiAvailable && agreed && (
        <>
          {full ? (
            <p className="muted" style={{ margin: "10px 0 0" }}>
              That&apos;s the most typed questions Grown takes in one sitting. Your plan on this page still stands.
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
        </>
      )}

      <p className="muted" style={{ margin: "12px 0 0", fontSize: 13 }}>
        Grown answers only from sources it has checked, and never guesses amounts or dates. It is not a lawyer.
      </p>
    </div>
  );
}
