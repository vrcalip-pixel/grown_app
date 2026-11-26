"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Light and dark switch. The page starts in whatever the phone is set to. A tap
 * fades it over to the other look. The choice is kept in memory only, in
 * keeping with "nothing you tap is saved", so the next visit follows the phone again.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  if (!theme) return <span className="themebtn" style={{ visibility: "hidden" }} aria-hidden="true" />;

  const next = theme === "dark" ? "light" : "dark";

  const flip = () => {
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next;
      flushSync(() => setTheme(next));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (doc.startViewTransition && !calm) {
      // The browser cross-fades a picture of the old look into the new one.
      doc.startViewTransition(apply);
    } else if (!calm) {
      // Older browsers: fade the colours themselves.
      root.classList.add("theme-fade");
      apply();
      window.setTimeout(() => root.classList.remove("theme-fade"), 1000);
    } else {
      apply();
    }
  };

  return (
    <button className="themebtn" aria-label={t(next === "dark" ? "toDark" : "toLight")} title={t(next === "dark" ? "toDark" : "toLight")} onClick={flip}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
