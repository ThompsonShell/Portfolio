"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import Skeleton from "@/components/ui/Skeleton";
import { getCourse } from "@/lib/api";
import { compactNumber, formatDuration, formatHours } from "@/lib/format";
import { useProgress } from "@/lib/useProgress";
import type { CourseDetail } from "@/lib/types";

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useLanguage();
  const { ready, percentFor, isWatched, resetCourse } = useProgress();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    getCourse(slug, locale)
      .then((data) => active && setCourse(data))
      .catch(() => active && setCourse(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  if (loading) {
    return (
      <Container className="py-16 space-y-6">
        <Skeleton className="h-[220px] rounded-3xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">
          {t.notFound.title}
        </h1>
        <Link
          href="/lectures"
          className="mt-7 inline-block px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
        >
          ← {t.nav.lectures}
        </Link>
      </Container>
    );
  }

  const accent = course.accent_color || "#7C3AED";
  const percent = ready ? percentFor(course.slug, course.lesson_count) : 0;
  const nextLesson =
    course.lectures.find((l) => ready && !isWatched(course.slug, l.id)) ??
    course.lectures[0];

  return (
    <>
      <section
        style={{ background: `linear-gradient(140deg, ${accent}, ${accent}A6)` }}
      >
        <Container className="pt-12 pb-14">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-white/55 mb-6">
            <Link href="/lectures" className="hover:text-white transition-colors">
              {t.nav.lectures}
            </Link>
            <span>›</span>
            <span className="text-white/85">{course.title}</span>
          </nav>

          <span className="inline-block px-3 py-1.5 rounded-lg bg-white/15 text-white text-[12px] font-bold capitalize">
            {course.category}
          </span>

          <h1 className="mt-5 text-[38px] md:text-[50px] font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-4 text-[17px] leading-relaxed text-white/75 max-w-2xl">
              {course.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-6 text-[14px] font-medium text-white/70">
            <span>
              {course.lesson_count} {t.lectures.lessons}
            </span>
            <span>{formatHours(course.total_seconds)}</span>
            {course.total_views > 0 && (
              <span>
                {compactNumber(course.total_views)} {t.common.views}
              </span>
            )}
          </div>

          {nextLesson && (
            <Link
              href={`/lectures/${nextLesson.id}`}
              className="mt-8 inline-block px-7 py-3.5 rounded-xl bg-white text-[14px] font-semibold hover:bg-white/90 transition-colors"
              style={{ color: accent }}
            >
              {percent > 0 ? t.lectures.continueCourse : t.lectures.startCourse} →
            </Link>
          )}
        </Container>
      </section>

      <Container className="py-12 pb-20">
        {/* Progress */}
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-[15px] font-extrabold text-ink">
              {t.lectures.progress}
            </h2>
            <span className="text-[13px] font-bold text-ink-muted">
              {ready ? `${percent}%` : "—"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-canvas overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${percent}%`, backgroundColor: accent }}
            />
          </div>
          {percent > 0 && (
            <button
              type="button"
              onClick={() => resetCourse(course.slug)}
              className="mt-4 text-[12px] font-semibold text-ink-subtle hover:text-signal-red transition-colors"
            >
              {t.lectures.resetProgress}
            </button>
          )}
        </div>

        {/* Lessons */}
        <h2 className="mt-10 mb-5 text-[22px] font-extrabold text-ink tracking-tight">
          {t.lectures.allLessons}
        </h2>
        <ol className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
          {course.lectures.map((lecture, i) => {
            const watched = ready && isWatched(course.slug, lecture.id);
            return (
              <li key={lecture.id}>
                <Link
                  href={`/lectures/${lecture.id}`}
                  className="group flex items-center gap-4 px-5 py-4 border-b border-line last:border-0 hover:bg-canvas/60 transition-colors"
                >
                  <span
                    className={`w-8 h-8 rounded-lg grid place-items-center text-[12px] font-bold shrink-0 ${
                      watched
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-canvas text-ink-subtle"
                    }`}
                  >
                    {watched ? "✓" : i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14.5px] font-extrabold text-ink group-hover:text-accent transition-colors line-clamp-1">
                      {lecture.title}
                    </span>
                    <span className="block mt-0.5 text-[12px] font-medium text-ink-subtle">
                      {lecture.duration_seconds > 0 &&
                        formatDuration(lecture.duration_seconds)}
                      {lecture.views_count > 0 &&
                        ` · ${compactNumber(lecture.views_count)} ${t.common.views}`}
                    </span>
                  </span>
                  {watched && (
                    <span className="text-[11px] font-bold text-emerald-600 shrink-0 hidden sm:block">
                      {t.common.watched}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
