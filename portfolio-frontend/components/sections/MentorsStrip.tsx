"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Skeleton from "@/components/ui/Skeleton";
import { getMentors } from "@/lib/api";
import type { Mentor } from "@/lib/types";

export default function MentorsStrip() {
  const { t, locale } = useLanguage();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMentors(locale)
      .then((data) => active && setMentors(data.slice(0, 3)))
      .catch(() => active && setMentors([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  if (!loading && mentors.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight">
          {t.home.mentors}
        </h2>
        <Link
          href="/mentors"
          className="text-[13px] font-bold text-accent hover:text-accent-ink transition-colors shrink-0"
        >
          {t.common.viewAll} →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
          : mentors.map((mentor) => (
              <Link
                key={mentor.id}
                href="/mentors"
                className="bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5 flex items-center gap-4"
              >
                <span
                  className="w-14 h-14 rounded-2xl grid place-items-center text-[16px] font-extrabold shrink-0"
                  style={{
                    backgroundColor: `${mentor.accent_color}1F`,
                    color: mentor.accent_color,
                  }}
                >
                  {mentor.initials}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold text-ink truncate">
                    {mentor.name}
                  </div>
                  <div className="text-[13px] font-medium text-ink-subtle truncate">
                    {mentor.role}
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
