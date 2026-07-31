import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "tsb-lang";

type Dict = Record<string, { ar: string; en: string }>;

/** UI chrome strings. Content pages stay Arabic-first; this keeps the shell translatable. */
export const dict: Dict = {
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.explore": { ar: "استكشف العالم", en: "Explore" },
  "nav.countries": { ar: "الدول", en: "Countries" },
  "nav.guides": { ar: "أدلة السفر", en: "Travel guides" },
  "nav.offers": { ar: "عروض الأسبوع", en: "Weekly offers" },
  "nav.calculator": { ar: "احسب تكلفة رحلتك", en: "Trip cost calculator" },
  "nav.plan": { ar: "خطط رحلتك", en: "Trip planning" },
  "nav.about": { ar: "من نحن", en: "About" },
  "nav.contact": { ar: "تواصل معنا", en: "Contact" },
  "nav.account": { ar: "حسابي", en: "My account" },
  "cta.budget": { ar: "احسب ميزانيتك", en: "Estimate my budget" },
  "menu.label": { ar: "القائمة", en: "Menu" },
  "lang.label": { ar: "اللغة", en: "Language" },
  "news.title": { ar: "نشرة السفر الأسبوعية", en: "Weekly travel newsletter" },
  "news.desc": {
    ar: "وجهات مختارة، نصائح ميزانية، وعروض قبل غيرك — رسالة واحدة كل أسبوع.",
    en: "Hand-picked destinations, budget tips and deals — one email a week.",
  },
  "news.placeholder": { ar: "بريدك الإلكتروني", en: "Your email address" },
  "news.submit": { ar: "اشترك", en: "Subscribe" },
  "news.done": { ar: "تم الاشتراك، شكرًا لك!", en: "You're subscribed. Thank you!" },
  "news.error": { ar: "تعذّر الاشتراك، حاول مرة أخرى.", en: "Subscription failed, please retry." },
  "crumb.home": { ar: "الرئيسية", en: "Home" },
};

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: (l) => {
        setLangState(l);
        window.localStorage.setItem(STORAGE_KEY, l);
      },
      t: (key) => dict[key]?.[lang] ?? String(key),
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return (
    useContext(LangContext) ?? {
      lang: "ar",
      dir: "rtl",
      setLang: () => undefined,
      t: (key) => dict[key]?.ar ?? String(key),
    }
  );
}
