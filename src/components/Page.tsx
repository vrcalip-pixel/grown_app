"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ReadAloud } from "./ReadAloud";

/** The frame for every page that is not a guide: the read-aloud button, then the page. */
export function Page({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const { lang, t } = useLanguage();

  return (
    <main id="app">
      <ReadAloud target={ref} screenKey={`${path}:${lang}`} lang={lang} startLabel={t("readAloud")} stopLabel={t("stopReading")} />
      <div className="fade" key={`${path}:${lang}`} ref={ref}>
        {children}
      </div>
    </main>
  );
}
