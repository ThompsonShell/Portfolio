"use client";

import { useEffect, useState } from "react";
import { getAbout } from "@/lib/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { About } from "@/lib/types";

export default function Footer() {
  const { t, locale } = useLanguage();
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    getAbout(locale)
      .then(setAbout)
      .catch(() => setAbout(null));
  }, [locale]);

  const socials = [
    { label: "GitHub", href: about?.github_url },
    { label: "Telegram", href: about?.telegram_url },
    { label: "LinkedIn", href: about?.linkedin_url },
  ].filter((s) => s.href);

  return (
    <footer className="w-full bg-canvas">
      <div className="max-w-[1200px] mx-auto px-5 md:px-7">
        <div className="border-t border-line py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] font-medium text-ink-subtle">
            &copy; {new Date().getFullYear()} {t.footer.rights}
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-ink-muted">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href as string}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
