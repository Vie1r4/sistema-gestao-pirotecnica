"use client";

import AdminBreadcrumb, { type BreadcrumbItem } from "./AdminBreadcrumb";

type Props = {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: Props) {
  return (
    <header className="space-y-2">
      {breadcrumb && breadcrumb.length > 0 && (
        <AdminBreadcrumb items={breadcrumb} />
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1c1917] dark:text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[#57534e] dark:text-[#888]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
