"use client";

export type FilterTab = { value: string; label: string };

export default function FilterTabs({
  tabs,
  active,
  onChange,
  variant = "dark",
}: {
  tabs: FilterTab[];
  active: string;
  onChange: (value: string) => void;
  /** "dark" = black active pill (Works); "purple" = accent pill (Lectures). */
  variant?: "dark" | "purple";
}) {
  const activeClass =
    variant === "purple" ? "bg-accent text-white" : "bg-ink text-white";

  return (
    <div className="flex flex-wrap gap-2.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={active === tab.value}
          className={`px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${
            active === tab.value
              ? activeClass
              : "bg-surface text-ink-muted border border-line hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
