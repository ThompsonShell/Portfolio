"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Skeleton from "@/components/ui/Skeleton";
import { getPosts } from "@/lib/api";
import type { PostSummary } from "@/lib/types";

const DOT_TONES = ["bg-signal-amber", "bg-signal-blue", "bg-accent"];

export default function RecentWriting() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPosts(locale)
      .then((data) => active && setPosts(data.slice(0, 3)))
      .catch(() => active && setPosts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight">
          {t.home.recentPosts}
        </h2>
        <Link
          href="/blog"
          className="text-[13px] font-bold text-accent hover:text-accent-ink transition-colors shrink-0"
        >
          {t.common.viewAll} →
        </Link>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="p-7 text-[14px] text-ink-muted">{t.common.empty}</p>
        ) : (
          posts.map((post, i) => {
            const date = post.published_at
              ? new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-US", {
                  day: "numeric",
                  month: "short",
                }).format(new Date(post.published_at))
              : "";

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-4 px-6 py-4 border-b border-line last:border-0 hover:bg-canvas/60 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${DOT_TONES[i % DOT_TONES.length]}`}
                />
                <span className="flex-1 text-[15px] font-bold text-ink group-hover:text-accent transition-colors line-clamp-1">
                  {post.title}
                </span>
                <span className="text-[12px] font-medium text-ink-subtle shrink-0 hidden sm:block">
                  {date}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
