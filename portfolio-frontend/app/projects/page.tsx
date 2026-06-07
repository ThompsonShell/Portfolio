"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/types";

const filterTags = ["All", "Django", "Go", "PostgreSQL", "Docker", "React", "TypeScript"];

const categoryColors: Record<string, string> = {
  backend: "text-[#27C93F] border-[#27C93F]/20 bg-[#27C93F]/5",
  frontend: "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5",
  fullstack: "text-[#A855F7] border-[#A855F7]/20 bg-[#A855F7]/5",
  infrastructure: "text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5",
  devops: "text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/5",
  featured: "text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5",
};

function CategoryBadge({ label }: { label: string }) {
  const color = categoryColors[label.toLowerCase()] || "text-white/60 border-white/20 bg-white/5";
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${color}`}>
      {label}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    setLoading(true);
    getProjects(activeTag)
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [activeTag]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white">
            Projects
          </h1>
          <p className="text-6xl md:text-8xl font-bold tracking-tighter italic text-white/20">
            & work.
          </p>
          <p className="text-base text-white/40 mt-8 max-w-2xl leading-relaxed">
            Things I&apos;ve built — high-load APIs, distributed systems, and architectures that didn&apos;t crash (yet).
          </p>
        </motion.div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-16 border-b border-white/5 pb-8">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${activeTag === tag
                  ? "bg-transparent border-white/40 text-white"
                  : "bg-transparent border-white/10 text-white/30 hover:border-white/20 hover:text-white/80"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Projects */}
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-2xl bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="h-80 w-full rounded-2xl bg-white/5" />
              <Skeleton className="h-80 w-full rounded-2xl bg-white/5" />
            </div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-white/30 text-center py-20">No projects found for this filter.</p>
        ) : (
          <div className="space-y-8">
            {/* Featured / First project - full width */}
            {projects[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden bg-black border-t border-white/5 pt-12"
              >
                {/* Cover Image is on top in screenshot */}
                <div className="relative h-72 md:h-96 w-full bg-black overflow-hidden rounded-2xl mb-8 border border-white/5">
                  {projects[0].cover_image_url ? (
                    <Image
                      src={projects[0].cover_image_url}
                      alt={projects[0].title}
                      fill
                      className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 text-sm uppercase tracking-widest">
                      PROJECT SCREENSHOT
                    </div>
                  )}
                </div>

                {/* Content + Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  <div className="md:col-span-8 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      <CategoryBadge label={projects[0].category} />
                      {projects[0].is_featured && <CategoryBadge label="Featured" />}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white/90">{projects[0].title}</h2>
                    <p className="text-base text-white/80 leading-relaxed max-w-xl">{projects[0].description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {projects[0].tech_tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded bg-transparent border border-white/20 text-xs font-medium text-white/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-6">
                      {projects[0].github_url && (
                        <a href={projects[0].github_url} target="_blank" rel="noopener noreferrer"
                          className="px-6 py-2.5 rounded-xl bg-transparent border border-white/20 text-[13px] font-medium text-white/80 hover:bg-white/5 transition-colors">
                          GitHub
                        </a>
                      )}
                      {projects[0].live_url && (
                        <a href={projects[0].live_url} target="_blank" rel="noopener noreferrer"
                          className="px-6 py-2.5 rounded-xl bg-transparent border border-white/20 text-[13px] font-medium text-white/80 hover:bg-white/5 transition-colors">
                          Live demo →
                        </a>
                      )}
                      {projects[0].sponsor_url && (
                        <a href={projects[0].sponsor_url} target="_blank" rel="noopener noreferrer"
                          className="px-6 py-2.5 rounded-xl bg-transparent border border-pink-500/40 text-[13px] font-medium text-pink-400 hover:bg-pink-500/10 transition-colors flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                          Sponsor
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats (right side) */}
                  <div className="md:col-span-4 flex flex-col justify-start space-y-8 border-l border-white/10 pl-8">
                    {projects[0].stat1_value && (
                      <div>
                        <div className="text-4xl md:text-5xl font-bold text-white">{projects[0].stat1_value}</div>
                        <div className="text-xs text-white/60 mt-2 uppercase tracking-widest">{projects[0].stat1_label}</div>
                      </div>
                    )}
                    {projects[0].stat2_value && (
                      <div>
                        <div className="text-4xl md:text-5xl font-bold text-white">{projects[0].stat2_value}</div>
                        <div className="text-xs text-white/60 mt-2 uppercase tracking-widest">{projects[0].stat2_label}</div>
                      </div>
                    )}
                    {projects[0].stat3_value && (
                      <div>
                        <div className="text-4xl md:text-5xl font-bold text-white">{projects[0].stat3_value}</div>
                        <div className="text-xs text-white/60 mt-2 uppercase tracking-widest">{projects[0].stat3_label}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

            {/* Remaining projects - 2 per row */}
            {projects.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {projects.slice(1).map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx + 1) * 0.1 }}
                    className="flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative h-64 w-full bg-black overflow-hidden rounded-2xl mb-6 border border-white/5">
                      {project.cover_image_url ? (
                        <Image
                          src={project.cover_image_url}
                          alt={project.title}
                          fill
                          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-xs uppercase tracking-widest">
                          PROJECT SCREENSHOT
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <CategoryBadge label={project.category} />
                        {project.is_featured && <CategoryBadge label="Featured" />}
                      </div>
                      <h3 className="text-xl font-bold text-white/90">{project.title}</h3>
                      <p className="text-sm text-white/80 leading-relaxed line-clamp-3">{project.description}</p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tech_tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded bg-transparent border border-white/20 text-xs font-medium text-white/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 mt-auto">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                          className="px-5 py-2 rounded-lg bg-transparent border border-white/20 text-xs font-medium text-white/80 hover:bg-white/5 transition-colors">
                          GitHub
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                          className="px-5 py-2 rounded-lg bg-transparent border border-white/20 text-xs font-medium text-white/80 hover:bg-white/5 transition-colors">
                          Live demo →
                        </a>
                      )}
                      {project.sponsor_url && (
                        <a href={project.sponsor_url} target="_blank" rel="noopener noreferrer"
                          className="px-5 py-2 rounded-lg bg-transparent border border-pink-500/40 text-xs font-medium text-pink-400 hover:bg-pink-500/10 transition-colors flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                          Sponsor
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
