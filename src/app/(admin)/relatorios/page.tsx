"use client";

import { useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types/domain";

interface CaixaSession {
  id: string;
  opened_at: string;
  closed_at: string | null;
  faturamento: number | null;
}

interface CompanyDetails {
  logo_url: string | null;
  fantasy_name: string | null;
  name: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function fmtDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const typeLabels: Record<string, string> = {
  entrega: "Entrega",
  retirada: "Retirada",
  mesa: "Mesa",
};

export default function RelatoriosPage() {
  const company = useCompany();
  const [startDate, setStartDate] = useState(firstDayOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fechamento de Caixa
  const [caixaDate, setCaixaDate] = useState(todayStr());
  const [caixaSessions, setCaixaSessions] = useState<CaixaSession[] | null>(null);
  const [caixaOrders, setCaixaOrders] = useState<Order[] | null>(null);
  const [caixaLoading, setCaixaLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);

  async function buscarFechamento() {
    setCaixaLoading(true);
    const supabase = createClient();
    const start = `${caixaDate}T00:00:00-03:00`;
    const end = `${caixaDate}T23:59:59-03:00`;

    const [{ data: sessionsData }, { data: ordersData }, { data: companyData }] = await Promise.all([
      (supabase as any)
        .from("caixa_sessions")
        .select("id, opened_at, closed_at, faturamento")
        .eq("company_id", company.id)
        .gte("opened_at", start)
        .lte("opened_at", end)
        .order("opened_at"),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("company_id", company.id)
        .neq("status", "cancelado")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at"),
      supabase
        .from("companies")
        .select("name, fantasy_name, logo_url")
        .eq("id", company.id)
        .single(),
    ]);

    setCaixaSessions((sessionsData as unknown as CaixaSession[]) ?? []);
    setCaixaOrders((ordersData as unknown as Order[]) ?? []);
    setCompanyDetails((companyData as CompanyDetails) ?? null);
    setCaixaLoading(false);
  }

  function gerarPDFFechamento() {
    if (!caixaOrders || !companyDetails) return;

    const displayName = companyDetails.fantasy_name ?? companyDetails.name;
    const totalFat = caixaOrders.reduce((s, o) => s + o.total, 0);
    const totalPedidos = caixaOrders.length;
    const ticketMed = totalPedidos > 0 ? totalFat / totalPedidos : 0;

    const byPaymentCaixa = caixaOrders.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
      const m = o.payment_method ?? "Não informado";
      if (!acc[m]) acc[m] = { count: 0, total: 0 };
      acc[m].count++; acc[m].total += o.total;
      return acc;
    }, {});

    const byTypeCaixa = caixaOrders.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
      if (!acc[o.type]) acc[o.type] = { count: 0, total: 0 };
      acc[o.type].count++; acc[o.type].total += o.total;
      return acc;
    }, {});

    const payLabels: Record<string, string> = {
      dinheiro: "Dinheiro", pix: "Pix",
      cartao_credito: "Cartão de Crédito", cartao_debito: "Cartão de Débito",
    };
    const typeLabelsLocal: Record<string, string> = { entrega: "Entrega", retirada: "Retirada", mesa: "Mesa" };

    const payRows = Object.entries(byPaymentCaixa)
      .map(([m, { count, total }]) =>
        `<tr><td>${payLabels[m] ?? m}</td><td>${count}</td><td>${formatCurrency(total)}</td></tr>`
      ).join("") || `<tr><td colspan="3">—</td></tr>`;

    const typeRows = Object.entries(byTypeCaixa)
      .map(([t, { count, total }]) =>
        `<tr><td>${typeLabelsLocal[t] ?? t}</td><td>${count}</td><td>${formatCurrency(total)}</td></tr>`
      ).join("") || `<tr><td colspan="3">—</td></tr>`;

    const sessaoInfo = caixaSessions && caixaSessions.length > 0
      ? `<tr><td>Abertura</td><td colspan="2">${new Date(caixaSessions[0].opened_at).toLocaleString("pt-BR")}</td></tr>
         <tr><td>Fechamento</td><td colspan="2">${caixaSessions[caixaSessions.length - 1].closed_at ? new Date(caixaSessions[caixaSessions.length - 1].closed_at!).toLocaleString("pt-BR") : "Em aberto"}</td></tr>`
      : `<tr><td colspan="3">Sem sessão de caixa</td></tr>`;

    const logoHtml = companyDetails.logo_url
      ? `<img src="${companyDetails.logo_url}" alt="logo" style="width:72px;height:72px;object-fit:cover;border-radius:12px;margin-bottom:8px;" />`
      : "";

    const win = window.open("", "_blank", "width=800,height=1000");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>Fechamento de Caixa — ${fmtDate(caixaDate)}</title>
<style>
  @page { size: A4 portrait; margin: 20mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
  .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #7f1d1d; padding-bottom: 16px; margin-bottom: 20px; }
  .header-text h1 { font-size: 20px; font-weight: 800; color: #7f1d1d; }
  .header-text p { font-size: 12px; color: #555; margin-top: 2px; }
  .doc-title { font-size: 13px; font-weight: 700; color: #111; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7f1d1d; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th { background: #f7f7f7; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; padding: 7px 10px; border: 1px solid #e5e5e5; }
  td { padding: 7px 10px; border: 1px solid #e5e5e5; color: #222; }
  tr:nth-child(even) td { background: #fafafa; }
  td:last-child, th:last-child { text-align: right; font-weight: 600; }
  td:nth-child(2), th:nth-child(2) { text-align: center; }
  .totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .total-box { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px 14px; }
  .total-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
  .total-box .value { font-size: 18px; font-weight: 800; color: #111; }
  .total-box.highlight .value { color: #7f1d1d; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e5e5; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #888; }
  @media print { .no-print { display: none; } }
</style></head><body>
<div class="header">
  ${logoHtml}
  <div class="header-text">
    <h1>${displayName}</h1>
    <p class="doc-title">Fechamento de Caixa</p>
    <p>${fmtDate(caixaDate)} · Gerado em ${new Date().toLocaleString("pt-BR")}</p>
  </div>
</div>

<div class="totals-grid">
  <div class="total-box highlight">
    <div class="label">Faturamento Total</div>
    <div class="value">${formatCurrency(totalFat)}</div>
  </div>
  <div class="total-box">
    <div class="label">Total de Pedidos</div>
    <div class="value">${totalPedidos}</div>
  </div>
  <div class="total-box">
    <div class="label">Ticket Médio</div>
    <div class="value">${formatCurrency(ticketMed)}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Sessão de Caixa</div>
  <table><tbody>${sessaoInfo}</tbody></table>
</div>

<div class="section">
  <div class="section-title">Formas de Pagamento</div>
  <table>
    <thead><tr><th>Forma</th><th>Qtd</th><th>Total</th></tr></thead>
    <tbody>${payRows}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Tipo de Pedido</div>
  <table>
    <thead><tr><th>Tipo</th><th>Qtd</th><th>Total</th></tr></thead>
    <tbody>${typeRows}</tbody>
  </table>
</div>

<div class="footer">
  <span>FoodNex — Sistema de Gestão</span>
  <span>${displayName} · ${fmtDate(caixaDate)}</span>
</div>

<div class="no-print" style="text-align:center;margin-top:24px;">
  <button onclick="window.print()" style="background:#7f1d1d;color:#fff;border:none;padding:10px 28px;font-size:14px;border-radius:8px;cursor:pointer;">🖨️ Imprimir / Salvar PDF</button>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`);
    win.document.close();
    win.focus();
  }

  async function buscar() {
    setLoading(true);
    const supabase = createClient();
    const start = `${startDate}T00:00:00-03:00`;
    const end = `${endDate}T23:59:59-03:00`;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("company_id", company.id)
      .neq("status", "cancelado")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false });
    setOrders((data as unknown as Order[]) ?? []);
    setLoading(false);
  }

  const totalFat = (orders ?? []).reduce((s, o) => s + o.total, 0);

  const byPayment = (orders ?? []).reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    const method = o.payment_method ?? "Não informado";
    if (!acc[method]) acc[method] = { count: 0, total: 0 };
    acc[method].count++;
    acc[method].total += o.total;
    return acc;
  }, {});

  const byDay = (orders ?? []).reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    const day = o.created_at.slice(0, 10);
    if (!acc[day]) acc[day] = { count: 0, total: 0 };
    acc[day].count++;
    acc[day].total += o.total;
    return acc;
  }, {});

  const byType = (orders ?? []).reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    if (!acc[o.type]) acc[o.type] = { count: 0, total: 0 };
    acc[o.type].count++;
    acc[o.type].total += o.total;
    return acc;
  }, {});

  const ticketMedio = orders && orders.length > 0 ? totalFat / orders.length : 0;

  const paymentLabels: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "Pix",
    cartao_credito: "Cartão de Crédito",
    cartao_debito: "Cartão de Débito",
  };

  function printRelatorio() {
    const periodoStr = `${fmtDate(startDate)} a ${fmtDate(endDate)}`;

    const paymentRows = Object.entries(byPayment)
      .map(([m, { count, total }]) =>
        `<tr><td>${paymentLabels[m] ?? m}</td><td class="c">${count}</td><td class="r">${formatCurrency(total)}</td></tr>`
      ).join("") || `<tr><td colspan="3" class="c">Nenhum dado</td></tr>`;

    const typeRows = Object.entries(byType)
      .map(([t, { count, total }]) =>
        `<tr><td>${typeLabels[t] ?? t}</td><td class="c">${count}</td><td class="r">${formatCurrency(total)}</td></tr>`
      ).join("") || `<tr><td colspan="3" class="c">Nenhum dado</td></tr>`;

    const dayRows = Object.entries(byDay)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, { count, total }]) =>
        `<tr><td>${fmtDate(day)}</td><td class="c">${count}</td><td class="r">${formatCurrency(total)}</td></tr>`
      ).join("") || `<tr><td colspan="3" class="c">Nenhum dado</td></tr>`;

    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(`
      <html><head><title>Relatório ${periodoStr}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm 6mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; font-size: 13px; width: 80mm; color: #000; }
        h1 { font-size: 15px; text-align: center; margin-bottom: 2px; }
        .sub { font-size: 11px; text-align: center; color: #333; margin-bottom: 6px; }
        hr { border: none; border-top: 1px dashed #666; margin: 6px 0; }
        h2 { font-size: 12px; font-weight: bold; margin: 4px 0 3px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        td { padding: 1.5px 0; }
        td.c { text-align: center; }
        td.r { text-align: right; font-weight: bold; }
        .total-row { font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; margin: 4px 0; }
        .footer { text-align: center; font-size: 10px; color: #555; margin-top: 8px; }
        @media print { button { display: none; } body { width: 80mm; } }
      </style></head><body>
      <h1>RELATÓRIO</h1>
      <p class="sub">${periodoStr}</p>
      <hr/>
      <div class="total-row"><span>Total Faturado</span><span>${formatCurrency(totalFat)}</span></div>
      <div class="total-row" style="font-size:12px;font-weight:normal;"><span>Pedidos</span><span>${(orders ?? []).length}</span></div>
      <div class="total-row" style="font-size:12px;font-weight:normal;"><span>Ticket Médio</span><span>${formatCurrency(ticketMedio)}</span></div>
      <hr/>
      <h2>Por Forma de Pagamento</h2>
      <table>${paymentRows}</table>
      <hr/>
      <h2>Por Tipo de Pedido</h2>
      <table>${typeRows}</table>
      <hr/>
      <h2>Por Dia</h2>
      <table>${dayRows}</table>
      <hr/>
      <p class="footer">FoodNex · ${new Date().toLocaleDateString("pt-BR")}</p>
      <br/><br/>
      <div style="text-align:center;">
        <button onclick="window.print()" style="padding:8px 24px;font-size:13px;cursor:pointer;">🖨️ Imprimir</button>
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    win.document.close();
    win.focus();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
      <p className="mt-1 text-sm text-muted">Faturamento e pedidos por período</p>

      {/* filtro */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card px-4 py-4">
        <label className="block text-sm">
          <span className="text-muted">De</span>
          <input
            type="date"
            max={endDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block rounded-lg border border-border bg-card-hover px-3 py-1.5 text-sm text-foreground"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Até</span>
          <input
            type="date"
            max={todayStr()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block rounded-lg border border-border bg-card-hover px-3 py-1.5 text-sm text-foreground"
          />
        </label>
        <button
          onClick={buscar}
          disabled={loading || !startDate || !endDate}
          className="rounded-lg bg-wine px-5 py-2 text-sm font-medium text-white hover:bg-wine-hover disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Gerar Relatório"}
        </button>

        {/* atalhos rápidos */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Hoje", fn: () => { setStartDate(todayStr()); setEndDate(todayStr()); } },
            { label: "Este mês", fn: () => { setStartDate(firstDayOfMonth()); setEndDate(todayStr()); } },
            {
              label: "Últimos 7 dias",
              fn: () => {
                const d = new Date();
                d.setDate(d.getDate() - 6);
                setStartDate(d.toISOString().slice(0, 10));
                setEndDate(todayStr());
              },
            },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="rounded-lg border border-border bg-card-hover px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {orders !== null && (
        <>
          {/* botão imprimir */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={printRelatorio}
              className="rounded-lg border border-border bg-card-hover px-4 py-2 text-sm text-foreground hover:bg-card"
            >
              Imprimir Relatório
            </button>
          </div>

          {/* totais */}
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted">Total Faturado</p>
              <p className="mt-1 text-2xl font-bold text-wine">{formatCurrency(totalFat)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted">Pedidos</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{orders.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted">Ticket Médio</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(ticketMedio)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted">Período</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{fmtDate(startDate)} — {fmtDate(endDate)}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* por forma de pagamento */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Por Forma de Pagamento</h2>
              <div className="mt-3 space-y-2">
                {Object.entries(byPayment).map(([method, { count, total }]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-muted capitalize">{method}</span>
                    <div className="flex gap-4">
                      <span className="text-muted">{count} pedido(s)</span>
                      <span className="font-medium text-foreground w-24 text-right">{formatCurrency(total)}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(byPayment).length === 0 && <p className="text-sm text-muted">Nenhum pedido.</p>}
              </div>
            </div>

            {/* por tipo */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Por Tipo de Pedido</h2>
              <div className="mt-3 space-y-2">
                {Object.entries(byType).map(([type, { count, total }]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{typeLabels[type] ?? type}</span>
                    <div className="flex gap-4">
                      <span className="text-muted">{count} pedido(s)</span>
                      <span className="font-medium text-foreground w-24 text-right">{formatCurrency(total)}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(byType).length === 0 && <p className="text-sm text-muted">Nenhum pedido.</p>}
              </div>
            </div>

            {/* por dia */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">Por Dia</h2>
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                {Object.entries(byDay)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([day, { count, total }]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{fmtDate(day)}</span>
                      <div className="flex gap-4">
                        <span className="text-muted">{count} pedido(s)</span>
                        <span className="font-medium text-foreground w-24 text-right">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  ))}
                {Object.keys(byDay).length === 0 && <p className="text-sm text-muted">Nenhum pedido.</p>}
              </div>
            </div>
          </div>

          {/* lista detalhada — oculta na impressão */}
          {orders.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4 print:hidden">
              <h2 className="text-sm font-semibold text-foreground">Pedidos do Período</h2>
              <div className="mt-3 divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <span className="font-medium text-foreground">#{order.order_code}</span>
                      <span className="ml-2 text-muted">{order.customer_name}</span>
                      <span className="ml-2 text-xs text-muted">
                        {fmtDate(order.created_at.slice(0, 10))} {fmtTime(order.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{typeLabels[order.type] ?? order.type}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Fechamento de Caixa */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Fechamento de Caixa</h2>
        <p className="mt-1 text-sm text-muted">Gere o relatório de fechamento do dia com PDF profissional</p>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card px-4 py-4">
          <label className="block text-sm">
            <span className="text-muted">Data</span>
            <input
              type="date"
              max={todayStr()}
              value={caixaDate}
              onChange={(e) => setCaixaDate(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-card-hover px-3 py-1.5 text-sm text-foreground"
            />
          </label>
          <button
            onClick={buscarFechamento}
            disabled={caixaLoading || !caixaDate}
            className="rounded-lg bg-wine px-5 py-2 text-sm font-medium text-white hover:bg-wine-hover disabled:opacity-50"
          >
            {caixaLoading ? "Buscando..." : "Gerar Fechamento"}
          </button>
        </div>

        {caixaOrders !== null && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted">Faturamento</p>
                <p className="mt-1 text-2xl font-bold text-wine">{formatCurrency(caixaOrders.reduce((s, o) => s + o.total, 0))}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted">Pedidos</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{caixaOrders.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted">Ticket Médio</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(caixaOrders.length > 0 ? caixaOrders.reduce((s, o) => s + o.total, 0) / caixaOrders.length : 0)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted">Sessões de Caixa</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{caixaSessions?.length ?? 0}</p>
              </div>
            </div>

            <button
              onClick={gerarPDFFechamento}
              className="mt-4 flex items-center gap-2 rounded-xl bg-wine px-5 py-3 text-sm font-semibold text-white hover:bg-wine-hover"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Gerar PDF de Fechamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
