"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Tapping a card opens it: the card grows to fill the page and the new page
 * fades in inside it, so it feels like stepping into the card.
 *
 * It uses the browser's own view-transition feature. Where a browser does not
 * have it, or the person has asked their device for less motion, the link
 * simply opens the usual way.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const same = (a: string, b: string) => a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

export function CardTransitions() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Leave new-tab clicks and the like alone.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const card = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a.catcard, a.listcard") : null;
      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };
      if (!card || !doc.startViewTransition) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const href = card.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const target = BASE && href.startsWith(BASE) ? href.slice(BASE.length) || "/" : href;

      e.preventDefault();
      const from = document.querySelector("[data-read]");
      // The card and the page it opens share one name, so the browser morphs one into the other.
      card.style.viewTransitionName = "opened-card";
      let page: HTMLElement | null = null;

      const transition = doc.startViewTransition(
        () =>
          new Promise<void>((done) => {
            router.push(target);
            const started = performance.now();
            const check = () => {
              const now = document.querySelector<HTMLElement>("[data-read]");
              const arrived = now && now !== from && same(window.location.pathname, BASE + target);
              if (arrived || performance.now() - started > 2500) {
                card.style.viewTransitionName = "";
                if (arrived && now) {
                  page = now;
                  // The page's own small entrance would fight the morph, so it sits still for this one.
                  now.style.animation = "none";
                  now.style.viewTransitionName = "opened-card";
                }
                window.scrollTo({ top: 0 });
                done();
              } else {
                window.setTimeout(check, 16);
              }
            };
            // A timer, not an animation frame: the browser holds frames back while it waits for the new page.
            window.setTimeout(check, 16);
          }),
      );
      transition.finished.finally(() => {
        card.style.viewTransitionName = "";
        if (page) page.style.viewTransitionName = "";
      });
    };

    // Capture phase, so this runs before the link's own handler and can take over the navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
