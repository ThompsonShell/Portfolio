"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Image from "next/image";
import Skeleton from "@/components/ui/Skeleton";
import { getAbout } from "@/lib/api";
import type { About } from "@/lib/types";

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAbout()
      .then(setAbout)
      .catch(() => {
        setAbout(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <Skeleton className="h-20 w-1/2 rounded-3xl bg-white/5" />
          <Skeleton className="h-[600px] w-full rounded-[3rem] bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">About</h1>
          <p className="text-white/40 text-lg">Could not load about data. Make sure the backend is running and Bio is created in admin.</p>
        </div>
      </div>
    );
  }

  const stack = [
    {
      category: "BACKEND",
      items: [
        { name: "Python", exp: "3 yil" },
        { name: "Django / DRF", exp: "2 yil" },
        { name: "Pytest", exp: "2 yil" },
        { name: "Celery", exp: "2 yil" },
      ],
    },
    {
      category: "DATABASE & CACHE",
      items: [
        { name: "PostgreSQL", exp: "2 yil" },
        { name: "Redis", exp: "2 yil" },
        { name: "MySQL", exp: "1 yil" },
      ],
    },
    {
      category: "INFRA & TOOLS",
      items: [
        { name: "Docker", exp: "2 yil" },
        { name: "Nginx", exp: "2 yil" },
        { name: "Linux", exp: "2 yil" },
        { name: "Git", exp: "2 yil" },
      ],
    },
  ];

  const approaches = [
    {
      id: "01",
      title: "Substance over Appearance",
      desc: "Not just beautiful code — working code. Everything must be reflected in measurable results.",
    },
    {
      id: "02",
      title: "Don't Hide Complexity",
      desc: "Distributed systems are complex by nature. Trying to oversimplify them is often just hiding the problem.",
    },
    {
      id: "03",
      title: "Sharing Knowledge is a Duty",
      desc: "I don't keep what I learn to myself. I pass it on to the next generation through lectures and blogs.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-24 space-y-32">

        {/* ── HERO SECTION ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          <div className="lg:col-span-7 space-y-12">
            <div className="relative">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-9xl font-bold tracking-tighter leading-none relative z-10"
              >
                Thompson
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-7xl md:text-9xl font-bold tracking-tighter leading-none text-white/15 mt-2 select-none"
              >
                Shell.
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-8 pt-12"
            >
              <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl">
                I love building backend systems — especially things that don&apos;t crumble under heavy load.
                I&apos;ve been working with Python, Django, Go, and distributed architecture for 2 years.
              </p>
              <p className="text-white/40 text-base max-w-2xl">
                When I&apos;m not writing code, I share my knowledge through video lectures and blog posts.
                Based in Tashkent, delivering to the world.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                {[
                  { label: "GitHub", icon: "devicon-github-original", url: about.github_url },
                  { label: "LinkedIn", icon: "devicon-linkedin-plain", url: about.linkedin_url },
                  { label: "Telegram", icon: "devicon-telegram-plain", url: about.telegram_url },
                  { label: "Email", icon: "ri-mail-line", url: `mailto:${about.email}` },
                  { label: "Resume ↓", icon: "ri-download-line", url: about.resume_url || "#" },
                ].map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-accent-primary/20 transition-all group"
                  >
                    <span className="text-white/40 group-hover:text-accent-primary transition-colors">
                      {btn.label}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Feature Card & Stats */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative aspect-square bg-black border border-white/5 rounded-[3rem] overflow-hidden group shadow-2xl"
            >
              {about.photo_url ? (
                <Image
                  src={about.photo_url}
                  alt="ThompsonShell"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="relative w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase absolute bottom-12">ThompsonShell</span>
                    <div className="w-[60%] h-[60%] rounded-full bg-white/5 animate-pulse" />
                  </div>
                </div>
              )}
              {/* Blur accent */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px]" />
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4">
              {[
                { label: "Experience", val: "2 years" },
                { label: "Projects", val: "7+" },
                { label: "Lectures", val: "1" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between px-8 py-6 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
                  <span className="text-accent-primary text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</span>
                  <span className="text-white text-2xl font-black tracking-tighter">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOURNEY SECTION ─────────────────────────────────────── */}
        <AnimatedSection>
          <div className="space-y-12">
            <div className="inline-block text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] mb-4">Journey</div>
            <div className="space-y-16 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {about.experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12 group"
                >
                  <div className="absolute left-0 top-3 w-[24px] h-[24px] rounded-full bg-black border-2 border-white/10 flex items-center justify-center z-10">
                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-[#27C93F] animate-pulse" : "bg-white/20"}`} />
                  </div>

                  <div className="space-y-4">
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      {new Date(exp.start_date).getFullYear()} &mdash; {exp.end_date ? new Date(exp.end_date).getFullYear() : "Present"}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-accent-primary transition-colors">{exp.title}</h3>
                      <p className="text-accent-primary/60 text-sm font-semibold mt-1">{exp.company}</p>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed max-w-3xl">
                      {exp.description || "Leading the core platform team, optimizing microservices, and implementing event-driven architecture using Django and Celery."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── STACK SECTION ───────────────────────────────────────── */}
        <AnimatedSection>
          <div className="space-y-12">
            <div className="inline-block text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] mb-4">Stack</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stack.map((cat) => (
                <div key={cat.category} className="space-y-6">
                  <h4 className="text-[10px] font-mono text-white/10 uppercase tracking-[0.3em] pl-2">{cat.category}</h4>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                        <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                        <span className="text-[10px] font-mono text-white/20 group-hover:text-accent-primary/60 transition-colors uppercase">{item.exp.replace("yil", "years")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ── APPROACH SECTION ────────────────────────────────────── */}
        <AnimatedSection>
          <div className="space-y-12">
            <div className="inline-block text-[10px] font-mono text-white/20 uppercase tracking-[0.5em] mb-4">Approach</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 rounded-[3rem] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
              {approaches.map((approach) => (
                <div key={approach.id} className="p-12 space-y-8 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                  <div className="text-6xl font-bold italic text-white/5 transition-colors">
                    {approach.id}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-accent-primary transition-colors leading-tight">
                      {approach.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {approach.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Footer info from mockup */}
        <div className="pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">ThompsonShell</div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Tashkent | 2026</div>
        </div>
      </div>
    </div>
  );
}
