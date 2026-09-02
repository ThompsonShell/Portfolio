import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Texnik maqolalar, hayotiy fikrlar, iqtiboslar va tarixiy lavhalar.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
