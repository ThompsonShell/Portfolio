"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function NavBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet whenever navigation actually happens.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/blog", label: t.nav.blog },
    { href: "/lectures", label: t.nav.lectures },
    { href: "/works", label: t.nav.works },
    { href: "/mentors", label: t.nav.mentors },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas/85 backdrop-blur-xl border-b border-line/70">
      <div className="max-w-[1400px] mx-auto px-5 md:px-7 h-[60px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="w-7 h-7 rounded-lg bg-accent text-white grid place-items-center text-[13px] font-black shadow-sm transition-transform group-hover:scale-105">
            A
          </span>
          <span className="text-[15px] font-extrabold tracking-tight text-ink">
            asilbek.dev
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LanguageToggle className="hidden sm:inline-flex" />
          <Link
            href="/coffee"
            className="px-4 py-2 rounded-xl bg-ink text-white text-[13px] font-semibold hover:bg-ink/85 transition-colors"
          >
            {t.nav.coffee}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="md:hidden w-9 h-9 grid place-items-center rounded-lg border border-line text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-line bg-canvas px-5 py-3">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 mt-2 border-t border-line">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
