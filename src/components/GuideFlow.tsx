"use client";

import { useEffect, useState } from "react";
import { AskGrown } from "./AskGrown";
import { daysUntil, resolve, visibleQuestions, type Answers, type Result } from "@/engine";
import Link from "next/link";
import type { LivePack } from "@/pack/schema";

/**
 * One guide, start to finish: one question at a time, then the plan.
 * Answers live in this component's memory only. Nothing is stored or sent.
 */

type View = "result" | `q${number}`;

const ICONS = {
  ticket: (
    <>
      <path d="M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7v9H3z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  med: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  car: (
    <>
      <path d="M5 16l1.5-5h11L19 16" />
      <rect x="3" y="16" width="18" height="3" rx="1" />
    </>
  ),
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <span className="ico" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name]}
      </svg>
    </span>
  );
}

export function GuideFlow({ pack, checkedOn, backHref }: { pack: LivePack; checkedOn: string; backHref: string }) {
  const [view, setView] = useState<View>("q0");
  const [answers, setAnswers] = useState<Answers>({});

  // On each new screen, go to the top and hand focus to its heading, so a
  // screen reader announces the new question instead of staying on a button
  // that no longer exists. Skipped on first load.
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (!moved) return;
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>("#app [data-focus]")?.focus({ preventScroll: true });
  }, [view, moved]);

  const go = (v: View) => {
    setMoved(true);
    setView(v);
  };
  const restart = () => {
    setAnswers({});
    go("q0");
  };

  const askPanel = (faq: Result["faq"]) => <AskGrown answers={answers} faq={faq} />;

  let screen: React.ReactNode;

  if (view === "result") {
    screen = (
      <ResultView
        result={resolve(pack, answers)} ask={askPanel}
        checkedOn={checkedOn}
        onChange={() => go("q0")}
        onRestart={restart}
      />
    );
  } else {
    const qs = visibleQuestions(pack, answers);
    const i = Number(view.slice(1));
    const q = qs[i];
    if (!q) {
      // Past the last question for these answers: show the plan.
      screen = (
        <ResultView result={resolve(pack, answers)} ask={askPanel} checkedOn={checkedOn} onChange={() => go("q0")} onRestart={restart} />
      );
    } else {
      const pickAnswer = (id: string) => {
        const next = { ...answers, [q.id]: id };
        setAnswers(next);
        go(i + 1 < visibleQuestions(pack, next).length ? `q${i + 1}` : "result");
      };
      screen = (
        <>
          <div className="eyebrow">
            Question {i + 1} of {qs.length}
          </div>
          <div className="prog" aria-hidden="true">
            <i style={{ width: `${((i + 1) / qs.length) * 100}%` }} />
          </div>
          <h2 className="qtext" data-focus tabIndex={-1}>
            {q.text.en}
          </h2>
          {q.answers.map((a) => (
            <button
              key={a.id}
              className={`choice${answers[q.id] === a.id ? " picked" : ""}`}
              aria-pressed={answers[q.id] === a.id}
              onClick={() => pickAnswer(a.id)}
            >
              <span>
                {a.label.en}
                {a.sub && <small>{a.sub.en}</small>}
              </span>
            </button>
          ))}
          {q.why_visible ? (
            <div className="why open">
              <p>
                <b>Why Grown asks:</b> {q.why.en}
              </p>
            </div>
          ) : (
            <details className="why">
              <summary>Why Grown asks</summary>
              <p>{q.why.en}</p>
            </details>
          )}
          <div className="row">
            {i ? (
              <button className="btn ghost" onClick={() => go(`q${i - 1}`)}>
                Back
              </button>
            ) : (
              <Link className="btn ghost" href={backHref}>
                Back
              </Link>
            )}
          </div>
        </>
      );
    }
  }

  return (
    <main id="app">
      {/* The guide is in English, so the header's read-aloud button uses an English voice here. */}
      <div className="fade" key={view} data-read="en">
        {screen}
      </div>
    </main>
  );
}

function ResultView({
  result: r,
  ask,
  checkedOn,
  onChange,
  onRestart,
}: {
  result: Result;
  ask: (faq: Result["faq"]) => React.ReactNode;
  checkedOn: string;
  onChange: () => void;
  onRestart: () => void;
}) {
  return (
    <>
      <div className="eyebrow">Here&apos;s your plan</div>
      <h1 data-focus tabIndex={-1}>
        You&apos;ve got this. Here&apos;s what&apos;s going on.
      </h1>

      {r.urgent.map((u) => (
        <div className={`card ${u.tone}`} key={u.title} role={u.tone === "urgent" ? "alert" : undefined}>
          <h2>{u.title}</h2>
          <details>
            <summary>Show more</summary>
            {u.body.map((p, i) => (
              <p key={i} className={i === u.body.length - 1 ? "tight" : undefined}>
                {p}
              </p>
            ))}
          </details>
        </div>
      ))}

      <div className="card next">
        <h2 className="label">Your next move</h2>
        <div className="big">{r.nextMove.text}</div>
        {r.nextMove.why && (
          <details>
            <summary>Why this step</summary>
            <p className="tight">{r.nextMove.why}</p>
          </details>
        )}
        {r.nextMove.link && (
          <div className="row">
            <a className="btn onblue" href={r.nextMove.link.url}>
              {r.nextMove.link.label}
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="label">What this is</h2>
        <div className="lead">{r.whatThisIs.lead}</div>
        <details>
          <summary>Show more</summary>
          <p className="tight">{r.whatThisIs.detail}</p>
        </details>
      </div>

      {r.showDate && <DateCard />}

      {r.options.length > 0 && (
        <div className="card">
          <h2 className="label">Your options</h2>
          {r.options.map((o) => (
            <div className="opt" key={o.id}>
              <b>{o.title}</b>
              {o.fit === "good" && <span className="fit">Good fit for you</span>}
              {o.fit === "no" && <span className="fit no">Probably not for you</span>}
              <p style={{ margin: "4px 0 0" }}>{o.short}</p>
              <details>
                <summary>Show more</summary>
                <p className="tight">{o.body}</p>
                {o.source && (
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    Source: <a href={o.source.url}>{o.source.title}</a>
                  </p>
                )}
              </details>
            </div>
          ))}
        </div>
      )}

      {r.watchOut.length > 0 && (
        <div className="card warn">
          <h2 className="label">Watch out for</h2>
          <p className="tight" style={{ fontWeight: 600 }}>
            {r.watchOut[0]}
          </p>
          {r.watchOut.length > 1 && (
            <details>
              <summary>{r.watchOut.length - 1} more to know</summary>
              <ul>
                {r.watchOut.slice(1).map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {ask(r.faq)}

      <Feedback />

      <div className="card">
        <h2 className="label">Where this comes from</h2>
        <p className="muted">Every rule above comes from an official source, checked {checkedOn}.</p>
        <details>
          <summary>See all {r.sources.length} sources</summary>
          <ul className="src">
            {r.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url}>{s.title}</a>
                <span>{s.covers}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="row">
        <button className="btn ghost" onClick={onChange}>
          Change my answers
        </button>
        <button className="btn ghost" onClick={onRestart}>
          Start over
        </button>
      </div>
    </>
  );
}

/** The person types the date off their own paper. Grown only counts the days. */
function DateCard() {
  const [value, setValue] = useState("");
  const n = value ? daysUntil(value) : null;
  return (
    <div className="card">
      <h2 className="label">Your date</h2>
      <p>Type the date from your ticket. Grown counts the days.</p>
      <label htmlFor="due" className="muted">
        Due date or court date
      </label>
      <input type="date" id="due" value={value} onChange={(e) => setValue(e.target.value)} />
      <div aria-live="polite">
        {n !== null && !Number.isNaN(n) && n < 0 && (
          <>
            <div className="days" style={{ color: "var(--red)" }}>
              Passed
            </div>
            <p>That date already passed. Contact the court this week.</p>
          </>
        )}
        {n !== null && !Number.isNaN(n) && n >= 0 && (
          <>
            <div className="days">
              {n} day{n === 1 ? "" : "s"}
            </div>
            <p>
              until{" "}
              {new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              . Set a phone reminder for one week before, and don&apos;t leave it to the last day.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const FEEDBACK = {
  clear: "Glad it helped.",
  some: "Thanks. What part was fuzzy?",
  lost: "Sorry about that. Where did it lose you?",
} as const;

/** Stays on the screen. Nothing typed here is sent anywhere. */
function Feedback() {
  const [picked, setPicked] = useState<keyof typeof FEEDBACK | null>(null);
  return (
    <div className="card fb">
      <h2 className="label">Was this clear?</h2>
      <p className="muted">This tells us where people get stuck.</p>
      <div className="row">
        <button className="btn ghost" onClick={() => setPicked("clear")}>
          Clear
        </button>
        <button className="btn ghost" onClick={() => setPicked("some")}>
          Kind of
        </button>
        <button className="btn ghost" onClick={() => setPicked("lost")}>
          Lost me
        </button>
      </div>
      {picked && (
        <div>
          <p style={{ marginTop: 12 }}>{FEEDBACK[picked]}</p>
          {picked !== "clear" && <textarea rows={3} aria-label="Where you got stuck" placeholder="Type here" />}
          <p className="muted">
            In version one, this stays on your screen. Later versions will collect it anonymously so colleges and
            agencies can see where these systems break.
          </p>
        </div>
      )}
    </div>
  );
}
