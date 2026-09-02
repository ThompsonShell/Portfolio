export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-black/[0.05] ${className}`}
      aria-hidden="true"
    />
  );
}
