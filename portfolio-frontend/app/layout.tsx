import type { Metadata } from "next";
import LanguageProvider from "@/components/i18n/LanguageProvider";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "asilbek.dev — Developer & Engineer",
    template: "%s | asilbek.dev",
  },
  description:
    "Developer va engineer. Loyihalar, video darsliklar, maqolalar va ustozlar haqida.",
  openGraph: {
    type: "website",
    siteName: "asilbek.dev",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="bg-canvas text-ink min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <NavBar />
          <main className="flex-1 pt-[60px]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
