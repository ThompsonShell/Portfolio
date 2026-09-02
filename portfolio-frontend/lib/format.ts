/** 2400 → "2.4k", 1_200_000 → "1.2M". Matches the counters in the design. */
export function compactNumber(value: number): string {
  if (!Number.isFinite(value) || value < 1000) return String(value ?? 0);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
  }
  const m = value / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}M`;
}

/** 3600 → "60:00", 615 → "10:15". */
export function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 5400 → "1.5h" for the course-length stat. */
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)}m`;
  return `${hours < 10 ? hours.toFixed(1).replace(/\.0$/, "") : Math.round(hours)}h`;
}
