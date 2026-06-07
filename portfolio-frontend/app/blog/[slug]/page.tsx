"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Skeleton from "@/components/ui/Skeleton";
import { getPost } from "@/lib/api";
import type { PostDetail } from "@/lib/types";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getPost(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Post not found</h1>
        <p className="text-text-secondary mb-6">
          The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/blog" className="text-accent-primary hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/blog"
          className="text-text-secondary hover:text-accent-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8 inline-flex items-center gap-2"
        >
          <span className="text-accent-primary">←</span> Back to Blog
        </Link>

        <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tighter mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-text-secondary/60 mb-12">
          <span>{formatDate(post.published_at)}</span>
          <span className="w-1.5 h-1.5 bg-accent-primary/20 rounded-full" />
          <span>{post.reading_time} min read</span>
        </div>
      </motion.div>

      {post.cover_image_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative h-64 md:h-[400px] w-full rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl"
        >
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Markdown content rendered with syntax highlighting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="prose prose-invert prose-lg max-w-none prose-headings:text-text-primary prose-headings:tracking-tight prose-p:text-text-secondary prose-p:leading-relaxed prose-a:text-accent-primary prose-strong:text-text-primary prose-code:text-accent-primary bg-surface/30 p-8 md:p-12 rounded-[2.5rem] border border-border-subtle"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </motion.div>

      <div className="mt-24 pt-12 border-t border-border-subtle text-center">
        <p className="text-text-secondary text-sm mb-6">Enjoyed this post? Share your thoughts!</p>
        <Button href="/coffee" variant="primary" className="rounded-full px-10">Coffee Chat</Button>
      </div>
    </article>
  );
}
