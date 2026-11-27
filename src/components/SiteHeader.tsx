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

/**
 * The continents, much simplified, on a flat strip 64 units wide (a whole trip
 * round the world) and 26 tall. The header's globe slides this strip behind a
 * round window to make the Earth turn.
 */
const EARTH =
  "M2.7 6.6L7.1 5.9L15.1 5.6L18.7 7.0L21.3 8.8L18.1 10.9L17.4 12.4L14.8 13.4L13.3 12.8L10.7 11.1L9.8 9.1L5.3 7.6ZM14.8 13.4L17.8 14.8L18.7 14.6L23.1 16.0L25.8 17.0L24.9 19.2L21.7 21.5L19.9 23.8L19.0 22.5L19.6 18.6L17.6 16.7ZM22.2 7.3L24.0 4.2L28.4 4.7L27.6 6.2L24.5 7.3ZM29.0 13.8L31.1 10.9L33.8 10.7L37.7 11.5L39.6 14.3L41.1 14.4L39.1 18.2L37.7 20.0L35.6 20.9L34.1 18.5L33.6 15.4L30.6 15.3ZM30.2 10.7L30.4 9.8L32.0 8.8L32.9 7.6L34.1 6.5L37.0 5.9L39.1 6.5L39.1 9.2L36.8 10.2L34.7 10.5L32.5 9.8ZM39.1 6.5L44.4 5.6L50.7 5.0L56.9 5.6L62.2 6.5L60.4 7.6L56.9 8.8L54.8 10.5L53.3 12.4L51.2 14.3L49.8 15.3L48.9 13.4L46.2 14.8L44.8 13.1L42.7 12.4L40.9 12.0L39.1 10.8ZM52.3 19.2L55.1 17.7L57.2 17.6L59.2 19.9L58.0 21.5L55.3 20.6L52.6 20.9ZM0 27.6H64V29H0Z";

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
              {/* The Earth, turning slowly: oceans, land that drifts past, and shading that makes it a ball. */}
              <svg className="mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
                <defs>
                  <radialGradient id="mark-sea" cx="0.36" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#4fa6dc" />
                    <stop offset="0.55" stopColor="#1f6ea8" />
                    <stop offset="1" stopColor="#0b2f52" />
                  </radialGradient>
                  <radialGradient id="mark-shade" cx="0.34" cy="0.28" r="0.78">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
                    <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#020a16" stopOpacity="0.62" />
                  </radialGradient>
                  <clipPath id="mark-clip">
                    <circle cx="16" cy="16" r="13" />
                  </clipPath>
                </defs>
                <circle cx="16" cy="16" r="13" fill="url(#mark-sea)" />
                <g clipPath="url(#mark-clip)">
                  {/* The map is drawn twice, side by side, so the turn has no seam. */}
                  <g className="mark-land" fill="#7cc99a">
                    <path d={EARTH} />
                    <path d={EARTH} transform="translate(64 0)" />
                  </g>
                </g>
                <circle cx="16" cy="16" r="13" fill="url(#mark-shade)" />
                <circle cx="16" cy="16" r="13" fill="none" stroke="#bfe4fb" strokeOpacity="0.6" strokeWidth="0.9" />
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
