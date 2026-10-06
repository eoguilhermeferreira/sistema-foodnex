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

const paymentOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
];

function TableIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" fill="none" className={className} aria-hidden>
      <rect x="6" y="13" width="28" height="10" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="10" y="23" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="27" y="23" width="3" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="14" y="4" width="12" height="5" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="14" y="4" width="12" height="10" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="15" y="8" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="23" y="8" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

interface ComandaModalProps {
  customer: { id: string; name: string; subtotal: number | null; payment_status?: string | null; payment_method?: string | null };
  tableNumber: number;
  onClose: () => void;
  onRefetch: () => void;
}

function ComandaModal({ customer, tableNumber, onClose, onRefetch }: ComandaModalProps) {
  const [paymentMethod, setPaymentMethod] = useState(customer.payment_method ?? "dinheiro");
  const [cashReceived, setCashReceived] = useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [paidSoFar, setPaidSoFar] = useState(0);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "pay">(customer.payment_status === "pago" ? "view" : "view");

  const total = customer.subtotal ?? 0;
  const remaining = total - paidSoFar;
  const cashReceivedNum = parseFloat(cashReceived.replace(",", ".")) || 0;
  const troco = paymentMethod === "dinheiro" ? Math.max(0, cashReceivedNum - remaining) : 0;
  const partialNum = parseFloat(partialAmount.replace(",", ".")) || 0;

  async function payFull() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("table_customers")
      .update({ payment_status: "pago", payment_method: paymentMethod } as any)
      .eq("id", customer.id);
    setSaving(false);
    onRefetch();
    onClose();
  }

  async function payPartial() {
    if (!partialNum || partialNum <= 0 || partialNum > remaining) return;
    setSaving(true);
    setPaidSoFar((p) => p + partialNum);
    setPartialAmount("");
    setSaving(false);
  }

  async function finishPartial() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("table_customers")
      .update({ payment_status: "pago", payment_method: paymentMethod } as any)
      .eq("id", customer.id);
    setSaving(false);
    onRefetch();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md rounded-t-2xl bg-card p-5 shadow-2xl"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-foreground">{customer.name}</p>
            <p className="text-xs text-muted">Mesa {tableNumber}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-card-hover">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* consumo */}
        <div className="mb-4 rounded-xl border border-border bg-card-hover p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Consumo total</span>
            <span className="font-bold text-foreground">{formatCurrency(total)}</span>
          </div>
          {paidSoFar > 0 && (
            <>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted">Já pago</span>
                <span className="font-medium text-green-400">{formatCurrency(paidSoFar)}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted">Restante</span>
                <span className="font-bold text-red-400">{formatCurrency(remaining)}</span>
              </div>
            </>
          )}
          {customer.payment_status === "pago" && (
            <div className="mt-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-center text-sm font-semibold text-green-400">
              ✓ Pago — {paymentOptions.find((o) => o.value === (customer.payment_method ?? "dinheiro"))?.label}
            </div>
          )}
        </div>

        {customer.payment_status !== "pago" && (
          <>
            {/* payment method */}
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-muted">Forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setPaymentMethod(o.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      paymentMethod === o.value
                        ? "border-wine bg-wine/10 text-wine"
                        : "border-border bg-card text-muted hover:bg-card-hover"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* cash change */}
            {paymentMethod === "dinheiro" && (
              <div className="mb-3 rounded-xl border border-border bg-card-hover p-3">
                <p className="mb-1 text-xs font-medium text-muted">Valor recebido</p>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                />
                {cashReceivedNum > 0 && (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted">Troco</span>
                    <span className={`font-bold ${troco >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(troco)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* partial payment */}
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-muted">Pagamento parcial (opcional)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor parcial"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-card-hover px-3 py-2 text-sm text-foreground"
                />
                <button
                  onClick={payPartial}
                  disabled={!partialNum || partialNum <= 0 || partialNum > remaining}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-card-hover disabled:opacity-40"
                >
                  Registrar
                </button>
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-2">
              {paidSoFar > 0 && paidSoFar < total && (
                <button
                  onClick={finishPartial}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Quitar restante
                </button>
              )}
              <button
                onClick={payFull}
                disabled={saving}
                className="flex-1 rounded-xl bg-wine py-3 text-sm font-semibold text-white hover:bg-wine-hover disabled:opacity-50"
              >
                {saving ? "Salvando..." : paidSoFar > 0 ? `Pagar ${formatCurrency(remaining)}` : "Marcar como Pago"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MesasPage() {
  const company = useCompany();
  const { tables, refetch } = useRealtimeTables(company.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ComandaModalProps["customer"] | null>(null);

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
              const customers = table.table_customers ?? [];
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors ${style.card} ${selectedId === table.id ? "ring-2 ring-wine" : ""}`}
                >
                  <TableIcon className={`h-8 w-8 ${style.label}`} />
                  <span className={`text-base font-bold leading-none ${style.label}`}>{table.number}</span>
                  <span className={`text-[10px] leading-none ${style.label} opacity-80`}>
                    {customers.length
                      ? `${customers.length} comanda${customers.length > 1 ? "s" : ""}`
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

              <div className="mt-3 space-y-2">
                {(selectedTable.table_customers ?? []).length === 0 && (
                  <p className="text-sm text-muted">Nenhuma comanda aberta.</p>
                )}
                {(selectedTable.table_customers ?? []).map((customer) => {
                  const isPago = customer.payment_status === "pago";
                  return (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors hover:opacity-90 active:scale-[0.98] ${
                        isPago
                          ? "border-green-500/40 bg-green-500/10"
                          : "border-red-500/40 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isPago ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {isPago ? "Pago" : "Pendente"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{formatCurrency(customer.subtotal ?? 0)}</p>
                      {isPago && customer.payment_method && (
                        <p className="mt-0.5 text-xs text-muted">
                          {paymentOptions.find((o) => o.value === customer.payment_method)?.label ?? customer.payment_method}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComanda(selectedTable.id)}
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

      {selectedCustomer && selectedTable && (
        <ComandaModal
          customer={selectedCustomer}
          tableNumber={selectedTable.number}
          onClose={() => setSelectedCustomer(null)}
          onRefetch={() => {
            refetch();
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
