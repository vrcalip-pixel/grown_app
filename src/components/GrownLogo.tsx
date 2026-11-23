"use client";

import { useState, type CSSProperties } from "react";

/**
 * The Grown logo, animated. On load it plays once, about four seconds:
 * a seed lands, a sprout comes up, the sprout becomes a small tree, and a vine
 * grows out from its roots and over its crown to wrap the word "Grown" in leaves.
 * Then it holds still. A tap plays it again.
 *
 * It is drawn as a vector, not a GIF: it stays sharp at any size, follows light
 * and dark mode, weighs almost nothing, and shows its finished state at once
 * for people who ask their device for less motion.
 */

const at = (t: number, d?: number) => ({ "--t": `${t}s`, ...(d ? { "--d": `${d}s` } : {}) }) as CSSProperties;

const LEAF = "M0 0c0-5.5 3.2-8 8.5-8 0 5.5-3.2 8-8.5 8z";

// Where each vine leaf sits: x, y, angle, colour, and when it opens.
const VINE_LEAVES: [number, number, number, string, number][] = [
  [58, 54.5, 95, "#8fb8a6", 2.85],
  [80, 56, -8, "#6fa08c", 3.0],
  [103, 56.2, 100, "#9cc4b2", 3.15],
  [126, 54.5, -5, "#8fb8a6", 3.3],
  [149, 49, 60, "#6fa08c", 3.45],
  [161, 36, -40, "#9cc4b2", 3.6],
  [62, 9.5, -50, "#9cc4b2", 3.05],
  [86, 7, 150, "#8fb8a6", 3.25],
  [110, 7.8, -45, "#6fa08c", 3.45],
  [132, 11.5, 140, "#9cc4b2", 3.65],
];

export function GrownLogo() {
  const [run, setRun] = useState(0);

  return (
    <button className="brandbtn" onClick={() => setRun((n) => n + 1)} aria-label="Grown. Tap to replay the logo animation.">
      <svg key={run} className="logo" viewBox="0 0 176 66" aria-hidden="true">
        {/* 1. The seed lands, then gives way to the sprout. */}
        <ellipse className="lg-seed" cx="26" cy="47" rx="5" ry="3.4" fill="#8a6a4a" transform="rotate(-18 26 47)" />

        {/* 4. The vine: out from the roots and under the word, then up around its end. */}
        <path
          className="lg-draw"
          pathLength={1}
          style={at(2.6, 1.1)}
          d="M26 50C48 57 112 59 146 51c12-3 17-11 14-19-2-6-9-7-12-2"
          fill="none"
          stroke="#6fa08c"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* ...and a second runner from the crown, over the top of the word. */}
        <path
          className="lg-draw"
          pathLength={1}
          style={at(2.8, 1)}
          d="M36 15C56 5 104 3 138 13"
          fill="none"
          stroke="#6fa08c"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {VINE_LEAVES.map(([x, y, r, fill, t], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path className="lg-pop" style={at(t)} d={LEAF} fill={fill} />
          </g>
        ))}

        {/* 2. The sprout: a stem and two first leaves. */}
        <path
          className="lg-draw lg-trunk"
          pathLength={1}
          style={at(0.5, 0.7)}
          d="M26 50V22"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
        />
        <g transform="translate(26 38)">
          <path className="lg-sprout" d="M0 0c0-6-4-9-10-9 0 6 4 9 10 9z" fill="#8fb8a6" />
        </g>
        <g transform="translate(26 36)">
          <path className="lg-sprout" d="M0 0c0-5 3.5-8 9-8 0 5-3.5 8-9 8z" fill="#9cc4b2" />
        </g>

        {/* 3. The tree: the crown fills in. */}
        <circle className="lg-pop c" style={at(1.5)} cx="17" cy="24" r="8.5" fill="#6fa08c" />
        <circle className="lg-pop c" style={at(1.65)} cx="35" cy="24" r="8.5" fill="#7fae99" />
        <circle className="lg-pop c" style={at(1.8)} cx="26" cy="17" r="12" fill="#8fb8a6" />
        <circle className="lg-pop c" style={at(2.0)} cx="22" cy="12" r="5.5" fill="#a9cdbd" />

        <text className="lg-word" x="50" y="43" fontSize="31" fontWeight="800" letterSpacing="-0.5" fill="currentColor">
          Grown
        </text>
      </svg>
    </button>
  );
}
