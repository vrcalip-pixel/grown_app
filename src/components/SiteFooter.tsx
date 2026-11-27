"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

/** The fine print at the foot of every page, in the language the visitor picked. */
export function SiteFooter({ checkedIso, version }: { checkedIso: string; version: string }) {
  const { lang, t } = useLanguage();
  const date = new Date(`${checkedIso}T00:00:00Z`).toLocaleDateString(lang === "es" ? "es-US" : lang === "km" ? "km" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <footer>
      <p>{t("footLegal", { date })}</p>
      <p>{t("footBuilt", { version })}</p>
    </footer>
  );
}
