"use client";

import Link from "next/link";
import type { Work } from "@/lib/types";

/** Tag chip colours keyed by work type, matching the design's pastel pills. */
const TYPE_TONE: Record<string, string> = {
  web_app: "bg-accent-soft text-accent",
  mobile: "bg-pink-100 text-pink-600",
  api: "bg-cyan-100 text-cyan-700",
  open_source: "bg-emerald-100 text-emerald-700",
  other: "bg-stone-200 text-stone-600",
};

export default function WorkCard({ work }: { work: Work }) {
  const accent = work.accent_color || "#7C3AED";

  return (
    <Link
      href={`/works/${work.slug}`}
      className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
    >
      {/* Cover — a real image when there is one, otherwise the accent gradient
          with a browser-chrome sketch, as in the design. */}
      <div
        className="h-[190px] relative overflow-hidden"
        style={
          work.cover_image_url
            ? undefined
            : { background: `linear-gradient(140deg, ${accent}, ${accent}B3)` }
        }
      >
        {work.cover_image_url ? (
          <img
            src={work.cover_image_url}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8">
            <div className="w-full max-w-[210px] rounded-lg bg-white/20 border border-white/25 overflow-hidden">
              <div className="flex gap-1 px-2.5 py-2 border-b border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              </div>
              <div className="p-2.5 space-y-1.5">
                <div className="h-2 w-3/4 rounded bg-white/30" />
                <div className="h-8 rounded bg-white/25" />
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-5 rounded bg-white/25" />
                  <div className="h-5 rounded bg-white/25" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
              TYPE_TONE[work.work_type] ?? TYPE_TONE.other
            }`}
          >
            {work.work_type_display}
          </span>
          {work.tech_tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-canvas text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-[17px] font-extrabold text-ink tracking-tight group-hover:text-accent transition-colors">
          {work.title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted line-clamp-2">
          {work.description}
        </p>
      </div>
    </Link>
  );
}
