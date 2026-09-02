import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qahva",
  description: "Bir piyola qahva ustida suhbat — online yoki Toshkentda.",
};

export default function CoffeeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
