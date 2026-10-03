"use client";

import { useMemo, useState } from "react";
import { useRealtimeTables } from "@/lib/hooks/useRealtimeTables";
import { useCompany } from "@/contexts/CompanyContext";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import type { TableRestaurant } from "@/types/domain";

const statusStyles: Record<string, { card: string; label: string }> = {
  livre:     { card: "border-green-500/60 bg-green-500/10",  label: "text-green-400" },
  ocupada:   { card: "border-red-500/60   bg-red-500/10",    label: "text-red-400"   },
  encerrada: { card: "border-yellow-500/60 bg-yellow-500/10", label: "text-yellow-400" },
};

function TableIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" fill="none" className={className} aria-hidden>
      {/* tabletop */}
      <rect x="6" y="13" width="28" height="10" rx="2" fill="currentColor" opacity="0.9" />
      {/* left leg */}
      <rect x="10" y="23" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
      {/* right leg */}
      <rect x="27" y="23" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
      {/* chair top */}
      <rect x="14" y="4" width="12" height="5" rx="2" fill="currentColor" opacity="0.55" />
      {/* chair bottom */}
      <rect x="14" y="4" width="12" height="10" rx="2" fill="currentColor" opacity="0.25" />
      {/* chair bottom legs */}
      <rect x="15" y="8" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="23" y="8" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export default function MesasPage() {
  const company = useCompany();
  const { tables, refetch } = useRealtimeTables(company.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedId) ?? null,
    [tables, selectedId]
  );

  const ocupadas = tables.filter((t) => t.status === "ocupada").length;
  const livres = tables.filter((t) => t.status === "livre").length;

  async function addTable() {
    const number = Number(newTableNumber);
    if (!number) return;
    const supabase = createClient();
    await supabase.from("tables_restaurant").insert({ company_id: company.id, number });
    setNewTableNumber("");
    refetch();
  }

  async function addComanda(tableId: string) {
    if (!newCustomerName.trim()) return;
    const supabase = createClient();
    await supabase.from("table_customers").insert({ table_id: tableId, name: newCustomerName.trim() });
    await supabase.from("tables_restaurant").update({ status: "ocupada" }).eq("id", tableId);
    setNewCustomerName("");
    refetch();
  }

  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, string>>({});
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [addingLoading, setAddingLoading] = useState(false);

  async function addItemToCustomer(customerId: string, currentSubtotal: number) {
    if (!itemName.trim() || !itemPrice) return;
    setAddingLoading(true);
    const supabase = createClient();
    const qty = parseInt(itemQty) || 1;
    const price = parseFloat(itemPrice.replace(",", "."));
    await supabase.from("table_customers").update({ subtotal: (currentSubtotal ?? 0) + price * qty } as any).eq("id", customerId);
    setItemName(""); setItemQty("1"); setItemPrice(""); setAddItemFor(null); setAddingLoading(false);
    refetch();
  }

  const paymentOptions = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "pix", label: "Pix" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "cartao_debito", label: "Cartão de Débito" },
  ];

  async function markPaid(customerId: string) {
    const supabase = createClient();
    await supabase
      .from("table_customers")
      .update({ payment_status: "pago", payment_method: paymentMethodMap[customerId] ?? "dinheiro" } as any)
      .eq("id", customerId);
    refetch();
  }

  async function changeCustomerPayment(customerId: string, method: string) {
    const supabase = createClient();
    await supabase
      .from("table_customers")
      .update({ payment_method: method } as any)
      .eq("id", customerId);
    refetch();
  }

  async function closeTable(table: TableRestaurant) {
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: "concluido", concluded_at: new Date().toISOString() })
      .eq("table_id", table.id)
      .in("status", ["aguardando_aceite", "em_preparo", "pronto"]);
    await supabase.from("table_customers").delete().eq("table_id", table.id);
    await supabase.from("tables_restaurant").update({ status: "livre" }).eq("id", table.id);
    refetch();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Mesas</h1>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center">
          <p className="text-sm text-green-400">Mesas livres</p>
          <p className="mt-1 text-xl font-semibold text-green-400">{livres}</p>
        </div>
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
          <p className="text-sm text-red-400">Mesas ocupadas</p>
          <p className="mt-1 text-xl font-semibold text-red-400">{ocupadas}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Número da mesa"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="w-40 rounded-lg border border-border bg-card-hover px-3 py-2 text-sm text-foreground"
            />
            <button
              onClick={addTable}
              className="rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine-hover"
            >
              + Adicionar Mesa
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {tables.length === 0 && (
              <p className="col-span-full text-sm text-muted">Nenhuma mesa cadastrada.</p>
            )}
            {tables.map((table) => {
              const style = statusStyles[table.status] ?? statusStyles.livre;
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors ${style.card} ${selectedId === table.id ? "ring-2 ring-wine" : ""}`}
                >
                  <TableIcon className={`h-8 w-8 ${style.label}`} />
                  <span className={`text-base font-bold leading-none ${style.label}`}>{table.number}</span>
                  <span className={`text-[10px] leading-none ${style.label} opacity-80`}>
                    {table.table_customers?.length
                      ? `${table.table_customers.length} comanda${table.table_customers.length > 1 ? "s" : ""}`
                      : table.status === "livre" ? "Livre" : table.status === "ocupada" ? "Ocupada" : "Encerrada"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {!selectedTable && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
              Selecione uma mesa para ver as comandas.
            </div>
          )}

          {selectedTable && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Mesa {selectedTable.number}</p>

              <div className="mt-4 space-y-3">
                {(selectedTable.table_customers ?? []).length === 0 && (
                  <p className="text-sm text-muted">Nenhuma comanda aberta.</p>
                )}
                {(selectedTable.table_customers ?? []).map((customer) => (
                  <div key={customer.id} className="rounded-lg bg-card-hover p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{customer.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          customer.payment_status === "pago"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {customer.payment_status === "pago" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{formatCurrency(customer.subtotal ?? 0)}</p>
                    {addItemFor === customer.id && (
                      <div className="mt-2 space-y-2 rounded-lg border border-border bg-card p-2 text-sm">
                        <input
                          placeholder="Item (ex: Refrigerante)"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full rounded border border-border bg-card-hover px-2 py-1 text-xs text-foreground"
                        />
                        <div className="flex gap-1">
                          <input
                            type="number"
                            placeholder="Qtd"
                            min="1"
                            value={itemQty}
                            onChange={(e) => setItemQty(e.target.value)}
                            className="w-12 rounded border border-border bg-card-hover px-2 py-1 text-xs text-foreground"
                          />
                          <input
                            placeholder="Valor"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            className="flex-1 rounded border border-border bg-card-hover px-2 py-1 text-xs text-foreground"
                          />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setAddItemFor(null)} className="flex-1 rounded py-1 text-xs text-muted hover:bg-card-hover">Cancelar</button>
                          <button onClick={() => addItemToCustomer(customer.id, customer.subtotal ?? 0)} disabled={addingLoading} className="flex-1 rounded bg-wine py-1 text-xs font-medium text-white hover:bg-wine-hover disabled:opacity-50">
                            {addingLoading ? "..." : "OK"}
                          </button>
                        </div>
                      </div>
                    )}
                    {customer.payment_status === "pago" && customer.payment_method && (
                      <p className="mt-1 text-xs text-muted">{paymentOptions.find(o => o.value === customer.payment_method)?.label ?? customer.payment_method}</p>
                    )}
                    {customer.payment_status !== "pago" && addItemFor !== customer.id && (
                      <button
                        onClick={() => { setAddItemFor(customer.id); setItemName(""); setItemQty("1"); setItemPrice(""); }}
                        className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-1 text-xs text-muted hover:bg-card-hover"
                      >
                        + Adicionar Item
                      </button>
                    )}
                    {customer.payment_status !== "pago" && (
                      <div className="mt-2 flex gap-2">
                        <select
                          value={paymentMethodMap[customer.id] ?? "dinheiro"}
                          onChange={(e) => setPaymentMethodMap((m) => ({ ...m, [customer.id]: e.target.value }))}
                          className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground"
                        >
                          {paymentOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => markPaid(customer.id)}
                          className="rounded-lg bg-wine px-3 py-1.5 text-xs font-medium text-white hover:bg-wine-hover"
                        >
                          Pago
                        </button>
                      </div>
                    )}
                    {customer.payment_status === "pago" && (
                      <select
                        value={customer.payment_method ?? "dinheiro"}
                        onChange={(e) => changeCustomerPayment(customer.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-border bg-card-hover px-2 py-1 text-xs text-foreground"
                      >
                        {paymentOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-card-hover px-3 py-2 text-sm text-foreground"
                />
                <button
                  onClick={() => addComanda(selectedTable.id)}
                  className="rounded-lg bg-card-hover px-3 py-2 text-sm font-medium text-foreground hover:bg-border"
                >
                  + Comanda
                </button>
              </div>

              {(selectedTable.status === "ocupada" || (selectedTable.table_customers ?? []).length > 0) && (
                <button
                  onClick={() => closeTable(selectedTable)}
                  disabled={(selectedTable.table_customers ?? []).some(
                    (c) => c.payment_status !== "pago" && (c.subtotal ?? 0) > 0
                  )}
                  className="mt-4 w-full rounded-lg bg-card-hover px-4 py-2 text-sm font-medium text-foreground hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Fechar Mesa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
