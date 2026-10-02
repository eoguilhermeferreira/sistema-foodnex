"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/cozinha", label: "Cozinha", icon: "👨‍🍳" },
  { href: "/retiradas", label: "Retiradas", icon: "🏃" },
  { href: "/entregas", label: "Entregas", icon: "🛵" },
  { href: "/mesas", label: "Mesas", icon: "🍽️" },
  { href: "/cardapio", label: "Cardápio", icon: "📋" },
  { href: "/relatorios", label: "Relatórios", icon: "📈" },
  { href: "/whatsapp", label: "WhatsApp", icon: "💬" },
  { href: "/configuracoes", label: "Configurações", icon: "⚙️" },
];

// Bottom nav shows the 5 most used items on mobile
const bottomNavItems = menuItems.slice(0, 5);

interface SidebarProps {
  companyName: string;
  badges?: Partial<Record<string, number>>;
}

export function Sidebar({ companyName, badges = {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-card px-4 py-6">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="FoodNex"
            width={48}
            height={48}
            className="rounded-lg"
            style={{ mixBlendMode: "lighten" }}
          />
          <div>
            <p className="text-lg font-semibold text-foreground">FoodNex</p>
            <p className="text-xs text-muted">Gestão Inteligente de Pedidos</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-card-hover px-3 py-2">
          <span className="truncate text-sm font-medium text-foreground">{companyName}</span>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {menuItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const badge = badges[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-wine text-white" : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {!!badge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-card-hover hover:text-foreground"
        >
          Sair
        </button>
      </aside>

      {/* ── Mobile: top header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="FoodNex"
            width={32}
            height={32}
            className="rounded-md"
            style={{ mixBlendMode: "lighten" }}
          />
          <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">{companyName}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center rounded-lg p-2 text-muted hover:bg-card-hover"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* ── Mobile: drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-72 h-full bg-card flex flex-col px-4 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="FoodNex" width={36} height={36} className="rounded-lg" style={{ mixBlendMode: "lighten" }} />
                <div>
                  <p className="text-sm font-semibold text-foreground">FoodNex</p>
                  <p className="text-xs text-muted truncate max-w-[150px]">{companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-muted hover:text-foreground"
                aria-label="Fechar menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {menuItems.map((item) => {
                const active = pathname?.startsWith(item.href);
                const badge = badges[item.href];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors ${
                      active ? "bg-wine text-white" : "text-muted hover:bg-card-hover hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {!!badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-4 rounded-lg px-3 py-3 text-left text-sm text-muted hover:bg-card-hover hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile: bottom nav (5 main items) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card">
        {bottomNavItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          const badge = badges[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center py-2 text-xs transition-colors ${
                active ? "text-wine" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
              {!!badge && (
                <span className="absolute top-1 right-1/4 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
