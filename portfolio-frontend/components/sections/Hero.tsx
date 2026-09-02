"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

/** The mission_control.sh panel on the right of the hero. Lines reveal one at a
 *  time so the block reads like a session, not a screenshot. */
const TERMINAL_LINES: { text: string; tone: string }[] = [
  { text: "// mission_control.sh", tone: "text-white/25" },
  { text: "$ satellite --status", tone: "text-emerald-300" },
  { text: "● SAT-001 online", tone: "text-amber-300" },
  { text: "└ orbit: 408km LEO", tone: "text-white/40" },
  { text: "└ signal: ███████░░ 82%", tone: "text-white/40" },
  { text: "└ uplink: 2.4 Gbps", tone: "text-white/40" },
  { text: "", tone: "" },
  { text: "$ deploy --target=production", tone: "text-emerald-300" },
  { text: "✓ deployed successfully", tone: "text-emerald-400" },
];

function MissionControl() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= TERMINAL_LINES.length) return;
    const id = window.setTimeout(() => setVisible((n) => n + 1), 260);
    return () => window.clearTimeout(id);
  }, [visible]);

  return (
    <div className="rounded-2xl bg-[#16132e]/90 border border-white/10 shadow-lift overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 font-mono text-[11px] text-white/40">
          mission_control.sh
        </span>
      </div>

      <div className="p-5 font-mono text-[12px] leading-[1.9] min-h-[220px]">
        {TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <div key={i} className={`${line.tone} animate-fade-up`}>
            {line.text || " "}
          </div>
        ))}
        {visible >= TERMINAL_LINES.length && (
          <span className="inline-block w-[7px] h-[14px] bg-emerald-400/80 align-middle animate-blink" />
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="px-5 md:px-7 pt-6">
      <div className="max-w-[1330px] mx-auto rounded-[28px] overflow-hidden relative bg-gradient-to-br from-night via-[#3B1E86] to-accent">
        {/* Soft glow so the flat gradient gets some depth */}
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl pointer-events-none"
        />

        <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-14 items-center px-7 md:px-14 py-14 md:py-16">
          {/* Left */}
          <div>
            <p className="flex items-center gap-2.5 text-[13px] font-medium text-white/75 mb-7">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
              {t.home.available}
            </p>

            <h1 className="text-[52px] md:text-[68px] font-extrabold text-white leading-[0.95] tracking-tight">
              Asilbek
              <br />
              <span className="text-[#C4B5FD]">Rajabov.</span>
            </h1>

            <p className="mt-6 text-[17px] leading-relaxed text-white/75 max-w-md">
              {t.home.role}
            </p>

            <p className="mt-4 text-[14px] italic text-white/45 max-w-md">
              {t.home.quote}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/works"
                className="px-6 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold shadow-lg shadow-accent/25 hover:bg-[#6D28D9] transition-colors"
              >
                {t.home.ctaWorks}
              </Link>
              <Link
                href="/lectures"
                className="px-6 py-3.5 rounded-xl border border-white/25 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors"
              >
                {t.home.ctaLectures} →
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="hidden lg:block">
            <MissionControl />
          </div>
        </div>
      </div>
    </section>
  );
}
