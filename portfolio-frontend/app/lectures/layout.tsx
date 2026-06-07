import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lectures",
  description: "Video lectures on databases, networking, algorithms, and software development.",
};

export default function LecturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
