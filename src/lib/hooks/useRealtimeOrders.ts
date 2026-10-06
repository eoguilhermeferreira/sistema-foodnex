"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types/domain";

export function useRealtimeOrders(companyId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*), addresses(*), tables_restaurant(number)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    const normalized = (data ?? []).map((o: any) => ({
      ...o,
      table_number: o.tables_restaurant?.number ?? null,
    }));
    setOrders(normalized as unknown as Order[]);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchOrders();

    const supabase = createClient();
    const channel = supabase
      .channel(`orders-${companyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `company_id=eq.${companyId}` },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "addresses" },
        () => fetchOrders()
      )
      .subscribe();

    // polling fallback — garante atualização mesmo se WebSocket cair (mobile)
    const poll = setInterval(fetchOrders, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [companyId, fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}
