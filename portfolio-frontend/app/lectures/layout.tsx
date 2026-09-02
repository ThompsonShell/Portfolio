import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Darslar",
  description: "Bosqichma-bosqich video darsliklar — real loyihalar bilan.",
};

export default function LecturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
