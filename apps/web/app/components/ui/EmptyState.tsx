import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#e7e5e4] bg-[#fafaf9] px-6 py-12 text-center dark:border-[#333] dark:bg-[#0a0a0a]">
      <p className="text-base font-medium text-[#1c1917] dark:text-white">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-[#57534e] dark:text-gray-400">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
