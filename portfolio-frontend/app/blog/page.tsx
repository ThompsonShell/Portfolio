"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { getPosts } from "@/lib/api";
import type { PostSummary } from "@/lib/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tighter mb-4">
          Blog
        </h1>
        <p className="text-text-secondary text-lg mb-16 max-w-xl">
          Subscribe New article and lectures @shellbron telegram channel you can find
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/4 rounded-xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-3xl border border-border-subtle">
          <p className="text-text-secondary">No blog posts yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block mb-12 last:mb-0">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {post.cover_image_url && (
                    <div className="relative w-full md:w-64 h-48 rounded-3xl overflow-hidden bg-surface border border-border-subtle flex-shrink-0 group-hover:border-accent-primary/20 transition-all">
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-accent-primary">
                      <span>{formatDate(post.published_at)}</span>
                      <span className="w-1 h-1 bg-border-subtle rounded-full" />
                      <span className="text-text-secondary/60">{post.reading_time} min read</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent-primary transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-text-secondary leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="pt-2">
                      <span className="text-sm font-semibold text-text-primary group-hover:translate-x-2 inline-flex items-center gap-2 transition-transform">
                        Read post <span className="text-accent-primary">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
