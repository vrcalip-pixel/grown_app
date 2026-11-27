"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGS } from "@/i18n/strings";
import { ReadAloud } from "./ReadAloud";
import { ThemeToggle } from "./ThemeToggle";

/** The bar at the top of every page: logo, the three sections, language, and light or dark. */

const NAV = [
  {
    href: "/auto",
    label: "navAuto" as const,
    icon: (
      <>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
  },
  {
    href: "/residences",
    label: "navResidences" as const,
    icon: (
      <>
        <path d="M3 11l9-7 9 7v9H3z" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    href: "/sources",
    label: "navSources" as const,
    icon: (
      <>
        <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
        <path d="M12 6v14" />
      </>
    ),
  },
];

export function SiteHeader() {
  const { lang, setLang, t } = useLanguage();
  const path = usePathname();

  return (
    <header>
      <div className="hwrap">
        <div className="hleft">
          <Link href="/" className="brandlink" aria-label={t("navHome")}>
            <span className="wordmark">Grown</span>
          </Link>
          <ReadAloud lang={lang} startLabel={t("readAloud")} stopLabel={t("stopReading")} />
        </div>
        <div className="hright">
          <nav className="hnav" aria-label="Sections">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`navbtn${path.startsWith(n.href) ? " on" : ""}`}
                aria-label={t(n.label)}
                title={t(n.label)}
                aria-current={path.startsWith(n.href) ? "page" : undefined}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {n.icon}
                </svg>
              </Link>
            ))}
          </nav>
          <div className="langs" role="group" aria-label={t("langSwitcher")}>
            {LANGS.map((l) => (
              <button key={l.id} className={lang === l.id ? "on" : ""} aria-pressed={lang === l.id} aria-label={l.name} lang={l.id} onClick={() => setLang(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
