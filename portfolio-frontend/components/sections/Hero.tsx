"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getAbout } from "@/lib/api";
import type { About } from "@/lib/types";

export default function Hero() {
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    getAbout().then(setAbout).catch(() => {});
  }, []);

  const socialLinks = [
    { label: "GitHub", href: about?.github_url || "#" },
    { label: "LinkedIn", href: about?.linkedin_url || "#" },
    { label: "Telegram", href: about?.telegram_url || "#" },
    ...(about?.resume_url ? [{ label: "Resume ↓", href: about.resume_url }] : []),
  ];
  return (
    <section className="border-b border-[#1a1a1a]">
      {/* ── MOBILE: centered layout (image 1 style) ── */}
      <div className="md:hidden flex flex-col items-center text-center px-6 py-16">
        <p className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] uppercase mb-10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 block" />
          Software Engineer · Tashkent
        </p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold tracking-tighter text-white leading-[0.9]"
        >
          Thompson
          <br />
          Shell
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold tracking-tighter italic text-white mt-2 leading-none select-none"
        >
          builds systems.
        </motion.p>

        <p className="text-sm font-medium leading-relaxed text-[#8c8c94] max-w-xs mt-10 mb-10">
          Backend architectures that hold under pressure.
          High-load APIs, distributed systems, and the infrastructure
          that makes products not break at 3am.
        </p>

        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/projects"
            className="px-6 py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-colors"
          >
            View projects
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-colors"
          >
            Read writing →
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full border border-[#1a1a1a] text-[11px] font-semibold text-[#8c8c94] hover:text-white hover:border-[#8c8c94] transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: two-column layout (image 4 style) ── */}
      <div className="hidden md:grid grid-cols-2">
        {/* Left Column */}
        <div className="p-12 lg:p-16 flex flex-col justify-center border-r border-[#1a1a1a]">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] uppercase mb-12 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 block" />
            Software Engineer · Tashkent
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[0.9] mb-1"
          >
            Thompson
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl lg:text-8xl font-bold tracking-tighter text-white/15 italic leading-[0.9] mb-10"
          >
            Shell.
          </motion.h1>

          <p className="text-sm font-medium leading-relaxed text-[#8c8c94] max-w-sm mb-12">
            Backend systems that hold under pressure — distributed architectures,
            high-load APIs, and the infrastructure that makes products not break at 3am.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/projects"
              className="px-6 py-3 rounded-xl border border-amber-500 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              View projects
            </Link>
            <Link
              href="/blog"
              className="text-xs font-bold text-white hover:text-white/80 transition-colors flex items-center gap-2"
            >
              Read my writing <span className="text-[14px]">→</span>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-12 lg:p-16 flex flex-col items-center justify-center">
          {/* Circular photo */}
          <div className="w-full max-w-[340px] aspect-square bg-black border border-[#1a1a1a] rounded-full relative flex items-center justify-center mb-10 overflow-hidden group">
            {about?.photo_url ? (
              <Image
                src={about.photo_url}
                alt="ThompsonShell"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-[#1a1a1a] z-10 transition-transform group-hover:scale-110 duration-500" />
                <p className="absolute text-[10px] font-black text-[#8c8c94] uppercase tracking-[0.3em] leading-none">
                  ThompsonShell
                </p>
              </>
            )}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-3 max-w-[340px]">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-[#1a1a1a] text-[11px] font-semibold text-[#8c8c94] hover:text-white hover:border-[#8c8c94] transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
