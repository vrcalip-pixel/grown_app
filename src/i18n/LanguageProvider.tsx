"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { pick, STRINGS, type Lang, type StringKey } from "./strings";

/**
 * Which language the page is in. It starts in English, or in Spanish or Khmer
 * if that is the phone's own language. A tap on the switch changes it. The
 * choice is held in memory for the visit and is not stored, in keeping with
 * "nothing you tap is saved".
 */

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Text for a named page string. */
  t: (key: StringKey, vars?: Record<string, string>) => string;
  /** Text from a guide pack string that carries its own translations. */
  tr: (entry: { en: string; es?: string | null; km?: string | null }) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const phone = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (phone === "es" || phone === "km") setLangState(phone);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback(
    (key: StringKey, vars?: Record<string, string>) => {
      let s = pick(STRINGS[key], lang);
      for (const [k, v] of Object.entries(vars ?? {})) s = s.replace(`{${k}}`, v);
      return s;
    },
    [lang],
  );
  const tr = useCallback((entry: Parameters<Ctx["tr"]>[0]) => pick(entry, lang), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t, tr }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
