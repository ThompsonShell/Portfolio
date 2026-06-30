"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getLectures } from "@/lib/api";
import type { Lecture } from "@/lib/types";
import Skeleton from "@/components/ui/Skeleton";

const categories = [
  { id: "All", name: "All", count: null },
  { id: "database", name: "Database", count: 23 },
  { id: "networking", name: "Networking", count: 2 },
  { id: "backend", name: "Backend", count: 8 },
  { id: "devops", name: "Devops", count: 4 },
];

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(() => {
      // Searching globally to be more 'flexible' as requested
      getLectures(searchQuery ? "All" : activeCategory, searchQuery)
        .then((data) => {
          if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();

            // Permissive typo tolerance: handles missing/extra characters
            const similarity = (s1: string, s2: string) => {
              let longer = s1.length < s2.length ? s2 : s1;
              let shorter = s1.length < s2.length ? s1 : s2;
              if (longer.length === 0) return 1.0;
              return (longer.length - editDistance(longer, shorter)) / longer.length;
            };

            const editDistance = (s1: string, s2: string) => {
              let costs = [];
              for (let i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= s2.length; j++) {
                  if (i === 0) costs[j] = j;
                  else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                      newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                  }
                }
                if (i > 0) costs[s2.length] = lastValue;
              }
              return costs[s2.length];
            };

            const isFuzzy = (str: string, pat: string) => {
              return similarity(str.toLowerCase(), pat.toLowerCase()) > 0.4 ||
                str.toLowerCase().includes(pat.toLowerCase());
            };

            const categoryKeywords: Record<string, string[]> = {
              "database": ["ma'lumotlar", "ombor", "sql", "db", "database"],
              "networking": ["tarmoq", "network", "networking", "ip", "tcp"],
              "backend": ["backend", "server", "api", "django", "nodejs"],
              "devops": ["devops", "docker", "cicd", "linux", "cloud"]
            };

            const filtered = data.filter(lecture => {
              const title = lecture.title.toLowerCase();
              const cat = lecture.category.toLowerCase();

              const matchesTitle = isFuzzy(title, query);
              const matchesCategory = isFuzzy(cat, query);

              const matchesKeywords = Object.entries(categoryKeywords).some(([key, keywords]) => {
                if (cat.toLowerCase().includes(key)) {
                  return keywords.some(k => isFuzzy(k, query));
                }
                return false;
              });

              return matchesTitle || matchesCategory || matchesKeywords;
            });
            setLectures(filtered);
          } else {
            setLectures(data);
          }
        })
        .catch(() => setLectures([]))
        .finally(() => setLoading(false));
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [activeCategory, searchQuery]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-white"
          >
            Lectures
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 text-white/60 text-xs font-mono uppercase tracking-[0.2em]"
          >
            <span>25 lectures</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>23 Database</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>2 Networking</span>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`group flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 ${activeCategory === cat.id
                ? "bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.07)]"
                : "bg-transparent border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                }`}
            >
              <span>{cat.name}</span>
              {cat.count && (
                <span className={`text-[10px] transition-colors ${activeCategory === cat.id ? "text-white/50" : "text-white/35 group-hover:text-white/60"
                  }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}

          <div className="ml-4 p-1.5 bg-white/5 border border-white/15 rounded-xl flex items-center gap-2 hover:border-white/25 transition-colors">
            <div className="w-2 h-2 rounded-full bg-[#27C93F] animate-pulse" />
            <input
              type="text"
              placeholder="Search for lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[11px] text-white/80 placeholder:text-white/40 focus:outline-none w-48"
            />
          </div>
        </div>

        {/* Lectures Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-black p-8 space-y-6">
                <Skeleton className="aspect-video w-full rounded-2xl bg-white/5" />
                <div className="space-y-3">
                  <Skeleton className="h-3 w-16 rounded-full bg-white/5" />
                  <Skeleton className="h-5 w-full rounded-lg bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
            {lectures.map((lecture, idx) => (
              <Link
                key={lecture.id}
                href={`/lectures/${lecture.id}`}
                className="group relative bg-white/[0.02] p-8 hover:bg-white/[0.06] transition-all duration-500 flex flex-col h-full border-b border-white/5 last:border-b-0"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 border border-white/10 group-hover:border-white/20 transition-colors bg-white/5">
                  {lecture.thumbnail_url && (
                    <Image
                      src={lecture.thumbnail_url}
                      alt={lecture.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                  {/* Play Icon - only on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Duration */}
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-[10px] font-bold text-white px-2 py-1 rounded border border-white/5">
                    {formatDuration(lecture.duration_seconds)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-[#27C93F] inline-block mb-4">
                      {lecture.category}
                    </div>
                    <h3 className="text-sm font-medium text-white/80 group-hover:text-white leading-relaxed transition-colors">
                      <span className="text-white/40 font-mono mr-2">{idx + 1}.</span>
                      {lecture.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
