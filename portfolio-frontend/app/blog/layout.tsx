import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on backend development, Django, Next.js, and software engineering best practices.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
