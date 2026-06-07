import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my background, experience, and the technologies I work with.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
