"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DashboardIcon,
  KitchenIcon,
  DeliveryIcon,
  PickupIcon,
  TableIcon,
  MenuIcon,
  ReportsIcon,
  WaiterIcon,
  CheckCircleIcon,
  WhatsAppIcon,
} from "@/components/icons";

type BillingCycle = "mensal" | "anual";

const features = [
  { Icon: DashboardIcon, title: "Dashboard em tempo real", desc: "Visão geral de pedidos, faturamento e métricas do dia." },
  { Icon: KitchenIcon, title: "Painel da cozinha", desc: "Fluxo inteligente de preparo com priorização automática." },
  { Icon: DeliveryIcon, title: "Gestão de entregas", desc: "Controle de entregadores, rotas e status em tempo real." },
  { Icon: PickupIcon, title: "Retirada no balcão", desc: "Fila organizada com aviso ao cliente quando o pedido estiver pronto." },
  { Icon: TableIcon, title: "Mesas e comanda", desc: "Pedidos por mesa com QR code exclusivo por assento." },
  { Icon: MenuIcon, title: "Cardápio digital", desc: "Cardápio online com categorias, fotos, tamanhos e adicionais." },
  { Icon: WaiterIcon, title: "App do garçom", desc: "Garçons recebem pedidos e chamadas de mesa no celular." },
  { Icon: ReportsIcon, title: "Relatórios e fechamento", desc: "Fechamento de caixa, relatório de vendas e histórico completo." },
  { Icon: WhatsAppIcon, title: "Notificações WhatsApp", desc: "Cliente acompanha o pedido em tempo real pelo WhatsApp." },
  { Icon: CheckCircleIcon, title: "Atualizações incluídas", desc: "Todas as novas funcionalidades sem custo adicional." },
];

const faqs = [
  {
    q: "Preciso de equipamento especial?",
    a: "Não. O FoodNex funciona em qualquer dispositivo com navegador — tablet, celular ou computador. Para imprimir comandas você vai precisar de uma impressora térmica 80mm.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade. Você cancela a qualquer momento e não é cobrado no próximo ciclo.",
  },
  {
    q: "O período de teste é gratuito?",
    a: "Sim, 7 dias completamente grátis, sem precisar de cartão de crédito.",
  },
  {
    q: "Quantos funcionários posso cadastrar?",
    a: "Ilimitado. Cozinheiros, garçons e entregadores sem custo extra por usuário.",
  },
  {
    q: "Os valores podem mudar?",
    a: "Os valores podem ser reajustados conforme novas funcionalidades forem adicionadas, mas clientes ativos são avisados com 30 dias de antecedência.",
  },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function LandingPage() {
  const [billing, setBilling] = useState<BillingCycle>("anual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const monthly = 179.9;
  const annual = 97.9;
  const annualTotal = annual * 12;
  const annualSaving = monthly * 12 - annualTotal;

  const price = billing === "mensal" ? monthly : annual;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-wine">FoodNex</span>
          <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-xl bg-wine px-4 py-2 text-sm font-semibold text-white hover:bg-wine-hover transition-colors"
            >
              Testar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-wine/30 bg-wine/5 px-4 py-1.5 text-xs font-medium text-wine mb-8">
          7 dias grátis · sem cartão de crédito
        </div>
        <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          Gestão de pedidos para<br />
          <span className="text-wine">restaurantes modernos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Do cardápio digital à cozinha, das mesas ao delivery — tudo em um só lugar.
          Simplifique a operação do seu restaurante e foque no que importa: a comida.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/cadastro"
            className="flex items-center gap-2 rounded-2xl bg-wine px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-wine-hover transition-all"
          >
            Começar teste grátis
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <a
            href="#funcionalidades"
            className="rounded-2xl border border-border px-8 py-4 text-base font-semibold text-muted hover:text-foreground hover:border-muted transition-all"
          >
            Ver funcionalidades
          </a>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div className="border-y border-border bg-card py-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-foreground">+500</p>
              <p className="text-muted">pedidos processados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3 tipos</p>
              <p className="text-muted">entrega, retirada e mesa</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Tempo real</p>
              <p className="text-muted">atualização instantânea</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">7 dias</p>
              <p className="text-muted">teste gratuito</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Tudo que seu restaurante precisa
          </h2>
          <p className="mt-4 text-muted">Uma plataforma completa, do pedido à entrega.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 hover:border-wine/40 hover:bg-card-hover transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wine/10 mb-4">
                <Icon className="h-5 w-5 text-wine" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precos" className="border-t border-border bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Plano simples, sem surpresas</h2>
            <p className="mt-4 text-muted">Um único plano com tudo incluso. Sem limite de usuários ou pedidos.</p>
          </div>

          {/* billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex rounded-xl border border-border bg-background p-1 text-sm">
              <button
                onClick={() => setBilling("mensal")}
                className={`rounded-lg px-5 py-2 font-semibold transition-all ${billing === "mensal" ? "bg-wine text-white" : "text-muted hover:text-foreground"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling("anual")}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 font-semibold transition-all ${billing === "anual" ? "bg-wine text-white" : "text-muted hover:text-foreground"}`}
              >
                Anual
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${billing === "anual" ? "bg-white/20 text-white" : "bg-wine/10 text-wine"}`}>
                  -45%
                </span>
              </button>
            </div>
          </div>

          {/* price card */}
          <div className="mx-auto max-w-md">
            <div className="rounded-3xl border-2 border-wine bg-background p-8 shadow-xl shadow-wine/10">
              <p className="text-sm font-semibold uppercase tracking-wider text-wine">Plano completo</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-foreground">
                  R$ {price.toFixed(2).replace(".", ",")}
                </span>
                <span className="mb-2 text-muted">/mês</span>
              </div>
              {billing === "anual" && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted">Cobrado R$ {annualTotal.toFixed(2).replace(".", ",")} à vista</p>
                  <p className="text-sm font-semibold text-green-400">Você economiza R$ {annualSaving.toFixed(2).replace(".", ",")} por ano</p>
                </div>
              )}

              <ul className="mt-8 space-y-3">
                {[
                  "Pedidos ilimitados",
                  "Usuários ilimitados",
                  "Cardápio digital com QR code",
                  "Painel da cozinha em tempo real",
                  "Gestão de mesas, delivery e retirada",
                  "App do garçom",
                  "Relatórios e fechamento de caixa",
                  "Notificações WhatsApp",
                  "Suporte via chat",
                  "Atualizações incluídas",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-wine" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-wine py-4 text-base font-bold text-white hover:bg-wine-hover transition-all"
              >
                Começar 7 dias grátis
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-center text-xs text-muted">
                Sem cartão de crédito · Cancele quando quiser
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            Os valores podem ser reajustados conforme novas funcionalidades forem adicionadas.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-center text-3xl font-extrabold text-foreground mb-12">Perguntas frequentes</h2>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-foreground hover:bg-card-hover transition-colors"
              >
                {item.q}
                <ChevronDownIcon className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="border-t border-border bg-wine/5 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Pronto para modernizar<br />seu restaurante?
          </h2>
          <p className="mt-4 text-muted">
            Comece grátis por 7 dias. Sem burocracia, sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-wine px-10 py-4 text-base font-bold text-white shadow-lg hover:bg-wine-hover transition-all"
          >
            Criar minha conta grátis
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-2 text-center text-xs text-muted sm:flex-row sm:justify-between">
          <span className="font-semibold text-wine">FoodNex</span>
          <span>Gestão inteligente de pedidos para restaurantes</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-foreground transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
