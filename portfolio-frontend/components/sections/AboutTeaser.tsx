"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { getAbout } from "@/lib/api";
import type { About } from "@/lib/types";

export default function AboutTeaser() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAbout()
      .then(setAbout)
      .catch(() => setAbout(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Skeleton className="aspect-square w-full rounded-[3rem] bg-white/5" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-24 rounded-full bg-white/5" />
            <Skeleton className="h-12 w-3/4 rounded-2xl bg-white/5" />
            <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
            <Skeleton className="h-12 w-48 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!about) return null;

  return (
    <AnimatedSection className="py-24 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Visual Side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -inset-4 bg-accent-primary/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-white/5 rounded-[4rem] pointer-events-none" />

          <div className="relative aspect-square overflow-hidden rounded-[3.5rem] bg-surface border border-white/10 shadow-3xl">
            {about.photo_url ? (
              <Image
                src={about.photo_url}
                alt="ThompsonShell"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <span className="text-white/10 font-bold text-6xl italic">THOMPSON</span>
              </div>
            )}

            {/* Experience Badge on Image */}
            <div className="absolute bottom-10 -right-4 bg-accent-primary p-6 rounded-[2rem] shadow-2xl border border-white/20 hidden lg:block">
              <div className="text-black text-3xl font-bold leading-none tracking-tighter">5+</div>
              <div className="text-black/60 text-[10px] uppercase font-bold tracking-widest mt-1">Years of Exp</div>
            </div>
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-[10px] font-bold uppercase tracking-[0.2em]">
              Who I Am
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tighter leading-[0.9]">
              Solving problems through <span className="text-accent-primary">clean code</span> and architecture.
            </h2>
          </div>

          <p className="text-text-secondary text-lg leading-relaxed line-clamp-4">
            {about.bio_text}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <Button href="/about" variant="primary" className="rounded-[1.25rem] px-10 py-5 w-full sm:w-auto shadow-[0_15px_30px_rgba(245,158,11,0.2)]">
              Read My Journey
            </Button>
            <div className="flex gap-4">
              {about.github_url && (
                <a href={about.github_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              )}
              {about.linkedin_url && (
                <a href={about.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
