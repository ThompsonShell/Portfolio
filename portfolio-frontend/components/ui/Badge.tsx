interface BadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export default function Badge({ children, active = false, onClick }: BadgeProps) {
  const base = "px-3 py-1 rounded-full text-xs font-medium transition-colors";
  const style = active
    ? "bg-accent-primary text-white"
    : "bg-bg-secondary text-text-secondary border border-border-subtle hover:border-accent-primary/50";

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${style} cursor-pointer`}>
        {children}
      </button>
    );
  }

  return <span className={`${base} ${style}`}>{children}</span>;
}
