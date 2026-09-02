"use client";

import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { useLanguage } from "./LanguageProvider";

const LABELS: Record<Locale, string> = { uz: "UZ", en: "EN" };

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-surface p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
            locale === code
              ? "bg-accent text-white"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
