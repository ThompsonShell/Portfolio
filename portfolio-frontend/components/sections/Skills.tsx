"use client";

import { useEffect, useState } from "react";
import { getAbout } from "@/lib/api";
import type { About } from "@/lib/types";

const fallbackSkills = [
  "Python", "Django", "Go", "PostgreSQL", "Redis", "Celery", "Docker", "Nginx", "Linux", "Next.js"
];

export default function Skills() {
  const [skills, setSkills] = useState<string[]>(fallbackSkills);

  useEffect(() => {
    getAbout()
      .then((about: About) => {
        if (about.skills && about.skills.length > 0) {
          setSkills(about.skills.map((s) => s.name));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="p-8 md:p-12 lg:p-16 border-b border-[#1a1a1a]">
      <h2 className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] uppercase mb-12">
        Stack
      </h2>
      <div className="flex flex-wrap gap-4">
        {skills.map((skill) => (
          <div
            key={skill}
            className="px-6 py-3 border border-[#1a1a1a] rounded-xl text-[13px] font-bold text-[#8c8c94] hover:text-white hover:border-[#333] transition-colors cursor-pointer bg-black"
          >
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}
