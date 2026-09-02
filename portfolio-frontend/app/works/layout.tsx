import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ishlar",
  description: "Real loyihalar, real natijalar — web, mobile, API va open source ishlari.",
};

export default function WorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
