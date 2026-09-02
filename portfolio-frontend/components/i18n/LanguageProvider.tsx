"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  dictionaries,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionaries";

const STORAGE_KEY = "asilbek.locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start on the default so server and first client render agree; the stored
  // preference is applied in an effect to avoid a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
      const browser = window.navigator.language.slice(0, 2);
      if (isLocale(browser)) setLocaleState(browser);
    } catch {
      // Private mode or blocked storage — the default locale is fine.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference just won't persist; the session still switches.
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] as Dictionary }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
