"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/format";

interface WaiterCall {
  id: string;
  table_number: number;
  customer_name: string;
  status: "pendente" | "atendendo" | "concluido";
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  fantasy_name: string | null;
  logo_url: string | null;
  logo_shape: string | null;
}

export default function GarcomPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const prevPendingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function loadCompany() {
      const supabase = createClient();
      const { data } = await supabase
        .from("companies")
        .select("id, name, fantasy_name, logo_url, logo_shape")
        .eq("slug", slug)
        .single();
      if (!data) { setNotFound(true); return; }
      setCompany(data as unknown as Company);
    }
    loadCompany();
  }, [slug]);

  // register service worker on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // auto-subscribe if already granted (e.g. returning user)
  useEffect(() => {
    if (notifPermission === "granted" && company && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      subscribePush(company.id).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifPermission, company]);

  async function subscribePush(companyId: string) {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, subscription: sub.toJSON() }),
      });
    } catch {}
  }

  async function requestNotifPermission() {
    if (!("Notification" in window)) return;
    try {
      const p = await Notification.requestPermission();
      setNotifPermission(p);
      if (p === "granted" && company) await subscribePush(company.id);
    } catch {}
  }

  const fetchCalls = useCallback(async () => {
    if (!company) return;
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from("waiter_calls")
      .select("*")
      .eq("company_id", company.id)
      .in("status", ["pendente", "atendendo"])
      .order("created_at", { ascending: true });
    const rows = (data as WaiterCall[]) ?? [];

    // detect new pendente calls and show browser notification
    const newPending = rows.filter(
      (c) => c.status === "pendente" && !prevPendingIds.current.has(c.id)
    );
    newPending.forEach((c) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("🛎️ Chamada de garçom", {
          body: `Mesa ${c.table_number} — ${c.customer_name}`,
          tag: c.id,
        });
      }
    });
    prevPendingIds.current = new Set(rows.filter((c) => c.status === "pendente").map((c) => c.id));

    setCalls(rows);
  }, [company]);

  useEffect(() => {
    if (!company) return;
    fetchCalls();

    const supabase = createClient();
    const channel = supabase
      .channel(`garcom-public-${company.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiter_calls", filter: `company_id=eq.${company.id}` },
        () => fetchCalls()
      )
      .subscribe();

    // polling fallback — garante atualização mesmo se WebSocket cair (mobile)
    const poll = setInterval(fetchCalls, 15000);

    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [company, fetchCalls]);

  async function attend(id: string) {
    const supabase = createClient();
    await (supabase as any).from("waiter_calls").update({ status: "atendendo" }).eq("id", id);
    fetchCalls();
  }

  async function conclude(id: string) {
    const supabase = createClient();
    await (supabase as any).from("waiter_calls").update({ status: "concluido" }).eq("id", id);
    fetchCalls();
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Estabelecimento não encontrado.</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Carregando...</p>
      </div>
    );
  }

  const pendentes = calls.filter((c) => c.status === "pendente");
  const atendendo = calls.filter((c) => c.status === "atendendo");

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* header */}
      <div className="mb-6 flex items-center gap-3">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className={`h-12 w-12 shrink-0 object-cover ${company.logo_shape === "round" ? "rounded-full" : "rounded-xl"}`}
          />
        ) : (
          <div className={`h-12 w-12 shrink-0 bg-card ${company.logo_shape === "round" ? "rounded-full" : "rounded-xl"}`} />
        )}
        <div>
          <p className="font-bold text-foreground">{company.fantasy_name ?? company.name}</p>
          <p className="text-xs text-muted">Painel do Garçom</p>
        </div>
      </div>

      {/* notification permission prompt */}
      {notifPermission !== "granted" && (
        <button
          onClick={requestNotifPermission}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 active:scale-95"
        >
          🔔 Ativar notificações do celular
        </button>
      )}

      {/* counters */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-center">
          <p className="text-xs text-red-400">Aguardando</p>
          <p className="mt-0.5 text-2xl font-bold text-red-400">{pendentes.length}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-center">
          <p className="text-xs text-yellow-400">Em atendimento</p>
          <p className="mt-0.5 text-2xl font-bold text-yellow-400">{atendendo.length}</p>
        </div>
      </div>

      {calls.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-2 text-center">
          <span className="text-4xl">✅</span>
          <p className="text-sm font-medium text-foreground">Nenhuma chamada pendente</p>
          <p className="text-xs text-muted">A página atualiza automaticamente.</p>
        </div>
      )}

      <div className="space-y-3">
        {calls.map((call) => (
          <div
            key={call.id}
            className={`rounded-xl border p-4 ${
              call.status === "pendente"
                ? "border-red-500/60 bg-red-500/10"
                : "border-yellow-500/60 bg-yellow-500/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Mesa {call.table_number}</p>
                <p className="text-sm text-muted">{call.customer_name} · {formatTime(call.created_at)}</p>
              </div>
              {call.status === "pendente" ? (
                <button
                  onClick={() => attend(call.id)}
                  className="shrink-0 rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine-hover active:scale-95"
                >
                  Atender
                </button>
              ) : (
                <button
                  onClick={() => conclude(call.id)}
                  className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 active:scale-95"
                >
                  Concluído
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}
