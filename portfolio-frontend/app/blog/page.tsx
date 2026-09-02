"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getPosts, getSiteStats } from "@/lib/api";
import { compactNumber } from "@/lib/format";
import type { PostSummary, SiteStats } from "@/lib/types";

/** A deterministic accent per card so the top rules cycle through the palette
 *  the way the design does, without needing a colour field on Post. */
const ACCENTS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

export default function BlogPage() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    getSiteStats()
      .then((data) => active && setStats(data))
      .catch(() => active && setStats(null));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPosts(locale)
      .then((data) => active && setPosts(data))
      .catch(() => active && setPosts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  const formatDate = (value: string) =>
    value
      ? new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(value))
      : "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }, [posts, search]);

  const [featured, ...rest] = filtered;

  return (
    <Container className="pb-20">
      <PageHeader
        badge={`${stats?.posts ?? posts.length} ${t.blog.count}`}
        badgeTone="amber"
        title={t.blog.title}
        subtitle={t.blog.subtitle}
      />

      {/* Search */}
      <div className="flex justify-end">
        <label className="relative w-full sm:w-64">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            aria-label={t.common.search}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface border border-line text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
          />
        </label>
      </div>

      {loading ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-[280px] rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-[15px] text-ink-muted">{t.common.empty}</p>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-8 grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-line shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="bg-surface p-8 md:p-10 flex flex-col justify-center order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-accent-soft text-accent text-[11px] font-bold">
                    Featured
                  </span>
                  <span className="text-[12px] font-medium text-ink-subtle">
                    {formatDate(featured.published_at)}
                  </span>
                </div>

                <h2 className="text-[27px] font-extrabold text-ink tracking-tight leading-[1.15] group-hover:text-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted line-clamp-3">
                  {featured.excerpt}
                </p>

                <div className="mt-6 flex items-center gap-4 text-[12px] font-medium text-ink-subtle">
                  <span>
                    {featured.reading_time} {t.common.minRead}
                  </span>
                  {featured.views_count > 0 && (
                    <span>
                      {compactNumber(featured.views_count)} {t.common.views}
                    </span>
                  )}
                </div>
              </div>

              <div className="order-1 lg:order-2 min-h-[220px] relative overflow-hidden bg-gradient-to-br from-night to-[#312780]">
                {featured.cover_image_url ? (
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <pre className="absolute inset-0 p-8 font-mono text-[12px] leading-[2] text-[#A78BFA]/70 overflow-hidden">
{`const future = new Promise(
  resolve, reject
) => {
  const dream = await
  learn('everyday');
  if (dream.ready)
  resolve('success');
});`}
                  </pre>
                )}
              </div>
            </Link>
          )}

          {/* All posts */}
          {rest.length > 0 && (
            <section className="mt-14">
              <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
                {t.blog.allPosts}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                  >
                    <span
                      className="block h-1.5 w-full"
                      style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }}
                    />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[12px] font-medium text-ink-subtle mb-3">
                        {formatDate(post.published_at)}
                      </div>
                      <h3 className="text-[17px] font-extrabold text-ink tracking-tight leading-snug group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-5 flex items-center gap-3 text-[12px] font-medium text-ink-subtle">
                        <span>
                          {post.reading_time} {t.common.minRead}
                        </span>
                        {post.views_count > 0 && (
                          <span>{compactNumber(post.views_count)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter */}
      <section className="mt-14 rounded-3xl bg-gradient-to-r from-night-deep to-night px-8 md:px-11 py-10 flex flex-col md:flex-row md:items-center justify-between gap-7">
        <div>
          <h2 className="text-[23px] font-extrabold text-white tracking-tight">
            {t.blog.newsletterTitle}
          </h2>
          <p className="mt-2 text-[14px] text-white/55">{t.blog.newsletterSub}</p>
        </div>
        <form
          className="flex gap-3 shrink-0 w-full md:w-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder={t.blog.emailPlaceholder}
            aria-label={t.blog.emailPlaceholder}
            className="flex-1 md:w-56 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors whitespace-nowrap"
          >
            {t.blog.newsletterCta}
          </button>
        </form>
      </section>
    </Container>
  );
}
