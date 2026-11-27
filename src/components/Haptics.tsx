"use client";

import { useEffect } from "react";

/**
 * A light tap of vibration when a button is pressed, on phones that allow it.
 *
 * - Android browsers: the standard vibration call.
 * - iPhone Safari has no vibration call for web pages. Recent versions do give
 *   a small tick when a switch control is flipped, so this flips a hidden one.
 *   It is a workaround, and Apple could change it; if it stops working, nothing
 *   breaks, the tap is simply silent.
 * - Desktop computers have no vibration motor, so nothing happens there.
 *
 * (A ripple that spread across the page from each tap was tried and removed on
 * Nov 26, 2026 as too distracting. It is in the git history if it is wanted again.)
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

    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("button, summary, a.btn, a.catcard, a.listcard, a.menuitem, a.crumb") : null;
      if (!el || (el instanceof HTMLButtonElement && el.disabled)) return;
      // The hidden switch's own click must not start another tick.
      if (label && e.target instanceof Node && label.contains(e.target)) return;
      tick();
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      label?.remove();
    };
  }, []);

  return null;
}
