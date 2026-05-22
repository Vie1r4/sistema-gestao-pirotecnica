"use client";

export default function AdminSection({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`.trim()}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e7e5e4] pb-3 dark:border-[#1f1f1f]">
        <div>
          <h2 className="text-base font-semibold text-[#1c1917] dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-[#78716c] dark:text-[#666]">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
