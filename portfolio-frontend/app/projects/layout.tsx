import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse my portfolio of web development projects built with Django, Next.js, and more.",
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
