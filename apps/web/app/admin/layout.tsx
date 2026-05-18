"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar, { CONTENT_OFFSET_TOP } from "@/app/components/Navbar";
import { getToken } from "@/app/lib/auth";
import { useUser } from "@/app/context/UserContext";

const NAV_ITEMS: { href: string; label: string; group?: string }[] = [
  { href: "/admin", label: "Dashboard", group: "Geral" },
  { href: "/admin/utilizadores", label: "Utilizadores", group: "Geral" },
  { href: "/admin/logs", label: "Logs do sistema", group: "Sistema" },
  { href: "/admin/definicoes", label: "Definições", group: "Sistema" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const isAdmin = (user?.roles ?? []).includes("Admin");
  const token = getToken();

  useEffect(() => {
    if (userLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, token, userLoading, router]);

  if (userLoading || !token || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-[#1c1917] selection:bg-[#f97316]/20 dark:bg-[#0a0a0a] dark:text-white">
      <Navbar />
      <main
        className="relative px-4 pb-12 pt-4 sm:px-6 sm:pb-16 pt-content-offset"
        
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <nav
              className="sticky top-4 rounded-2xl border border-[#e7e5e4] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#222] dark:bg-[#111]"
              aria-label="Admin"
            >
              <p className="mb-3 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#78716c] dark:text-[#666]">
                Painel Admin
              </p>
              {["Geral", "Sistema"].map((group) => {
                const items = NAV_ITEMS.filter((n) => n.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-4 last:mb-0">
                    <p className="mb-1.5 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#a8a29e] dark:text-[#555]">
                      {group}
                    </p>
                    <ul className="space-y-0.5">
                      {items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-[#f97316] text-black dark:bg-[#f97316] dark:text-black"
                                  : "text-[#57534e] hover:bg-[#fafaf9] hover:text-[#1c1917] dark:text-[#a3a3a3] dark:hover:bg-[#1a1a1a] dark:hover:text-white"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
