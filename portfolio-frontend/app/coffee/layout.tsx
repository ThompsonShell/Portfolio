import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coffee",
  description: "Schedule a coffee chat to discuss technology, collaboration, or career advice.",
};

export default function CoffeeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}