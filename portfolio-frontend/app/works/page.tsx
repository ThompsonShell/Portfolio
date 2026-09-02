"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import CoffeeBanner from "@/components/sections/CoffeeBanner";
import WorkCard from "@/components/works/WorkCard";
import Container from "@/components/ui/Container";
import FilterTabs from "@/components/ui/FilterTabs";
import PageHeader from "@/components/ui/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import { getSiteStats, getWorks } from "@/lib/api";
import type { SiteStats, Work, WorkType } from "@/lib/types";

const TYPES: { value: WorkType | "all"; labelUz: string; labelEn: string }[] = [
  { value: "all", labelUz: "Hammasi", labelEn: "All" },
  { value: "web_app", labelUz: "Web App", labelEn: "Web App" },
  { value: "mobile", labelUz: "Mobile", labelEn: "Mobile" },
  { value: "api", labelUz: "API", labelEn: "API" },
  { value: "open_source", labelUz: "Open Source", labelEn: "Open Source" },
];

export default function WorksPage() {
  const { t, locale } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [filter, setFilter] = useState<WorkType | "all">("all");
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    getWorks(locale)
      .then((data) => active && setWorks(data))
      .catch(() => active && setWorks([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [locale]);

  const featured = useMemo(() => works.find((w) => w.is_featured), [works]);

  const visible = useMemo(() => {
    const rest = featured ? works.filter((w) => w.id !== featured.id) : works;
    return filter === "all" ? rest : rest.filter((w) => w.work_type === filter);
  }, [works, featured, filter]);

  const allTech = useMemo(
    () => Array.from(new Set(works.flatMap((w) => w.tech_tags))),
    [works]
  );

  return (
    <Container className="pb-20">
      <PageHeader
        badge={`${stats?.works ?? works.length} ${t.works.count}`}
        badgeTone="pink"
        title={t.works.title}
        subtitle={t.works.subtitle}
      />

      <FilterTabs
        tabs={TYPES.map((type) => ({
          value: type.value,
          label: locale === "uz" ? type.labelUz : type.labelEn,
        }))}
        active={filter}
        onChange={(value) => setFilter(value as WorkType | "all")}
      />

      {/* Featured spotlight */}
      {loading ? (
        <Skeleton className="mt-8 h-[360px] rounded-3xl" />
      ) : (
        featured && (
          <div className="mt-8 grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-line shadow-card">
            <div
              className="relative min-h-[300px] p-9 grid place-items-center"
              style={{
                background: featured.cover_image_url
                  ? undefined
                  : "linear-gradient(150deg, #16132e, #241C5C)",
              }}
            >
              <span className="absolute top-5 left-5 px-3 py-1.5 rounded-lg bg-accent text-white text-[11px] font-bold z-10">
                {t.works.featured}
              </span>
              {featured.cover_image_url ? (
                <img
                  src={featured.cover_image_url}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full max-w-[330px] rounded-xl bg-white/[0.06] border border-white/10 overflow-hidden">
                  <div className="flex gap-1.5 px-3 py-2.5 border-b border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                    <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                    <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="p-3 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-7 rounded bg-accent/40" />
                      <div className="h-7 rounded bg-white/10" />
                      <div className="h-7 rounded bg-white/10" />
                    </div>
                    <div className="h-24 rounded bg-white/[0.07] grid place-items-center text-white/25 text-2xl">
                      ▷
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 rounded bg-white/[0.07]" />
                      <div className="h-8 rounded bg-white/[0.07]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface p-9 md:p-11 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent-soft text-accent">
                  {featured.work_type_display}
                </span>
                {featured.tech_tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-canvas text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-[27px] font-extrabold text-ink tracking-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                {featured.description}
              </p>

              {featured.stats.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-8">
                  {featured.stats.slice(0, 3).map((stat) => (
                    <div key={stat.id}>
                      <div className="text-[24px] font-extrabold text-ink leading-none tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-[12px] font-medium text-ink-subtle mt-1.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/works/${featured.slug}`}
                  className="px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
                >
                  {t.works.viewDemo} →
                </Link>
                {featured.github_url && (
                  <a
                    href={featured.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl border border-line text-ink text-[14px] font-semibold hover:bg-canvas transition-colors"
                  >
                    {t.works.github}
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* All works */}
      <section className="mt-14">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
          {t.works.allWorks}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[330px] rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-[15px] text-ink-muted">{t.common.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </section>

      {/* Tech stack */}
      {allTech.length > 0 && (
        <section className="mt-12 bg-surface border border-line rounded-2xl shadow-card p-8">
          <h2 className="text-[18px] font-extrabold text-ink tracking-tight mb-5">
            {t.works.technologies}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {allTech.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2.5 rounded-xl bg-canvas text-[13px] font-semibold text-ink-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <CoffeeBanner
          title={t.works.ctaTitle}
          subtitle={t.works.ctaSub}
          cta={t.works.ctaButton}
        />
      </div>
    </Container>
  );
}
