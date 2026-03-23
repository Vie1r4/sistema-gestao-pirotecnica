"use client";

const CARD_CLASS =
  "rounded-2xl border border-[#e7e5e4] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:border-[#222] dark:bg-[#111] dark:hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]";

export function AdminCard({
  children,
  className = "",
  padding = true,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${CARD_CLASS} ${padding ? "p-5 sm:p-6" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export const adminCardClass = CARD_CLASS;
