export default function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`max-w-[1200px] mx-auto px-5 md:px-7 ${className}`}>
      {children}
    </div>
  );
}
