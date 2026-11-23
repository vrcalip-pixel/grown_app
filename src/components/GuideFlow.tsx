"use client";

import { useEffect, useState } from "react";
import { daysUntil, resolve, visibleQuestions, type Answers, type Result } from "@/engine";
import type { LivePack, PreviewPack } from "@/pack/schema";

/**
 * The whole flow on one screen, as in v1.1: home, one question at a time, result.
 * Answers live in this component's memory only. Nothing is stored or sent.
 */

type View = "home" | "lease" | "result" | `q${number}`;

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

export function GuideFlow({ pack, lease, checkedOn }: { pack: LivePack; lease: PreviewPack; checkedOn: string }) {
  const [view, setView] = useState<View>("home");
  const [answers, setAnswers] = useState<Answers>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const go = (v: View) => setView(v);
  const restart = () => {
    setAnswers({});
    go("home");
  };

  let screen: React.ReactNode;

  if (view === "home") {
    screen = (
      <>
        <p className="muted">For anyone figuring out adult life without someone who&apos;s done it before.</p>
        <h1>A letter showed up. Let&apos;s figure out your next move.</h1>
        <p>
          Pick what&apos;s in your hand. Grown asks a few plain questions, then tells you what it means, what your
          options are, and the one thing to do next.
        </p>
        <p className="muted">
          Grown is not the court, the police, or immigration. No account. No name, license number, or income. No
          trackers. Nothing you tap is saved.
        </p>
        <button className="choice" onClick={() => go("q0")}>
          <Icon name="ticket" />
          <span>
            {pack.title.en}
            <small>Long Beach, CA · about 2 minutes</small>
          </span>
        </button>
        <button className="choice" onClick={() => go("lease")}>
          <Icon name="home" />
          <span>
            My first lease<small>Preview: see how the next guide will work</small>
          </span>
        </button>
        <button className="choice" disabled>
          <Icon name="med" />
          <span>
            A medical bill I don&apos;t understand<small>Coming next</small>
          </span>
        </button>
        <button className="choice" disabled>
          <Icon name="car" />
          <span>
            A letter from the DMV<small>Coming next</small>
          </span>
        </button>
      </>
    );
  } else if (view === "lease") {
    screen = (
      <>
        <div className="muted">Preview · not live yet</div>
        <h1>{lease.title.en}</h1>
        <p>{lease.intro.en}</p>
        <div className="card">
          {lease.rows.map((r, i) => (
            <div className="opt" key={i}>
              <b>
                {i + 1}. {r.q.en}
              </b>
              <p style={{ margin: "6px 0 0" }}>{r.a.en}</p>
            </div>
          ))}
        </div>
        <div className="card warn">
          <p className="tight">{lease.note.en}</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => go("q0")}>
            Try the live ticket guide
          </button>
          <button className="btn ghost" onClick={() => go("home")}>
            Back
          </button>
        </div>
      </>
    );
  } else if (view === "result") {
    screen = (
      <ResultView
        result={resolve(pack, answers)}
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
        <ResultView result={resolve(pack, answers)} checkedOn={checkedOn} onChange={() => go("q0")} onRestart={restart} />
      );
    } else {
      const pickAnswer = (id: string) => {
        const next = { ...answers, [q.id]: id };
        setAnswers(next);
        go(i + 1 < visibleQuestions(pack, next).length ? `q${i + 1}` : "result");
      };
      screen = (
        <>
          <div className="muted">
            Question {i + 1} of {qs.length}
          </div>
          <div className="prog">
            <i style={{ width: `${(i / qs.length) * 100}%` }} />
          </div>
          <h2>{q.text.en}</h2>
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
          <div className="why">
            <b>Why Grown asks:</b> {q.why.en}
          </div>
          <div className="row">
            <button className="btn ghost" onClick={() => go(i ? `q${i - 1}` : "home")}>
              Back
            </button>
          </div>
        </>
      );
    }
  }

  return (
    <main id="app" aria-live="polite">
      <div className="fade" key={view}>
        {screen}
      </div>
    </main>
  );
}

function ResultView({
  result: r,
  checkedOn,
  onChange,
  onRestart,
}: {
  result: Result;
  checkedOn: string;
  onChange: () => void;
  onRestart: () => void;
}) {
  return (
    <>
      <div className="muted">Here&apos;s your plan</div>
      <h1>You&apos;ve got this. Here&apos;s what&apos;s going on.</h1>

      {r.urgent.map((u) => (
        <div className={`card ${u.tone}`} key={u.title}>
          <h2>{u.title}</h2>
          {u.body.map((p, i) => (
            <p key={i} className={i === u.body.length - 1 ? "tight" : undefined}>
              {p}
            </p>
          ))}
        </div>
      ))}

      <div className="card next">
        <h2>Your next move</h2>
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
        <h2>What this is</h2>
        <div className="lead">{r.whatThisIs.lead}</div>
        <details>
          <summary>Show more</summary>
          <p className="tight">{r.whatThisIs.detail}</p>
        </details>
      </div>

      {r.showDate && <DateCard />}

      {r.options.length > 0 && (
        <div className="card">
          <h2>Your options</h2>
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
          <h2>Watch out for</h2>
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

      <Feedback />

      <div className="card">
        <h2>Where this comes from</h2>
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
      <h2>Your date</h2>
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
      <h2>Was this clear?</h2>
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
