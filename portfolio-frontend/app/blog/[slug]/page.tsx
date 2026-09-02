"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import Skeleton from "@/components/ui/Skeleton";
import { getPost, getPosts, registerPostView } from "@/lib/api";
import { compactNumber } from "@/lib/format";
import type { PostDetail, PostSummary } from "@/lib/types";

const ACCENTS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B"];

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useLanguage();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [related, setRelated] = useState<PostSummary[]>([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(false);
    getPost(slug, locale)
      .then((data) => {
        if (!active) return;
        setPost(data);
        setViews(data.views_count);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  // Count the read once per visitor; the API ignores repeats. Deliberately not
  // keyed on locale — switching language must not inflate the counter.
  useEffect(() => {
    if (!slug) return;
    let active = true;
    registerPostView(slug)
      .then((res) => active && setViews(res.views_count))
      .catch(() => {
        // A failed count must never break the article.
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let active = true;
    getPosts(locale)
      .then((data) => active && setRelated(data.filter((p) => p.slug !== slug).slice(0, 2)))
      .catch(() => active && setRelated([]));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing useful to show the reader.
    }
  };

  const formatDate = (value: string) =>
    value
      ? new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(value))
      : "";

  if (loading) {
    return (
      <Container className="py-16 max-w-3xl space-y-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">
          {t.notFound.title}
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted">{t.common.error}</p>
        <Link
          href="/blog"
          className="mt-7 inline-block px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
        >
          ← {t.nav.blog}
        </Link>
      </Container>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-7 pb-20">
      <nav className="flex items-center gap-2 text-[13px] font-medium text-ink-subtle pt-10 mb-6">
        <Link href="/blog" className="hover:text-accent transition-colors">
          {t.nav.blog}
        </Link>
        <span>›</span>
        <span className="text-ink-muted line-clamp-1">{post.title}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-ink-subtle mb-5">
        <span className="px-2.5 py-1 rounded-md bg-accent-soft text-accent font-bold">
          {t.nav.blog}
        </span>
        <span>{formatDate(post.published_at)}</span>
        <span>·</span>
        <span>
          {post.reading_time} {t.common.minRead}
        </span>
        {views > 0 && (
          <>
            <span>·</span>
            <span>
              {compactNumber(views)} {t.common.views}
            </span>
          </>
        )}
      </div>

      <h1 className="text-[38px] md:text-[46px] font-extrabold text-ink tracking-tight leading-[1.08]">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-5 text-[18px] leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>
      )}

      {/* Author row */}
      <div className="mt-9 pb-7 border-b border-line flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-accent-soft text-accent grid place-items-center text-[13px] font-extrabold">
            AR
          </span>
          <div>
            <div className="text-[14px] font-extrabold text-ink">
              Asilbek Rajabov
            </div>
            <div className="text-[12px] font-medium text-ink-subtle">
              Developer · asilbek.dev
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={copyLink}
          aria-label={t.blog.copyLink}
          className="w-9 h-9 grid place-items-center rounded-lg border border-line text-ink-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="m16 6-4-4-4 4" />
            <path d="M12 2v13" />
          </svg>
        </button>
      </div>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-9 w-full rounded-2xl border border-line"
        />
      )}

      {/* Article body */}
      <div
        className="prose-body mt-10 max-w-none
          [&_h2]:text-[26px] [&_h2]:font-extrabold [&_h2]:text-ink [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4
          [&_h3]:text-[20px] [&_h3]:font-extrabold [&_h3]:text-ink [&_h3]:mt-9 [&_h3]:mb-3
          [&_p]:text-[16.5px] [&_p]:leading-[1.85] [&_p]:text-ink-muted [&_p]:mb-5
          [&_a]:text-accent [&_a]:font-medium hover:[&_a]:underline
          [&_strong]:text-ink [&_strong]:font-bold
          [&_ul]:my-5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-5 [&_ol]:pl-5 [&_ol]:list-decimal
          [&_li]:text-[16px] [&_li]:leading-[1.8] [&_li]:text-ink-muted [&_li]:mb-2
          [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink-muted
          [&_pre]:my-6 [&_pre]:overflow-x-auto
          [&_:not(pre)>code]:bg-canvas [&_:not(pre)>code]:text-accent-ink [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-[0.9em] [&_:not(pre)>code]:font-mono
          [&_img]:rounded-2xl [&_img]:border [&_img]:border-line
          [&_table]:w-full [&_table]:text-[14px] [&_th]:text-left [&_th]:font-bold [&_th]:text-ink [&_td]:text-ink-muted [&_th]:border-b [&_td]:border-b [&_th]:border-line [&_td]:border-line [&_th]:py-2 [&_td]:py-2"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Share bar */}
      <div className="mt-12 pt-7 border-t border-line flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-medium text-ink-subtle">
          {t.blog.share}
        </span>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold text-ink-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          Telegram
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold text-ink-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          Twitter
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="px-4 py-2 rounded-lg border border-line text-[13px] font-semibold text-ink-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          {copied ? t.blog.copied : t.blog.copyLink}
        </button>
        {views > 0 && (
          <span className="ml-auto text-[13px] font-medium text-ink-subtle">
            {compactNumber(views)} {t.common.views}
          </span>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-5">
            {t.blog.related}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((item, i) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug}`}
                className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold text-white"
                    style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }}
                  >
                    {t.nav.blog}
                  </span>
                  <span className="text-[12px] font-medium text-ink-subtle">
                    {formatDate(item.published_at)}
                  </span>
                </div>
                <h3 className="text-[16px] font-extrabold text-ink tracking-tight leading-snug group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
