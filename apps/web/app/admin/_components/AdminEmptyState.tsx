"use client";

import Link from "next/link";

export default function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-medium text-[#57534e] dark:text-[#888]">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#a8a29e] dark:text-[#555]">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 text-sm font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
