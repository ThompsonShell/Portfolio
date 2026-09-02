"use client";

import Link from "next/link";

export type SectionCard = {
  href: string;
  accent: string;
  title: string;
  description: string;
  linkLabel: string;
};

export default function SectionCards({ cards }: { cards: SectionCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group bg-surface border border-line rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all p-7 flex flex-col"
        >
          <span
            className="block w-9 h-1.5 rounded-full mb-6"
            style={{ backgroundColor: card.accent }}
          />
          <h3 className="text-[19px] font-extrabold text-ink tracking-tight">
            {card.title}
          </h3>
          <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted flex-1">
            {card.description}
          </p>
          <span className="mt-7 text-[13px] font-bold text-accent inline-flex items-center gap-1.5">
            {card.linkLabel}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
