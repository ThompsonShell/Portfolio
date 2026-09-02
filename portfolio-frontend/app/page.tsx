"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Hero from "@/components/sections/Hero";
import HomeStats from "@/components/sections/HomeStats";
import SectionCards from "@/components/sections/SectionCards";
import RecentWriting from "@/components/sections/RecentWriting";
import MentorsStrip from "@/components/sections/MentorsStrip";
import CoffeeBanner from "@/components/sections/CoffeeBanner";
import Container from "@/components/ui/Container";
import { getSiteStats } from "@/lib/api";
import type { SiteStats } from "@/lib/types";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState<SiteStats | null>(null);

  // Real totals, not the length of a paginated page.
  useEffect(() => {
    let active = true;
    getSiteStats()
      .then((data) => active && setStats(data))
      .catch(() => active && setStats(null));
    return () => {
      active = false;
    };
  }, []);

  const counts = {
    works: stats?.works ?? 0,
    courses: stats?.courses ?? 0,
    posts: stats?.posts ?? 0,
  };

  return (
    <>
      <Hero />

      <Container className="py-14 md:py-16 space-y-14 md:space-y-16">
        <HomeStats
          stats={[
            {
              icon: "code",
              tone: "bg-accent-soft text-accent",
              value: `${counts.works}`,
              label: t.home.statProjects,
            },
            {
              icon: "video",
              tone: "bg-emerald-50 text-emerald-600",
              value: `${counts.courses}`,
              label: t.home.statCourses,
            },
            {
              icon: "pencil",
              tone: "bg-amber-50 text-amber-600",
              value: `${counts.posts}`,
              label: t.home.statPosts,
            },
          ]}
        />

        <section>
          <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
            {t.home.sections}
          </h2>
          <SectionCards
            cards={[
              {
                href: "/blog",
                accent: "#F59E0B",
                title: t.nav.blog,
                description: t.home.blogDesc,
                linkLabel: `${counts.posts} ${t.home.countPosts}`,
              },
              {
                href: "/lectures",
                accent: "#22C55E",
                title: t.nav.lectures,
                description: t.home.lecturesDesc,
                linkLabel: `${counts.courses} ${t.home.countCourses}`,
              },
              {
                href: "/works",
                accent: "#EF4444",
                title: t.nav.works,
                description: t.home.worksDesc,
                linkLabel: `${counts.works} ${t.home.countWorks}`,
              },
            ]}
          />
        </section>

        <RecentWriting />
        <MentorsStrip />
        <CoffeeBanner />
      </Container>
    </>
  );
}
