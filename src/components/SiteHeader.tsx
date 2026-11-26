"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGS } from "@/i18n/strings";
import { GrownLogo } from "./GrownLogo";
import { ThemeToggle } from "./ThemeToggle";

/** The bar at the top of every page: logo, the three sections, language, and light or dark. */

const NAV = [
  {
    href: "/auto",
    label: "navAuto" as const,
    icon: (
      <>
        <path d="M5 16l1.5-5h11L19 16" />
        <rect x="3" y="16" width="18" height="3" rx="1" />
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
        <Link href="/" className="brandlink" aria-label={t("navHome")}>
          <GrownLogo />
        </Link>
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
