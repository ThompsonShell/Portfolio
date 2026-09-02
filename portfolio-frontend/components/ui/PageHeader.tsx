/** The shared page opener: a soft pill, an oversized title, and a lede. */
export default function PageHeader({
  badge,
  badgeTone = "purple",
  title,
  subtitle,
  children,
}: {
  badge?: string;
  badgeTone?: "purple" | "amber" | "pink";
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const tones = {
    purple: "bg-accent-soft text-accent",
    amber: "bg-amber-100 text-amber-700",
    pink: "bg-pink-100 text-pink-600",
  } as const;

  return (
    <header className="pt-16 pb-10 md:pt-20 md:pb-14">
      {badge && (
        <span
          className={`inline-block px-3.5 py-1.5 rounded-full text-[12px] font-bold ${tones[badgeTone]}`}
        >
          {badge}
        </span>
      )}
      <h1 className="mt-5 text-[44px] md:text-[64px] font-extrabold tracking-tight text-ink leading-[1.02]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-[17px] leading-relaxed text-ink-muted max-w-xl">
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}
