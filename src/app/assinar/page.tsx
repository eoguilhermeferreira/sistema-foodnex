"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  "Cardápio digital com QR Code",
  "Gestão de pedidos em tempo real",
  "Cozinha (aceitar, preparar, concluir)",
  "Mesas e comandas com pagamento",
  "Delivery, retirada e atendimento na mesa",
  "WhatsApp automático para o cliente",
  "Caixa com abertura e fechamento",
  "Fechamento do dia com PDF (80mm)",
  "Relatórios de faturamento por período",
  "Múltiplas formas de pagamento",
  "QR Code por mesa imprimível",
  "Atualizações incluídas",
];

type BillingCycle = "mensal" | "anual";

export default function AssinarPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>("anual");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    // TODO: integrate Sync Pay — redirect to checkout
    // For now just show alert
    alert("Em breve: integração com Sync Pay para pagamento via Pix ou cartão.");
    setLoading(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const priceMonthly = cycle === "mensal" ? 179.90 : 97.90;
  const priceBilled = cycle === "anual" ? 1174.80 : null;
  const savings = cycle === "anual" ? 984.00 : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400 mb-4">
          ⏰ Período de teste encerrado
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Escolha seu plano para continuar
        </h1>
        <p className="mt-2 text-muted text-sm max-w-md mx-auto">
          Seu período gratuito de 7 dias chegou ao fim. Assine agora e mantenha seu negócio funcionando sem interrupções.
        </p>
      </div>

      {/* Toggle mensal/anual */}
      <div className="flex items-center gap-1 rounded-full bg-card-hover border border-border p-1 mb-8">
        <button
          onClick={() => setCycle("mensal")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            cycle === "mensal" ? "bg-wine text-white" : "text-muted hover:text-foreground"
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setCycle("anual")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            cycle === "anual" ? "bg-wine text-white" : "text-muted hover:text-foreground"
          }`}
        >
          Anual
          <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 font-semibold">
            -45%
          </span>
        </button>
      </div>

      {/* Card do plano */}
      <div className="w-full max-w-md rounded-2xl border border-wine/40 bg-card shadow-xl overflow-hidden">
        {/* Top banner */}
        <div className="bg-wine px-6 py-3 text-center">
          <p className="text-white text-sm font-semibold tracking-wide uppercase">
            {cycle === "anual" ? "Melhor custo-benefício" : "Plano Mensal"}
          </p>
        </div>

        <div className="px-6 py-6">
          {/* Preço */}
          <div className="mb-6 text-center">
            <div className="flex items-end justify-center gap-1">
              <span className="text-muted text-sm mb-1">R$</span>
              <span className="text-5xl font-black text-foreground">
                {priceMonthly.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-muted text-sm mb-1">/mês</span>
            </div>
            {cycle === "anual" && (
              <div className="mt-2 space-y-0.5">
                <p className="text-sm text-muted">
                  Cobrado <span className="text-foreground font-semibold">R$ 1.174,80</span> à vista
                </p>
                <p className="text-sm font-semibold text-green-400">
                  Você economiza R$ 984,00 por ano
                </p>
              </div>
            )}
            {cycle === "mensal" && (
              <p className="mt-1 text-xs text-muted">Cobrado mensalmente · Cancele quando quiser</p>
            )}
          </div>

          {/* Formas de pagamento */}
          <div className="mb-6 flex gap-2">
            <div className="flex-1 rounded-xl border border-border bg-card-hover px-3 py-2.5 text-center">
              <p className="text-xs font-semibold text-foreground">Pix</p>
              <p className="text-xs text-muted mt-0.5">Confirmação automática</p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-card-hover px-3 py-2.5 text-center">
              <p className="text-xs font-semibold text-foreground">Cartão de crédito</p>
              <p className="text-xs text-muted mt-0.5">Recorrência automática</p>
            </div>
          </div>

          {/* Features */}
          <ul className="mb-6 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-green-400">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* Aviso de reajuste */}
          <p className="mb-4 text-center text-xs text-muted">
            Os valores podem ser reajustados conforme novas funcionalidades forem adicionadas.
          </p>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-xl bg-wine py-3.5 text-sm font-bold text-white hover:bg-wine-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Aguarde..." : `Assinar plano ${cycle} — R$ ${priceMonthly.toFixed(2).replace(".", ",")}/mês`}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 text-xs text-muted hover:text-foreground transition-colors"
      >
        Sair da conta
      </button>
    </div>
  );
}
