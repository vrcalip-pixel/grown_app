"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * The fine print at the foot of every page, in the language the visitor picked.
 * It opens with the trust promise: who Explainer is not, and what it never asks for or keeps.
 */
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
      <p>
        <strong>{t("footTrust")}</strong> {t("footRole")}
      </p>
      <p>{t("footPrivacy")}</p>
      <p>{t("footFacts", { date })}</p>
      <p>{t("footBuilt", { version })}</p>
    </footer>
  );
}
