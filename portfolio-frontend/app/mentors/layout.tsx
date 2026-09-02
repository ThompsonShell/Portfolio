import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ustozlar",
  description: "Menga yo'l ko'rsatgan, ilhom bergan va o'sishimga yordam bergan insonlar.",
};

export default function MentorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
