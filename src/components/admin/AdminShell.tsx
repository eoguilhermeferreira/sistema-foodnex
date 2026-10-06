"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";

// Singleton AudioContext — desbloqueado no primeiro toque do usuário
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  return audioCtx;
}

function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();

    o1.connect(gain);
    o2.connect(gain);
    gain.connect(ctx.destination);

    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.setValueAtTime(880, ctx.currentTime);
    o2.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    o1.start(ctx.currentTime);
    o1.stop(ctx.currentTime + 0.15);
    o2.start(ctx.currentTime + 0.15);
    o2.stop(ctx.currentTime + 0.6);
  } catch {}
}

interface Props {
  companyId: string;
  companyName: string;
  children: React.ReactNode;
}

export function AdminShell({ companyId, companyName, children }: Props) {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingWaiter, setPendingWaiter] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const initializedRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    const supabase = createClient();
    const [ordersRes, waiterRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "aguardando_aceite"),
      (supabase as any)
        .from("waiter_calls")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "pendente"),
    ]);
    setPendingOrders(ordersRes.count ?? 0);
    setPendingWaiter(waiterRes.count ?? 0);
  }, [companyId]);

  useEffect(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== "suspended") setAudioUnlocked(true);
    const unlock = () => {
      getAudioContext()?.resume().then(() => setAudioUnlocked(true));
    };
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  useEffect(() => {
    fetchCounts();

    const supabase = createClient();
    const channel = supabase
      .channel(`admin-shell-${companyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
        () => {
          if (initializedRef.current) playNotificationSound();
          fetchCounts();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waiter_calls", filter: `company_id=eq.${companyId}` },
        () => {
          if (initializedRef.current) playNotificationSound();
          fetchCounts();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "waiter_calls", filter: `company_id=eq.${companyId}` },
        () => fetchCounts()
      )
      .subscribe(() => {
        initializedRef.current = true;
      });

    // polling fallback — garante atualização mesmo se WebSocket cair (mobile)
    const poll = setInterval(fetchCounts, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [companyId, fetchCounts]);

  const badges: Partial<Record<string, number>> = {};
  if (pendingOrders > 0) badges["/cozinha"] = pendingOrders;
  if (pendingWaiter > 0) badges["/garcom"] = pendingWaiter;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        companyName={companyName}
        badges={badges}
        pendingKitchen={pendingOrders > 0}
        pendingWaiter={pendingWaiter > 0}
      />
      <main className="flex-1 overflow-y-auto p-4 pb-20 pt-[calc(1rem+53px)] md:p-8 md:pb-8 md:pt-8">
        {!audioUnlocked && (
          <button
            onClick={() => {
              getAudioContext()?.resume().then(() => {
                setAudioUnlocked(true);
                playNotificationSound();
              });
            }}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20"
          >
            🔔 Ativar som de notificações
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
