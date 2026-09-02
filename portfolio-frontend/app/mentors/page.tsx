"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getMentors } from "@/lib/api";
import type { Mentor } from "@/lib/types";

function MentorCard({
  mentor,
  profileLabel,
}: {
  mentor: Mentor;
  profileLabel: string;
}) {
  const accent = mentor.accent_color || "#7C3AED";

  return (
    <article className="bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col">
      {/* Tinted banner with the avatar */}
      <div
        className="h-[190px] grid place-items-center"
        style={{ backgroundColor: `${accent}24` }}
      >
        {mentor.photo_url ? (
          <img
            src={mentor.photo_url}
            alt={mentor.name}
            className="w-[130px] h-[130px] rounded-full object-cover ring-4 ring-white"
          />
        ) : (
          <span
            className="w-[130px] h-[130px] rounded-full grid place-items-center text-[34px] font-extrabold text-white ring-4 ring-white"
            style={{ backgroundColor: accent }}
          >
            {mentor.initials}
          </span>
        )}
      </div>

      <div className="p-6 text-center flex-1 flex flex-col">
        <h3 className="text-[17px] font-extrabold text-ink tracking-tight">
          {mentor.name}
        </h3>
        <p className="mt-1 text-[13px] font-bold" style={{ color: accent }}>
          {mentor.role}
        </p>
        {mentor.company && (
          <p className="mt-0.5 text-[12px] font-medium text-ink-subtle">
            {mentor.company}
          </p>
        )}

        {mentor.description && (
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-muted flex-1">
            {mentor.description}
          </p>
        )}

        {mentor.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {mentor.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-canvas text-[11px] font-bold text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {mentor.profile_url && (
        <a
          href={mentor.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 pb-6 text-center text-[13px] font-bold text-accent hover:text-accent-ink transition-colors"
        >
          {profileLabel}
        </a>
      )}
    </article>
  );
}

export default function MentorsPage() {
  const { t, locale } = useLanguage();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMentors(locale)
      .then((data) => active && setMentors(data))
      .catch(() => active && setMentors([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <Container className="pb-20">
      <PageHeader
        badge={t.mentors.badge}
        badgeTone="amber"
        title={t.mentors.title}
        subtitle={t.mentors.subtitle}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-2xl" />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <p className="text-[15px] text-ink-muted">{t.common.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              profileLabel={t.mentors.viewProfile}
            />
          ))}
        </div>
      )}

      <blockquote className="mt-14 bg-surface border border-line rounded-2xl shadow-card px-8 py-14 text-center">
        <span className="block text-ink-subtle/40 text-3xl leading-none mb-6">❝</span>
        <p className="text-[21px] md:text-[24px] font-medium text-ink-muted leading-relaxed max-w-2xl mx-auto">
          {t.mentors.quote}
        </p>
        <footer className="mt-7 text-[13px] font-medium text-ink-subtle">
          — Asilbek Rajabov
        </footer>
      </blockquote>
    </Container>
  );
}
