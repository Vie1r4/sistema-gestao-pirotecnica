"use client";

import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

const LABELS: Record<string, string> = {
  admin: "Painel",
  utilizadores: "Utilizadores",
  logs: "Logs",
  definicoes: "Definições",
  editar: "Editar",
};

function pathSegmentToLabel(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (segment.match(/^[0-9a-f-]{36}$/i)) return "Detalhe";
  return segment;
}

export function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Admin", href: "/admin" }];
  let acc = "/admin";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    const label = pathSegmentToLabel(seg);
    items.push(i === segments.length - 1 ? { label } : { label, href: acc });
  }
  return items;
}

export default function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length <= 1) return null;
  return (
    <nav aria-label="Navegação" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[#78716c] dark:text-[#888]">
        {items.map((item, i) => (
          <li key={item.href ?? `crumb-${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-[#a8a29e] dark:text-[#555]" aria-hidden>
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[#f97316] hover:underline dark:hover:text-[#f97316]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[#57534e] dark:text-[#a3a3a3]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
