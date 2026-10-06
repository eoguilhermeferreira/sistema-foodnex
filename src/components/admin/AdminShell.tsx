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
  const [pendingCount, setPendingCount] = useState(0);
  const initializedRef = useRef(false);

  const fetchPending = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "aguardando_aceite");
    setPendingCount(count ?? 0);
  }, [companyId]);

  useEffect(() => {
    fetchPending();

    const supabase = createClient();
    const channel = supabase
      .channel(`admin-shell-${companyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
        () => {
          if (initializedRef.current) playNotificationSound();
          fetchPending();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
        () => fetchPending()
      )
      .subscribe(() => {
        initializedRef.current = true;
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, fetchPending]);

  const badges = pendingCount > 0 ? { "/cozinha": pendingCount } : {};

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar companyName={companyName} badges={badges} pending={pendingCount > 0} />
      <main className="flex-1 overflow-y-auto p-4 pb-20 pt-[calc(1rem+53px)] md:p-8 md:pb-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
