import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-accent-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mb-4">
        Page Not Found
      </h2>
      <p className="text-text-secondary mb-8 max-w-md">
        Looks like you&apos;ve wandered into uncharted territory.
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-glow transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}
