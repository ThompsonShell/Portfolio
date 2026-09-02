"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import FilterTabs from "@/components/ui/FilterTabs";
import Skeleton from "@/components/ui/Skeleton";
import { getCourses, getLectures, getSiteStats } from "@/lib/api";
import { compactNumber, formatDuration, formatHours } from "@/lib/format";
import { useProgress } from "@/lib/useProgress";
import type { Course, Lecture, SiteStats } from "@/lib/types";

const CATEGORIES = [
  { value: "All", labelUz: "Hammasi", labelEn: "All" },
  { value: "backend", labelUz: "Backend", labelEn: "Backend" },
  { value: "frontend", labelUz: "Frontend", labelEn: "Frontend" },
  { value: "database", labelUz: "Database", labelEn: "Database" },
  { value: "devops", labelUz: "DevOps", labelEn: "DevOps" },
  { value: "networking", labelUz: "Networking", labelEn: "Networking" },
  { value: "algorithms", labelUz: "Algorithms", labelEn: "Algorithms" },
];

const GRADIENTS = [
  "linear-gradient(140deg,#0E7490,#22D3EE)",
  "linear-gradient(140deg,#15803D,#4ADE80)",
  "linear-gradient(140deg,#C2410C,#FB923C)",
  "linear-gradient(140deg,#7C3AED,#C084FC)",
  "linear-gradient(140deg,#BE123C,#FB7185)",
  "linear-gradient(140deg,#1D4ED8,#60A5FA)",
];

export default function LecturesPage() {
  const { t, locale } = useLanguage();
  const { ready, percentFor } = useProgress();

  const [courses, setCourses] = useState<Course[]>([]);
  const [recent, setRecent] = useState<Lecture[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getCourses(locale, { category }).catch(() => []),
      getLectures(locale, { category }).catch(() => []),
    ])
      .then(([courseData, lectureData]) => {
        if (!active) return;
        setCourses(courseData);
        setRecent(lectureData.slice(0, 4));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale, category]);

  useEffect(() => {
    let active = true;
    getSiteStats()
      .then((data) => active && setStats(data))
      .catch(() => active && setStats(null));
    return () => {
      active = false;
    };
  }, []);

  const featured = courses.find((c) => c.is_featured) ?? courses[0];
  const rest = featured ? courses.filter((c) => c.id !== featured.id) : courses;

  return (
    <Container className="pb-20">
      <header className="pt-16 pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-accent-soft text-accent text-[12px] font-bold">
            {t.lectures.updated}
          </span>
          {(stats?.new_lectures ?? 0) > 0 && (
            <span className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats?.new_lectures} {t.lectures.newLessons}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-[44px] md:text-[58px] font-extrabold tracking-tight text-ink leading-[1.02]">
          {t.lectures.title}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-muted max-w-xl">
          {t.lectures.subtitle}
        </p>

        <div className="mt-9 flex items-stretch gap-8">
          {[
            { value: `${stats?.lectures ?? 0}`, label: t.lectures.statLessons },
            { value: `${stats?.courses ?? 0}`, label: t.lectures.statCourses },
            { value: `${stats?.lecture_hours ?? 0}h`, label: t.lectures.statContent },
          ].map((stat, i) => (
            <div key={stat.label} className={i > 0 ? "pl-8 border-l border-line" : ""}>
              <div className="text-[36px] font-extrabold text-ink leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="mt-2 text-[13px] font-medium text-ink-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      <FilterTabs
        tabs={CATEGORIES.map((c) => ({
          value: c.value,
          label: locale === "uz" ? c.labelUz : c.labelEn,
        }))}
        active={category}
        onChange={setCategory}
        variant="purple"
      />

      {loading ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-[300px] rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[290px] rounded-2xl" />
            ))}
          </div>
        </div>
      ) : courses.length === 0 ? (
        <p className="mt-10 text-[15px] text-ink-muted">{t.common.empty}</p>
      ) : (
        <>
          {/* Featured course */}
          {featured && (
            <Link
              href={`/lectures/course/${featured.slug}`}
              className="group mt-8 block rounded-2xl overflow-hidden relative bg-gradient-to-br from-night via-[#3B1E86] to-accent p-10 md:p-14"
            >
              <span className="absolute top-5 left-5 px-3 py-1.5 rounded-lg bg-accent text-white text-[11px] font-bold">
                {t.lectures.new.toUpperCase()}
              </span>

              <div className="max-w-[540px] mx-auto rounded-xl bg-[#0F0D2E]/85 border border-white/10 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                  <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                  <span className="ml-2 font-mono text-[11px] text-white/40">
                    {featured.category}.js
                  </span>
                </div>
                <div className="relative p-6 font-mono text-[12px] leading-[1.9] text-white/45 min-h-[150px]">
                  <div className="text-emerald-300">async function lesson() {"{"}</div>
                  <div className="pl-4">const topic = await learn();</div>
                  <div className="pl-4">return topic;</div>
                  <div>{"}"}</div>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="w-16 h-16 rounded-full bg-white grid place-items-center text-accent text-xl shadow-lift transition-transform group-hover:scale-110">
                      ▶
                    </span>
                  </span>
                </div>
              </div>

              <h2 className="mt-8 text-[24px] md:text-[28px] font-extrabold text-white tracking-tight">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="mt-2.5 text-[15px] text-white/60 line-clamp-2 max-w-2xl">
                  {featured.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-5 text-[13px] font-medium text-white/50">
                <span>
                  {featured.lesson_count} {t.lectures.lessons}
                </span>
                <span>{formatHours(featured.total_seconds)}</span>
                {featured.total_views > 0 && (
                  <span>
                    {compactNumber(featured.total_views)} {t.common.views}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Course grid */}
          {rest.length > 0 && (
            <section className="mt-14">
              <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
                {t.lectures.allCourses}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((course, i) => {
                  const percent = ready ? percentFor(course.slug, course.lesson_count) : 0;
                  const done = percent >= 100;

                  return (
                    <Link
                      key={course.id}
                      href={`/lectures/course/${course.slug}`}
                      className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                    >
                      <div
                        className="h-[165px] relative grid place-items-center"
                        style={
                          course.cover_image_url
                            ? undefined
                            : {
                                background:
                                  course.accent_color && course.accent_color !== "#7C3AED"
                                    ? `linear-gradient(140deg, ${course.accent_color}, ${course.accent_color}B3)`
                                    : GRADIENTS[i % GRADIENTS.length],
                              }
                        }
                      >
                        {course.cover_image_url && (
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <span className="relative w-12 h-12 rounded-full bg-white/25 backdrop-blur grid place-items-center text-white text-base transition-transform group-hover:scale-110">
                          ▶
                        </span>
                        {course.total_seconds > 0 && (
                          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/55 text-white font-mono text-[11px]">
                            {formatHours(course.total_seconds)}
                          </span>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="px-2.5 py-1 rounded-md bg-accent-soft text-accent text-[11px] font-bold capitalize">
                            {course.category}
                          </span>
                          <span className="text-[12px] font-medium text-ink-subtle">
                            {course.lesson_count} {t.lectures.lessons}
                          </span>
                        </div>

                        <h3 className="text-[16px] font-extrabold text-ink tracking-tight group-hover:text-accent transition-colors">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted line-clamp-2 flex-1">
                            {course.description}
                          </p>
                        )}

                        {/* Progress — kept per browser, no account needed */}
                        <div className="mt-5 flex items-center gap-3">
                          <span className="flex-1 h-1.5 rounded-full bg-canvas overflow-hidden">
                            <span
                              className="block h-full rounded-full transition-[width] duration-500"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: course.accent_color || "#7C3AED",
                              }}
                            />
                          </span>
                          <span className="text-[11px] font-bold text-ink-subtle shrink-0">
                            {done ? "✓" : percent > 0 ? `${percent}%` : t.lectures.new}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* Recent lessons */}
      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
            {t.lectures.recentLessons}
          </h2>
          <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
            {recent.map((lecture, i) => (
              <Link
                key={lecture.id}
                href={`/lectures/${lecture.id}`}
                className="group flex items-center gap-4 px-5 py-4 border-b border-line last:border-0 hover:bg-canvas/60 transition-colors"
              >
                <span
                  className="w-[86px] h-[52px] rounded-lg shrink-0 relative overflow-hidden grid place-items-center"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                >
                  {lecture.thumbnail_url && (
                    <img
                      src={lecture.thumbnail_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <span className="relative text-white text-[11px]">▶</span>
                  {lecture.duration_seconds > 0 && (
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-white font-mono text-[9px]">
                      {formatDuration(lecture.duration_seconds)}
                    </span>
                  )}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-extrabold text-ink group-hover:text-accent transition-colors line-clamp-1">
                    {lecture.title}
                  </span>
                  <span className="block mt-1 text-[12px] font-medium text-ink-subtle">
                    {lecture.course_title || lecture.category}
                    {lecture.duration_seconds > 0 &&
                      ` · ${Math.round(lecture.duration_seconds / 60)} ${t.common.minutes}`}
                    {lecture.views_count > 0 &&
                      ` · ${compactNumber(lecture.views_count)} ${t.common.views}`}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
