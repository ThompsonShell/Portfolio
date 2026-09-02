"use client";

import Icon, { type IconName } from "@/components/ui/Icon";

type Stat = { icon: IconName; tone: string; value: string; label: string };

export default function HomeStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface border border-line rounded-2xl shadow-card p-6 flex items-center gap-4"
        >
          <span
            className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${stat.tone}`}
          >
            <Icon name={stat.icon} size={19} />
          </span>
          <div>
            <div className="text-[30px] font-extrabold text-ink leading-none tracking-tight">
              {stat.value}
            </div>
            <div className="text-[13px] font-medium text-ink-muted mt-1.5">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
