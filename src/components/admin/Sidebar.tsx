"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DashboardIcon, KitchenIcon, PickupIcon, DeliveryIcon, TableIcon,
  MenuIcon, ReportsIcon, WhatsAppIcon, SettingsIcon,
  HamburgerIcon, CloseIcon, LogoutIcon, WaiterIcon,
} from "@/components/icons";

const menuItems = [
  { href: "/dashboard",     label: "Dashboard",     Icon: DashboardIcon  },
  { href: "/cozinha",       label: "Cozinha",        Icon: KitchenIcon    },
  { href: "/retiradas",     label: "Retiradas",      Icon: PickupIcon     },
  { href: "/entregas",      label: "Entregas",       Icon: DeliveryIcon   },
  { href: "/mesas",         label: "Mesas",          Icon: TableIcon      },
  { href: "/garcom",        label: "Garçom",         Icon: WaiterIcon     },
  { href: "/cardapio",      label: "Cardápio",       Icon: MenuIcon       },
  { href: "/relatorios",    label: "Relatórios",     Icon: ReportsIcon    },
  { href: "/whatsapp",      label: "WhatsApp",       Icon: WhatsAppIcon   },
  { href: "/configuracoes", label: "Configurações",  Icon: SettingsIcon   },
];

const bottomNavItems = menuItems.slice(0, 5);

interface SidebarProps {
  companyName: string;
  badges?: Partial<Record<string, number>>;
  pendingKitchen?: boolean;
  pendingWaiter?: boolean;
}

export function Sidebar({ companyName, badges = {}, pendingKitchen = false, pendingWaiter = false }: SidebarProps) {
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
          <Image src="/logo.png" alt="FoodNex" width={48} height={48} className="rounded-lg" style={{ mixBlendMode: "lighten" }} />
          <div>
            <p className="text-lg font-semibold text-foreground">FoodNex</p>
            <p className="text-xs text-muted">Gestão Inteligente de Pedidos</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-card-hover px-3 py-2">
          <span className="truncate text-sm font-medium text-foreground">{companyName}</span>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {menuItems.map(({ href, label, Icon }) => {
            const active = pathname?.startsWith(href);
            const badge = badges[href];
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-wine text-white" : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
                {!!badge && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white ${(pendingKitchen && href === "/cozinha") || (pendingWaiter && href === "/garcom") ? "animate-pulse" : ""}`}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-card-hover hover:text-foreground"
        >
          <LogoutIcon className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </aside>

      {/* ── Mobile: top header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Image src="/logo.png" alt="FoodNex" width={32} height={32} className="rounded-md shrink-0" style={{ mixBlendMode: "lighten" }} />
          <span className="text-sm font-semibold text-foreground truncate">{companyName}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="shrink-0 flex items-center justify-center rounded-lg p-2 text-muted hover:bg-card-hover"
          aria-label="Menu"
        >
          <HamburgerIcon className="h-5 w-5" />
        </button>
      </header>

      {/* ── Mobile: drawer overlay ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-72 h-full bg-card flex flex-col px-4 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <Image src="/logo.png" alt="FoodNex" width={36} height={36} className="rounded-lg shrink-0" style={{ mixBlendMode: "lighten" }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">FoodNex</p>
                  <p className="text-xs text-muted truncate">{companyName}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="shrink-0 p-1 text-muted hover:text-foreground" aria-label="Fechar menu">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {menuItems.map(({ href, label, Icon }) => {
                const active = pathname?.startsWith(href);
                const badge = badges[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors ${
                      active ? "bg-wine text-white" : "text-muted hover:bg-card-hover hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </span>
                    {!!badge && (
                      <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white ${(pendingKitchen && href === "/cozinha") || (pendingWaiter && href === "/garcom") ? "animate-pulse" : ""}`}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-muted hover:bg-card-hover hover:text-foreground"
            >
              <LogoutIcon className="h-5 w-5 shrink-0" />
              Sair
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile: bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card">
        {bottomNavItems.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          const badge = badges[href];
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center py-2 text-[11px] transition-colors ${
                active ? "text-wine" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 leading-none">{label}</span>
              {!!badge && (
                <span className={`absolute top-1 right-[calc(50%-14px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold text-white ${(pendingKitchen && href === "/cozinha") || (pendingWaiter && href === "/garcom") ? "animate-pulse" : ""}`}>
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
