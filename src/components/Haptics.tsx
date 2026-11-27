"use client";

import { useEffect } from "react";

/**
 * What a tap feels like: a light vibration, and a ripple that spreads across
 * the whole page from the spot that was pressed.
 *
 * Vibration, on phones that allow it:
 * - Android browsers: the standard vibration call.
 * - iPhone Safari has no vibration call for web pages. Recent versions do give
 *   a small tick when a switch control is flipped, so this flips a hidden one.
 *   It is a workaround, and Apple could change it; if it stops working, nothing
 *   breaks, the tap is simply silent.
 * - Desktop computers have no vibration motor, so nothing happens there.
 *
 * Ripple: a ring of light that grows from the tap to the far corner of the
 * screen and fades. It sits above the page, never takes a tap, and is skipped
 * for people who ask their device for less motion.
 */
export function Haptics() {
  useEffect(() => {
    let label: HTMLLabelElement | null = null;

    const tick = () => {
      try {
        if (typeof navigator.vibrate === "function" && navigator.vibrate(8)) return;
        if (!label) {
          label = document.createElement("label");
          label.setAttribute("aria-hidden", "true");
          label.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
          const box = document.createElement("input");
          box.type = "checkbox";
          box.setAttribute("switch", "");
          box.tabIndex = -1;
          label.appendChild(box);
          document.body.appendChild(label);
        }
        label.click();
      } catch {
        /* no haptics on this device */
      }
    };

    const ripple = (x: number, y: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Big enough to reach the farthest corner of the screen from the tap.
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const ring = document.createElement("span");
      ring.className = "ripple";
      ring.setAttribute("aria-hidden", "true");
      ring.style.cssText = `left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px`;
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 1300);
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("button, summary, a.btn, a.catcard, a.listcard, a.menuitem, a.crumb") : null;
      if (!el || (el instanceof HTMLButtonElement && el.disabled)) return;
      // The hidden switch's own click must not start another tick.
      if (label && e.target instanceof Node && label.contains(e.target)) return;
      tick();
      // A press from the keyboard has no position, so the ripple starts at the button's centre.
      if (e.detail === 0 || (e.clientX === 0 && e.clientY === 0)) {
        const box = el.getBoundingClientRect();
        ripple(box.left + box.width / 2, box.top + box.height / 2);
      } else {
        ripple(e.clientX, e.clientY);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      label?.remove();
    };
  }, []);

  return null;
}
