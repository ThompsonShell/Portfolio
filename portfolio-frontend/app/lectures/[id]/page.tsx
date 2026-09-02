"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import Skeleton from "@/components/ui/Skeleton";
import { getCourse, getLecture, getLectures, registerLectureView } from "@/lib/api";
import { compactNumber, formatDuration } from "@/lib/format";
import { useProgress } from "@/lib/useProgress";
import type { Lecture } from "@/lib/types";

const VideoPlayer = dynamic(() => import("@/components/lectures/VideoPlayer"), {
  ssr: false,
});

export default function LectureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLanguage();

  const { markWatched, isWatched, ready } = useProgress();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [siblings, setSiblings] = useState<Lecture[]>([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getLecture(id, locale)
      .then((data) => {
        if (!active) return;
        setLecture(data);
        setViews(data.views_count);
      })
      .catch(() => active && setLecture(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, locale]);

  // Count the view once per visitor; the API ignores repeats. Language is not
  // a dependency — switching it must not inflate the counter.
  useEffect(() => {
    if (!id) return;
    let active = true;
    registerLectureView(id)
      .then((res) => active && setViews(res.views_count))
      .catch(() => {
        // A failed count must never break the page.
      });
    return () => {
      active = false;
    };
  }, [id]);

  // The playlist is the lesson's course, falling back to its category.
  useEffect(() => {
    if (!lecture) return;
    let active = true;

    const load = lecture.course_slug
      ? getCourse(lecture.course_slug, locale).then((c) => c.lectures)
      : getLectures(locale, { category: lecture.category });

    load
      .then((data) => active && setSiblings(data))
      .catch(() => active && setSiblings([]));
    return () => {
      active = false;
    };
  }, [lecture, locale]);

  // Watching a lesson marks it done for this browser.
  useEffect(() => {
    if (!lecture?.course_slug) return;
    markWatched(lecture.course_slug, lecture.id);
  }, [lecture, markWatched]);

  const { index, prev, next } = useMemo(() => {
    const i = siblings.findIndex((l) => String(l.id) === String(id));
    return {
      index: i,
      prev: i > 0 ? siblings[i - 1] : null,
      next: i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null,
    };
  }, [siblings, id]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-[420px] rounded-none" />
        <Container className="py-12 space-y-5">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </Container>
      </div>
    );
  }

  if (!lecture) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">
          {t.notFound.title}
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted">{t.common.error}</p>
        <Link
          href="/lectures"
          className="mt-7 inline-block px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
        >
          ← {t.nav.lectures}
        </Link>
      </Container>
    );
  }

  const lessonNumber = lecture.position || (index >= 0 ? index + 1 : 1);
  const lessonTotal = lecture.course_lesson_count || siblings.length;
  const courseSlug = lecture.course_slug;

  return (
    <>
      {/* Video stage */}
      <section className="bg-[#0B0A1F]">
        <div className="max-w-[1200px] mx-auto px-0 md:px-7">
          <div className="md:rounded-b-2xl overflow-hidden">
            <VideoPlayer
              youtubeId={lecture.youtube_video_id}
              videoUrl={lecture.lecture_video}
              duration={formatDuration(lecture.duration_seconds)}
            />
          </div>
        </div>
      </section>

      <Container className="py-12 grid lg:grid-cols-[1fr_360px] gap-10 items-start pb-20">
        {/* Main column */}
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink-subtle mb-5">
            <Link href="/lectures" className="hover:text-accent transition-colors">
              {t.nav.lectures}
            </Link>
            <span>›</span>
            {lecture.course_slug ? (
              <Link
                href={`/lectures/course/${lecture.course_slug}`}
                className="hover:text-accent transition-colors"
              >
                {lecture.course_title}
              </Link>
            ) : (
              <span className="capitalize">{lecture.category}</span>
            )}
            <span>›</span>
            <span className="text-ink-muted">
              {t.lectures.lesson} #{lessonNumber}
            </span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-2.5 py-1 rounded-md bg-accent-soft text-accent text-[11px] font-bold capitalize">
              {lecture.category}
            </span>
            {lessonTotal > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                {t.lectures.lesson} {lessonNumber}/{lessonTotal}
              </span>
            )}
          </div>

          <h1 className="text-[32px] md:text-[40px] font-extrabold text-ink tracking-tight leading-[1.1]">
            {lecture.title}
          </h1>

          {lecture.description && (
            <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
              {lecture.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-6 text-[13px] font-medium text-ink-subtle">
            {lecture.duration_seconds > 0 && (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {Math.round(lecture.duration_seconds / 60)} {t.common.minutes}
              </span>
            )}
            {views > 0 && (
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {compactNumber(views)} {t.common.views}
              </span>
            )}
            {lecture.created_at && (
              <span>
                {new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(lecture.created_at))}
              </span>
            )}
          </div>

          {/* Prev / next */}
          {(prev || next) && (
            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {prev ? (
                <Link
                  href={`/lectures/${prev.id}`}
                  className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5"
                >
                  <div className="text-[12px] font-medium text-ink-subtle">
                    ← {t.common.previous}
                  </div>
                  <div className="mt-1.5 text-[14px] font-extrabold text-ink group-hover:text-accent transition-colors line-clamp-1">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div className="bg-surface/60 border border-line rounded-2xl p-5">
                  <div className="text-[12px] font-medium text-ink-subtle/60">
                    ← {t.common.previous}
                  </div>
                  <div className="mt-1.5 text-[14px] font-extrabold text-ink-subtle/60">
                    {t.lectures.courseIntro}
                  </div>
                </div>
              )}

              {next && (
                <Link
                  href={`/lectures/${next.id}`}
                  className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5 text-right"
                >
                  <div className="text-[12px] font-medium text-ink-subtle">
                    {t.common.next} →
                  </div>
                  <div className="mt-1.5 text-[14px] font-extrabold text-ink group-hover:text-accent transition-colors line-clamp-1">
                    {next.title}
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Playlist sidebar */}
        <aside className="bg-surface border border-line rounded-2xl shadow-card p-6 lg:sticky lg:top-[78px]">
          <div className="flex items-baseline justify-between gap-3">
            {courseSlug ? (
              <Link
                href={`/lectures/course/${courseSlug}`}
                className="text-[16px] font-extrabold text-ink tracking-tight hover:text-accent transition-colors"
              >
                {lecture.course_title}
              </Link>
            ) : (
              <h2 className="text-[16px] font-extrabold text-ink tracking-tight capitalize">
                {lecture.category}
              </h2>
            )}
            <span className="text-[12px] font-medium text-ink-subtle shrink-0">
              {lessonTotal} {t.lectures.lessons}
            </span>
          </div>

          {lessonTotal > 0 && (
            <div className="mt-4">
              <div className="h-1 rounded-full bg-canvas overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-[width]"
                  style={{ width: `${(lessonNumber / lessonTotal) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-right text-[11px] font-medium text-ink-subtle">
                {lessonNumber}/{lessonTotal}
              </div>
            </div>
          )}

          <ol className="mt-4 space-y-1.5 max-h-[460px] overflow-y-auto">
            {siblings.map((item, i) => {
              const current = String(item.id) === String(id);
              const watched =
                ready && !!courseSlug && isWatched(courseSlug, item.id);
              return (
                <li key={item.id}>
                  <Link
                    href={`/lectures/${item.id}`}
                    aria-current={current ? "true" : undefined}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      current
                        ? "bg-accent-soft border-l-[3px] border-accent"
                        : "hover:bg-canvas"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg grid place-items-center text-[11px] font-bold shrink-0 ${
                        current
                          ? "bg-accent text-white"
                          : watched
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-canvas text-ink-subtle"
                      }`}
                    >
                      {current ? "▶" : watched ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[13.5px] font-bold leading-snug line-clamp-2 ${
                          current ? "text-accent" : "text-ink"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.duration_seconds > 0 && (
                        <span className="block mt-0.5 text-[11px] font-medium text-ink-subtle">
                          {formatDuration(item.duration_seconds)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
      </Container>
    </>
  );
}
