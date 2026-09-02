"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

/** The deep indigo call-to-action band used on the home and works pages. */
export default function CoffeeBanner({
  title,
  subtitle,
  cta,
  href = "/coffee",
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
}) {
  const { t } = useLanguage();

  return (
    <section className="rounded-3xl bg-gradient-to-r from-night-deep to-night px-8 md:px-11 py-10 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-7">
      <div>
        <h2 className="text-[26px] md:text-[30px] font-extrabold text-white tracking-tight">
          {title ?? t.home.coffeeTitle}
        </h2>
        <p className="mt-2 text-[15px] text-white/55">
          {subtitle ?? t.home.coffeeSub}
        </p>
      </div>
      <Link
        href={href}
        className="shrink-0 px-7 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold shadow-lg shadow-accent/25 hover:bg-[#6D28D9] transition-colors text-center"
      >
        {cta ?? t.home.coffeeCta} →
      </Link>
    </section>
  );
}
