/** The small line icons used across cards. Names match `WorkFeature.icon`. */
export type IconName =
  | "code"
  | "video"
  | "pencil"
  | "check"
  | "book"
  | "users"
  | "star"
  | "smile"
  | "arrow-right";

const PATHS: Record<IconName, React.ReactNode> = {
  code: (
    <>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </>
  ),
  video: (
    <>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" />
    </>
  ),
  pencil: (
    <>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </>
  ),
  check: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </>
  ),
  star: (
    <path d="M11.5 2.9a.5.5 0 0 1 .9 0l2.4 5 5.4.8a.5.5 0 0 1 .3.9l-3.9 3.8.9 5.4a.5.5 0 0 1-.7.5L12 16.8l-4.8 2.5a.5.5 0 0 1-.7-.5l.9-5.4-3.9-3.8a.5.5 0 0 1 .3-.9l5.4-.8Z" />
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01M15 9h.01" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
};

export default function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName | string;
  size?: number;
  className?: string;
}) {
  const path = PATHS[(name as IconName) in PATHS ? (name as IconName) : "code"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
