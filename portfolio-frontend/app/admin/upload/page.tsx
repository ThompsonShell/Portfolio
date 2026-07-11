"use client";

import dynamic from "next/dynamic";

// Uppy touches browser-only APIs, so render it client-side only.
const VideoUploader = dynamic(() => import("@/components/VideoUploader"), { ssr: false });

export default function AdminUploadPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-16">
      <VideoUploader />
    </main>
  );
}
