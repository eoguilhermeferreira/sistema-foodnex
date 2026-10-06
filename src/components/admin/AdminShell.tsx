"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./Sidebar";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
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
  const initializedRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    const supabase = createClient();
    const [ordersRes, waiterRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .eq("status", "aguardando_aceite"),
      supabase
        .from("waiter_calls")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
        .in("status", ["pendente", "atendendo"]),
    ]);
    setPendingOrders(ordersRes.count ?? 0);
    setPendingWaiter(waiterRes.count ?? 0);
  }, [companyId]);

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

    return () => {
      supabase.removeChannel(channel);
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
        {children}
      </main>
    </div>
  );
}
