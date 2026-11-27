"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";

/** The frame for every page that is not a guide. The header's read-aloud button reads the part marked data-read. */
export function Page({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { lang } = useLanguage();

  return (
    <main id="app">
      <div className="fade" key={`${path}:${lang}`} data-read={lang}>
        {children}
      </div>
    </main>
  );
}
