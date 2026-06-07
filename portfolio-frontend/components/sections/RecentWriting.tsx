"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPosts } from "@/lib/api";
import type { PostSummary } from "@/lib/types";

export default function RecentWriting() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.slice(0, 3)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="border-b border-[#1a1a1a] p-8 md:p-12 lg:p-16">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] uppercase">
          Recent Writing
        </h2>
        <Link
          href="/blog"
          className="text-[10px] font-black tracking-[0.2em] text-[#8c8c94] hover:text-[#e5e5e5] uppercase transition-colors"
        >
          All posts →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-12 bg-black animate-pulse rounded border border-[#1a1a1a]"></div>
          <div className="h-12 bg-black animate-pulse rounded border border-[#1a1a1a]"></div>
          <div className="h-12 bg-black animate-pulse rounded border border-[#1a1a1a]"></div>
        </div>
      ) : (
        <div className="flex flex-col">
          {posts.map((post) => {
            const dateStr = new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(post.published_at));
            
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors -mx-4 px-4 rounded-xl"
              >
                <div className="text-[12px] font-medium text-[#8c8c94] w-32 shrink-0 mb-2 md:mb-0">
                  {dateStr}
                </div>
                <div className="flex-1 text-lg font-bold text-[#8c8c94] group-hover:text-[#e5e5e5] transition-colors">
                  {post.title}
                </div>
                <div className="text-[12px] font-medium text-[#8c8c94] w-16 text-right mt-2 md:mt-0">
                  {post.reading_time || 6} min
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
