"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { formatTime } from "@/lib/format";

interface WaiterCall {
  id: string;
  table_number: number;
  customer_name: string;
  status: "pendente" | "atendendo" | "concluido";
  created_at: string;
}

export default function GarcomPage() {
  const company = useCompany();
  const [calls, setCalls] = useState<WaiterCall[]>([]);

  const fetchCalls = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("waiter_calls")
      .select("*")
      .eq("company_id", company.id)
      .in("status", ["pendente", "atendendo"])
      .order("created_at", { ascending: true });
    setCalls((data as WaiterCall[]) ?? []);
  }, [company.id]);

  useEffect(() => {
    fetchCalls();

    const supabase = createClient();
    const channel = supabase
      .channel(`waiter-calls-${company.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waiter_calls", filter: `company_id=eq.${company.id}` },
        () => fetchCalls()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [company.id, fetchCalls]);

  async function attend(id: string) {
    const supabase = createClient();
    await supabase.from("waiter_calls").update({ status: "atendendo" }).eq("id", id);
    fetchCalls();
  }

  async function conclude(id: string) {
    const supabase = createClient();
    await supabase.from("waiter_calls").update({ status: "concluido" }).eq("id", id);
    fetchCalls();
  }

  const pendentes = calls.filter((c) => c.status === "pendente");
  const atendendo = calls.filter((c) => c.status === "atendendo");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Garçom</h1>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
          <p className="text-sm text-red-400">Aguardando</p>
          <p className="mt-1 text-xl font-semibold text-red-400">{pendentes.length}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-center">
          <p className="text-sm text-yellow-400">Em atendimento</p>
          <p className="mt-1 text-xl font-semibold text-yellow-400">{atendendo.length}</p>
        </div>
      </div>

      {calls.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">Nenhuma chamada pendente.</p>
      )}

      <div className="mt-6 space-y-3">
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
                  className="shrink-0 rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine-hover"
                >
                  Atender
                </button>
              ) : (
                <button
                  onClick={() => conclude(call.id)}
                  className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
