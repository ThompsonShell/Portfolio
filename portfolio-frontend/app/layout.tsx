import type { Metadata } from "next";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ThompsonShell — Developer Portfolio",
    template: "%s | ThompsonShell",
  },
  description:
    "Backend Developer specializing in Django, Django REST Framework, and Scalable Backend Architectures. Building robust and performant web systems.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ThompsonShell Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Devicons CDN for skill icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css"
        />
        {/* highlight.js theme for code blocks */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
      </head>
      <body className="bg-black text-text-primary min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
