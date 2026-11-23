"use client";

import { useState, type CSSProperties } from "react";

/**
 * The Grown logo, animated. On load it plays once, about eight seconds:
 * a seed lands, a sprout comes up, the sprout becomes a small tree, and then a
 * vine grows slowly out of its roots and through the letters of "Grown",
 * passing behind some strokes and in front of others, with leaves unfurling
 * along it one at a time. Then it holds still. A tap plays it again.
 *
 * It is drawn as a vector, not a GIF: sharp at any size, light and dark aware,
 * almost weightless, and shown finished at once for people who ask for less motion.
 */

const at = (t: number, d?: number) => ({ "--t": `${t}s`, ...(d ? { "--d": `${d}s` } : {}) }) as CSSProperties;

// One vine, drawn twice: once behind the word and once in front, where the
// front copy is only allowed to show in a few windows. That is what makes it
// look threaded through the letters.
const VINE = "M27 49C38 55 50 46 60 37S78 26 88 36S103 48 114 38S130 26 140 35S152 46 162 33";

const LEAF = "M0 0C3-5.4 9.5-6.4 15-1.2C9.5 3.4 3 4.4 0 0Z";
const VEIN = "M0 0C5-1.8 10-1.8 14-1.2";

// Leaves along the vine: x, y, angle, gradient, when it opens, and whether it
// sits in front of the letters.
const LEAVES: [number, number, number, "a" | "b", number, boolean][] = [
  [44, 50.5, 28, "a", 4.0, false],
  [57, 39.5, -78, "b", 4.5, false],
  [70, 30, -150, "a", 5.0, true],
  [80, 28.5, -18, "b", 5.3, true],
  [94, 41, 62, "a", 5.8, false],
  [106, 44.5, 150, "b", 6.2, false],
  [117, 35, -70, "a", 6.6, true],
  [130, 28.5, -165, "b", 7.0, false],
  [141, 36, 48, "a", 7.4, false],
  [153, 42, 110, "b", 7.8, true],
  [162, 33, -62, "a", 8.1, true],
];

function Leaf({ x, y, r, g, t }: { x: number; y: number; r: number; g: "a" | "b"; t: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <g className="lg-leaf" style={at(t)}>
        <path d={LEAF} fill={`url(#lg-leaf-${g})`} />
        <path d={VEIN} fill="none" stroke="#f2fbf5" strokeOpacity=".55" strokeWidth=".55" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function GrownLogo() {
  const [run, setRun] = useState(0);

  return (
    <button className="brandbtn" onClick={() => setRun((n) => n + 1)} aria-label="Grown. Tap to replay the logo animation.">
      <svg key={run} className="logo" viewBox="0 0 176 66" aria-hidden="true">
        <defs>
          <linearGradient id="lg-leaf-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f8566" />
            <stop offset="1" stopColor="#a5d6ba" />
          </linearGradient>
          <linearGradient id="lg-leaf-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a9a7c" />
            <stop offset="1" stopColor="#c3e6cf" />
          </linearGradient>
          <linearGradient id="lg-bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5d4530" />
            <stop offset=".55" stopColor="#8d6c4b" />
            <stop offset="1" stopColor="#6b5038" />
          </linearGradient>
          <linearGradient id="lg-vine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4c8a6c" />
            <stop offset="1" stopColor="#7fb89b" />
          </linearGradient>
          <radialGradient id="lg-crown" cx=".38" cy=".3" r=".8">
            <stop offset="0" stopColor="#bfe4cd" />
            <stop offset=".55" stopColor="#78b396" />
            <stop offset="1" stopColor="#3f8566" />
          </radialGradient>
          <radialGradient id="lg-crown-deep" cx=".4" cy=".35" r=".8">
            <stop offset="0" stopColor="#8fc4a8" />
            <stop offset="1" stopColor="#2f6f55" />
          </radialGradient>
          <radialGradient id="lg-seedfill" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#b08a62" />
            <stop offset="1" stopColor="#6b4c33" />
          </radialGradient>
          {/* The windows where the vine passes in front of the letters. */}
          <clipPath id="lg-front">
            <rect x="64" y="0" width="20" height="66" />
            <rect x="110" y="0" width="14" height="66" />
            <rect x="147" y="0" width="29" height="66" />
          </clipPath>
        </defs>

        {/* A soft shadow on the ground under the tree. */}
        <ellipse className="lg-fade" style={at(1.2, 1.6)} cx="26" cy="50.5" rx="13" ry="2.2" fill="#000" opacity=".12" />

        {/* 1. The seed lands, then gives way to the sprout. */}
        <ellipse className="lg-seed" cx="26" cy="47.5" rx="5" ry="3.3" fill="url(#lg-seedfill)" transform="rotate(-18 26 47.5)" />

        {/* 4a. The vine, behind the word. */}
        <path className="lg-draw" pathLength={1} style={at(3.6, 4.6)} d={VINE} fill="none" stroke="url(#lg-vine)" strokeWidth="2.1" strokeLinecap="round" />
        {LEAVES.filter((l) => !l[5]).map(([x, y, r, g, t], i) => (
          <Leaf key={i} x={x} y={y} r={r} g={g} t={t} />
        ))}

        <text className="lg-word" x="50" y="44" fontSize="31" fontWeight="800" letterSpacing="-0.5" fill="currentColor">
          Grown
        </text>

        {/* 4b. The same vine again, in front of the word, only inside the windows. */}
        <g clipPath="url(#lg-front)">
          <path className="lg-draw" pathLength={1} style={at(3.6, 4.6)} d={VINE} fill="none" stroke="url(#lg-vine)" strokeWidth="2.1" strokeLinecap="round" />
        </g>
        {LEAVES.filter((l) => l[5]).map(([x, y, r, g, t], i) => (
          <Leaf key={i} x={x} y={y} r={r} g={g} t={t} />
        ))}

        {/* 2. The sprout: a stem that thickens into a trunk, and two first leaves. */}
        <path className="lg-rise" style={at(0.7, 1.7)} d="M23.2 50.5C24.6 42 24.9 33 24.4 23L27.8 23C27.3 33 27.8 42 29.4 50.5Z" fill="url(#lg-bark)" />
        <path className="lg-draw" pathLength={1} style={at(2.0, 0.9)} d="M25.6 35C22 32 19 30 15.5 27" fill="none" stroke="#6b5038" strokeWidth="1.5" strokeLinecap="round" />
        <path className="lg-draw" pathLength={1} style={at(2.15, 0.9)} d="M26.6 32C30 29 33 27.5 36.5 25" fill="none" stroke="#6b5038" strokeWidth="1.5" strokeLinecap="round" />
        <g transform="translate(26 39) rotate(-150)">
          <g className="lg-sprout">
            <path d={LEAF} fill="url(#lg-leaf-a)" />
          </g>
        </g>
        <g transform="translate(26 37) rotate(-32)">
          <g className="lg-sprout">
            <path d={LEAF} fill="url(#lg-leaf-b)" />
          </g>
        </g>

        {/* 3. The tree: the crown fills in, darker clusters first, lit ones on top. */}
        <circle className="lg-pop c" style={at(2.3)} cx="16" cy="25" r="8.6" fill="url(#lg-crown-deep)" />
        <circle className="lg-pop c" style={at(2.45)} cx="36" cy="24.5" r="8.8" fill="url(#lg-crown-deep)" />
        <circle className="lg-pop c" style={at(2.6)} cx="26" cy="27" r="8" fill="url(#lg-crown-deep)" />
        <circle className="lg-pop c" style={at(2.8)} cx="20" cy="17" r="9.4" fill="url(#lg-crown)" />
        <circle className="lg-pop c" style={at(2.95)} cx="32" cy="16" r="9.8" fill="url(#lg-crown)" />
        <circle className="lg-pop c" style={at(3.15)} cx="26" cy="11" r="8.4" fill="url(#lg-crown)" />
        <circle className="lg-pop c" style={at(3.4)} cx="22.5" cy="9.5" r="3.4" fill="#d6f0e0" opacity=".55" />
      </svg>
    </button>
  );
}
