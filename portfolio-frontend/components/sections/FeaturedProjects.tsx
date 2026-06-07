"use client";

import { useEffect, useState } from "react";
import { getFeaturedProjects } from "@/lib/api";
import type { Project } from "@/lib/types";

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProjects()
      .then((data) => setProjects(data.slice(0, 2)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-b border-[#1a1a1a] p-8 md:p-12 lg:p-16 relative">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] uppercase">
          Selected Projects
        </h2>
        <a
          href="/projects"
          className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] hover:text-[#e5e5e5] uppercase transition-colors"
        >
          All projects →
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-black animate-pulse rounded-2xl border border-[#1a1a1a]"></div>
          <div className="h-64 bg-black animate-pulse rounded-2xl border border-[#1a1a1a]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group border border-[#1a1a1a] rounded-2xl overflow-hidden bg-black hover:border-[#333] transition-colors"
            >
              {/* Image Placeholder area */}
              <div className="h-48 w-full bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="text-[9px] font-black tracking-[0.3em] text-[#1a1a1a] uppercase">
                    Project Image
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#e5e5e5] mb-2">
                  {project.title}
                </h3>
                <p className="text-sm font-medium text-[#8c8c94] mb-6 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 border border-[#1a1a1a] text-[#8c8c94] text-[10px] font-bold uppercase tracking-wider rounded border-opacity-70 transition-colors group-hover:border-[#333]/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Center scroll down button overlay */}
      <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2">
        <div className="w-12 h-12 bg-black border border-[#1a1a1a] rounded-full flex items-center justify-center text-[#8c8c94] hover:text-[#e5e5e5] hover:border-[#333] transition-all cursor-pointer relative z-10 hover:-translate-y-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>
      </div>
    </section>
  );
}
