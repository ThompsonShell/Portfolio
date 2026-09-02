"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import WorkCard from "@/components/works/WorkCard";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import { ApiError, getWork, getWorks } from "@/lib/api";
import type { Work, WorkDetail } from "@/lib/types";

const FEATURE_TONES = [
  "bg-accent-soft text-accent",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-cyan-50 text-cyan-600",
];

export default function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useLanguage();

  const [work, setWork] = useState<WorkDetail | null>(null);
  const [others, setOthers] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    getWork(slug, locale)
      .then((data) => active && setWork(data))
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setMissing(true);
        setWork(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  useEffect(() => {
    let active = true;
    getWorks(locale)
      .then((data) => active && setOthers(data.filter((w) => w.slug !== slug).slice(0, 3)))
      .catch(() => active && setOthers([]));
    return () => {
      active = false;
    };
  }, [slug, locale]);

  if (missing) notFound();

  if (loading) {
    return (
      <Container className="py-16 space-y-6">
        <Skeleton className="h-[300px] rounded-3xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </Container>
    );
  }

  if (!work) {
    return (
      <Container className="py-24">
        <p className="text-[15px] text-ink-muted">{t.common.error}</p>
      </Container>
    );
  }

  const meta = [
    { label: t.works.role, value: work.role },
    { label: t.works.duration, value: work.duration },
    { label: t.works.team, value: work.team_size },
  ].filter((m) => m.value);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-night via-[#3B1E86] to-accent">
        <Container className="pt-14 pb-16">
          <nav className="flex items-center gap-2 text-[13px] font-medium text-white/50 mb-6">
            <Link href="/works" className="hover:text-white transition-colors">
              {t.nav.works}
            </Link>
            <span>›</span>
            <span className="text-white/80">{work.title}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-[12px] font-bold">
              {work.work_type_display}
            </span>
            {work.tech_tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/85 text-[12px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-[40px] md:text-[54px] font-extrabold text-white tracking-tight leading-[1.03] max-w-3xl">
            {work.title}
          </h1>
          {work.subtitle && (
            <p className="mt-4 text-[17px] leading-relaxed text-white/70 max-w-2xl">
              {work.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {work.live_url && (
              <a
                href={work.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold shadow-lg shadow-black/20 hover:bg-[#6D28D9] transition-colors"
              >
                {t.works.liveDemo} →
              </a>
            )}
            {work.github_url && (
              <a
                href={work.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl border border-white/25 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors"
              >
                {t.works.github}
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* Body */}
      <Container className="py-14 grid lg:grid-cols-[1fr_340px] gap-10 items-start">
        <div className="space-y-12 min-w-0">
          {work.overview && (
            <section>
              <h2 className="text-[26px] font-extrabold text-ink tracking-tight mb-4">
                {t.works.about}
              </h2>
              <p className="text-[16px] leading-[1.8] text-ink-muted whitespace-pre-line">
                {work.overview}
              </p>
            </section>
          )}

          {work.features.length > 0 && (
            <section>
              <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-5">
                {t.works.features}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {work.features.map((feature, i) => (
                  <div
                    key={feature.id}
                    className="bg-surface border border-line rounded-2xl shadow-card p-6"
                  >
                    <span
                      className={`w-10 h-10 rounded-xl grid place-items-center mb-4 ${
                        FEATURE_TONES[i % FEATURE_TONES.length]
                      }`}
                    >
                      <Icon name={feature.icon || "check"} size={18} />
                    </span>
                    <h3 className="text-[15px] font-extrabold text-ink">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                        {feature.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {work.architecture && (
            <section>
              <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-5">
                {t.works.architecture}
              </h2>
              <div className="bg-surface border border-line rounded-2xl shadow-card p-6 overflow-x-auto">
                <pre className="font-mono text-[12.5px] leading-[1.8] text-ink-muted whitespace-pre">
                  {work.architecture}
                </pre>
              </div>
            </section>
          )}

          {work.challenges.length > 0 && (
            <section>
              <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-5">
                {t.works.challenges}
              </h2>
              <div className="space-y-5">
                {work.challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-surface border border-line rounded-2xl shadow-card p-6"
                  >
                    <h3 className="text-[15px] font-extrabold text-signal-red">
                      {t.works.problem}: {challenge.problem_title}
                    </h3>
                    {challenge.problem_description && (
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-subtle">
                        {challenge.problem_description}
                      </p>
                    )}
                    {challenge.solution && (
                      <>
                        <h4 className="mt-5 text-[13px] font-extrabold text-emerald-600">
                          {t.works.solution}
                        </h4>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
                          {challenge.solution}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="bg-surface border border-line rounded-2xl shadow-card p-7 lg:sticky lg:top-[78px]">
          <h2 className="text-[17px] font-extrabold text-ink tracking-tight">
            {t.works.info}
          </h2>

          <dl className="mt-6 space-y-5">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  {item.label}
                </dt>
                <dd className="mt-1 text-[15px] font-bold text-ink">{item.value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                {t.works.status}
              </dt>
              <dd className="mt-1 text-[15px] font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {work.status_display}
              </dd>
            </div>
          </dl>

          {work.stats.length > 0 && (
            <>
              <hr className="my-6 border-line" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle mb-4">
                {t.works.numbers}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {work.stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-canvas rounded-xl p-4 text-center"
                  >
                    <div className="text-[21px] font-extrabold text-ink leading-none tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-medium text-ink-subtle mt-1.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {work.tech_tags.length > 0 && (
            <>
              <hr className="my-6 border-line" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle mb-4">
                {t.works.technologies}
              </h3>
              <div className="flex flex-wrap gap-2">
                {work.tech_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-lg bg-canvas text-[12px] font-semibold text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </aside>
      </Container>

      {others.length > 0 && (
        <Container className="pb-20">
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight mb-5">
            {t.works.otherWorks}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {others.map((other) => (
              <WorkCard key={other.id} work={other} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
