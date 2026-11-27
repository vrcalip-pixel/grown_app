"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGS } from "@/i18n/strings";
import { ReadAloud } from "./ReadAloud";
import { ICON } from "./views";

/**
 * The bar at the top of every page: logo, read aloud, language, and the grid
 * menu of every section at the far right.
 */

const icon = (d: ReactNode, size: number) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const BOOK = (
  <>
    <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
    <path d="M12 6v14" />
  </>
);

/** Nine dots: the "all sections" button. */
const GRID = (
  <g fill="currentColor" stroke="none">
    {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />))}
  </g>
);

export function SiteHeader() {
  const { lang, setLang, t, tr } = useLanguage();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  // The highlight behind the chosen language slides to wherever that button is.
  const langs = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const box = langs.current;
    if (!box) return;
    const place = () => {
      const on = box.querySelector<HTMLElement>("button.on");
      if (on) setPill({ x: on.offsetLeft, w: on.offsetWidth });
    };
    place();
    // Button widths change when the font finishes loading or the window is resized.
    const watch = new ResizeObserver(place);
    watch.observe(box);
    return () => watch.disconnect();
  }, [lang]);

  // Every section, in one place. A new section added to the app shows up here by itself.
  const sections = [
    { href: "/car", label: t("catAuto"), tone: "blue", icon: ICON.car },
    ...Object.entries(PREVIEW_CATEGORIES).map(([id, c]) => ({ href: `/${id}`, label: tr(c.name), tone: c.tone as string, icon: ICON[c.icon] })),
    { href: "/sources", label: t("menuSources"), tone: "grey", icon: BOOK },
  ];

  // Close the menu on a new page, a tap outside it, or Escape.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <header>
      <div className="hwrap">
        <div className="hleft">
          <Link href="/" className="brandlink" aria-label={t("navHome")}>
            <span className="wordmark">
              {/* A lit sphere: a faint ring with one bright edge, like light catching a planet. The light travels slowly round it. */}
              <svg className="mark" width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="16" cy="16" r="12" strokeOpacity="0.3" />
                <path className="mark-light" d="M7.5 7.5a12 12 0 0 1 17 0" />
              </svg>
              Explainer
            </span>
          </Link>
          <ReadAloud lang={lang} startLabel={t("readAloud")} stopLabel={t("stopReading")} />
        </div>
        <div className="langs" role="group" aria-label={t("langSwitcher")} ref={langs}>
          {pill && <span className="langpill" aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />}
          {LANGS.map((l) => (
            <button key={l.id} className={lang === l.id ? "on" : ""} aria-pressed={lang === l.id} aria-label={l.name} lang={l.id} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="menuwrap" ref={menu}>
          <button
            className={`navbtn${open ? " on" : ""}`}
            aria-label={t("menuAll")}
            title={t("menuAll")}
            aria-expanded={open}
            aria-controls="sections-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {icon(GRID, 22)}
          </button>
          {open && (
            <nav className="menu" id="sections-menu" aria-label={t("menuAll")}>
              {sections.map((s) => {
                const here = path.startsWith(s.href);
                return (
                  <Link key={s.href} href={s.href} className={`menuitem${here ? " on" : ""}`} aria-current={here ? "page" : undefined} onClick={() => setOpen(false)}>
                    <span className={`cattile ${s.tone}`}>{icon(s.icon, 26)}</span>
                    <span>{s.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
