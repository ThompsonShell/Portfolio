"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="max-w-[1200px] mx-auto px-5 md:px-7 py-28 text-center">
      <p className="font-mono text-[13px] font-bold text-accent tracking-widest">
        404
      </p>
      <h1 className="mt-4 text-[38px] md:text-[52px] font-extrabold text-ink tracking-tight">
        {t.notFound.title}
      </h1>
      <p className="mt-4 text-[16px] text-ink-muted max-w-md mx-auto">
        {t.notFound.subtitle}
      </p>
      <Link
        href="/"
        className="mt-9 inline-block px-7 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
      >
        {t.notFound.home}
      </Link>
    </div>
  );
}
