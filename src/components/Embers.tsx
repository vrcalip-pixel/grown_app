"use client";

import { useEffect, useRef } from "react";

/**
 * The moving part of the background: soft points of blue light drifting up
 * through the dark, the way embers rise. Each one rises slowly, sways,
 * flickers, and fades out.
 *
 * Decoration only. It is drawn on one canvas behind the page, never takes a
 * tap, stops while the tab is in the background, and holds still as a single
 * frame for people who ask their device for less motion.
 */

interface Ember {
  x: number;
  y: number;
  /** Core size in CSS pixels. */
  size: number;
  /** Upward speed, pixels per second. */
  rise: number;
  /** Sideways sway: how far, how fast, and where in the swing it starts. */
  sway: number;
  swaySpeed: number;
  phase: number;
  /** Seconds lived and seconds to live. */
  age: number;
  life: number;
  /** Which colour sprite it uses. */
  tone: number;
  flicker: number;
}

// Cool blues, to match the horizon. (They were fire-orange until Nov 26, 2026.)
const TONES = ["120,196,250", "78,160,228", "196,232,255"];

/** A soft glowing dot, drawn once per colour and then stamped for every ember. */
function sprite(rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(240,250,255,1)");
  grad.addColorStop(0.12, `rgba(${rgb},.95)`);
  grad.addColorStop(0.4, `rgba(${rgb},.22)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sprites = TONES.map(sprite);
    let w = 0;
    let h = 0;
    let embers: Ember[] = [];

    const spawn = (anywhere: boolean): Ember => {
      const life = 9 + Math.random() * 14;
      return {
        x: Math.random() * w,
        // New embers lift off low on the page, near the glow; the first set is spread everywhere.
        y: anywhere ? Math.random() * h : h * (0.75 + Math.random() * 0.3),
        size: Math.random() < 0.12 ? 1.8 + Math.random() * 1.4 : 0.6 + Math.random() * 1.1,
        rise: 10 + Math.random() * 26,
        sway: 8 + Math.random() * 26,
        swaySpeed: 0.25 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        age: anywhere ? Math.random() * life : 0,
        life,
        tone: Math.floor(Math.random() * TONES.length),
        flicker: 2 + Math.random() * 5,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // About one ember per 11,000 square pixels: roughly 28 on a phone, 80 on a laptop.
      const count = Math.max(22, Math.min(90, Math.round((w * h) / 11000)));
      embers = Array.from({ length: count }, () => spawn(true));
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        let e = embers[i];
        e.age += dt;
        e.y -= e.rise * dt;
        if (e.age > e.life || e.y < -20) e = embers[i] = spawn(false);
        const t = e.age / e.life;
        // Fade in quickly, glow, then die away as it cools.
        const fade = Math.min(1, t * 8) * (1 - t) ** 1.4;
        const twinkle = 0.72 + 0.28 * Math.sin(e.age * e.flicker + e.phase);
        const x = e.x + Math.sin(e.age * e.swaySpeed + e.phase) * e.sway;
        const r = e.size * 7;
        ctx.globalAlpha = Math.max(0, fade * twinkle);
        ctx.drawImage(sprites[e.tone], x - r, e.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize);

    if (calm) {
      draw(0);
      return () => window.removeEventListener("resize", resize);
    }

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // Cap the step so a paused tab does not make every ember jump when it returns.
      draw(Math.min(0.05, (now - last) / 1000));
      last = now;
      frame = requestAnimationFrame(loop);
    };
    const onVisible = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };
    onVisible();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <canvas ref={ref} className="embers" />;
}
