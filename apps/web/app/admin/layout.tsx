"use client";



import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import Navbar from "@/app/components/Navbar";

import { getToken } from "@/app/lib/auth";

import { useUser } from "@/app/context/UserContext";

import { AdminIcons } from "@/app/admin/_components/AdminIcons";

import { adminTheme } from "@/app/admin/_components/adminTheme";
import AuthLoadingShell from "@/app/components/auth/AuthLoadingShell";



const NAV_ITEMS: {

  href: string;

  label: string;

  group: string;

  icon: React.ReactNode;

}[] = [

  { href: "/admin", label: "Dashboard", group: "Geral", icon: AdminIcons.dashboard },

  { href: "/admin/utilizadores", label: "Utilizadores", group: "Geral", icon: AdminIcons.users },

  { href: "/admin/logs", label: "Logs do sistema", group: "Sistema", icon: AdminIcons.logs },

  { href: "/admin/definicoes", label: "Definições", group: "Sistema", icon: AdminIcons.settings },

];



const GROUPS: { id: string; label: string }[] = [

  { id: "Geral", label: "Geral" },

  { id: "Sistema", label: "Sistema" },

];



function AdminNav({

  pathname,

  onNavigate,

}: {

  pathname: string;

  onNavigate?: () => void;

}) {

  return (

    <>

      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] dark:text-[#555]">

        Painel Admin

      </p>

      {GROUPS.map((group, gi) => {

        const items = NAV_ITEMS.filter((n) => n.group === group.id);

        if (items.length === 0) return null;

        return (

          <div

            key={group.id}

            className={gi > 0 ? "mt-3 border-t border-[#f0eeec] pt-3 dark:border-[#1a1a1a]" : ""}

          >

            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#c0bbb6] dark:text-[#444]">

              {group.label}

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

                      onClick={onNavigate}

                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${

                        isActive ? adminTheme.navActive : adminTheme.navIdle

                      }`}

                    >

                      <span className={isActive ? "text-black" : "text-[#a8a29e] dark:text-[#555]"}>

                        {item.icon}

                      </span>

                      {item.label}

                    </Link>

                  </li>

                );

              })}

            </ul>

          </div>

        );

      })}

      <div className="mt-4 border-t border-[#f0eeec] pt-3 dark:border-[#1a1a1a]">

        <Link

          href="/"

          onClick={onNavigate}

          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${adminTheme.navIdle}`}

        >

          <span className="text-[#a8a29e] dark:text-[#555]">{AdminIcons.exit}</span>

          Voltar à aplicação

        </Link>

      </div>

    </>

  );

}



export default function AdminLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  const pathname = usePathname();

  const router = useRouter();

  const { user, loading: userLoading } = useUser();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);



  const isAdmin = (user?.roles ?? []).includes("Admin");

  const token = getToken();



  useEffect(() => {

    setMobileNavOpen(false);

  }, [pathname]);



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

    return <AuthLoadingShell className={adminTheme.pageBg} />;

  }



  return (

    <div className={`min-h-screen ${adminTheme.pageBg} text-[#1c1917] selection:bg-[#f97316]/20 dark:text-white`}>

      <Navbar />

      <main className="page-shell relative pb-12 sm:pb-16">

        <div className="content-container content-container--admin pt-6">

          <button

            type="button"

            className="mb-4 flex w-full items-center justify-between rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm font-medium text-[#57534e] lg:hidden dark:border-[#222] dark:bg-[#111] dark:text-[#a3a3a3]"

            aria-expanded={mobileNavOpen}

            onClick={() => setMobileNavOpen((o) => !o)}

          >

            <span className="flex items-center gap-2">

              {AdminIcons.dashboard}

              Menu do painel

            </span>

            <span className="text-xs text-[#a8a29e]">{mobileNavOpen ? "Fechar" : "Abrir"}</span>

          </button>



          {mobileNavOpen && (

            <nav

              className={`mb-4 p-3 lg:hidden ${adminTheme.sidebar}`}

              aria-label="Painel Admin (mobile)"

            >

              <AdminNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />

            </nav>

          )}



          <div className="flex flex-col gap-8 lg:flex-row">

            <aside className="hidden lg:block lg:w-64 lg:shrink-0">

              <nav className={`sticky top-content-offset p-3 ${adminTheme.sidebar}`} aria-label="Painel Admin">

                <AdminNav pathname={pathname} />

              </nav>

            </aside>



            <div className="min-w-0 flex-1">{children}</div>

          </div>

        </div>

      </main>

    </div>

  );

}

