import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 flex items-center gap-2 text-[#57534e] dark:text-gray-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
