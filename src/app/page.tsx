"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Animated counter ── */
function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = to / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ── Section wrapper with reveal ── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════ MOCKUPS ═══════════════════════ */

function DashboardMockup() {
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", fontSize: "10px", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      {/* top bar */}
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Dashboard · FoodNex</span>
      </div>
      <div style={{ padding: 12 }}>
        {/* stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { val: "R$3.240", lbl: "Faturamento hoje", delta: "+12%", color: "#22c55e" },
            { val: "47", lbl: "Pedidos hoje", delta: "+8 vs ontem", color: "#3b82f6" },
            { val: "R$68,90", lbl: "Ticket médio", delta: "+R$4,20", color: "#a855f7" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#1a1a2a", borderRadius: 10, padding: "10px 10px 8px", border: "1px solid #2a2a3a" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f5f5f5" }}>{s.val}</div>
              <div style={{ fontSize: 8.5, color: "#888", marginTop: 2 }}>{s.lbl}</div>
              <div style={{ fontSize: 8, color: s.color, marginTop: 4, fontWeight: 600 }}>↑ {s.delta}</div>
            </div>
          ))}
        </div>
        {/* bar chart */}
        <div style={{ background: "#1a1a2a", borderRadius: 10, padding: 10, marginBottom: 10, border: "1px solid #2a2a3a" }}>
          <div style={{ fontSize: 8.5, fontWeight: 600, color: "#aaa", marginBottom: 8 }}>Pedidos por hora</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
            {[20,15,30,45,55,70,90,80,65,50,38,25].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 6 ? "#c94070" : "rgba(201,64,112,.35)", borderRadius: 3, height: `${h}%`, transition: "height .3s" }} />
            ))}
          </div>
        </div>
        {/* order rows */}
        {[
          { num: "#0041", name: "Mesa 3 — 2x Pizza, 1x Suco", status: "Em preparo", sc: "#3b82f6" },
          { num: "#0040", name: "Delivery — Rua das Flores, 120", status: "Saiu entrega", sc: "#a855f7" },
          { num: "#0039", name: "Retirada — João Silva", status: "Pronto", sc: "#22c55e" },
          { num: "#0038", name: "Mesa 7 — 1x Hambúrguer, 2x Refri", status: "Aguardando", sc: "#f59e0b" },
        ].map((o) => (
          <div key={o.num} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #1e1e2e" }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: "#c94070", minWidth: 32 }}>{o.num}</span>
            <span style={{ fontSize: 8.5, color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: o.sc, background: o.sc + "22", borderRadius: 99, padding: "2px 6px", whiteSpace: "nowrap" }}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CozinhaMockup() {
  const cols = [
    { label: "Aguardando", color: "#f59e0b", count: 2, orders: [
      { id: "#0042", name: "Mesa 5", items: "1x Pizza 4 Queijos, 2x Suco" },
      { id: "#0043", name: "Delivery — Carlos", items: "1x X-Burguer Duplo" },
    ]},
    { label: "Em preparo", color: "#3b82f6", count: 2, orders: [
      { id: "#0041", name: "Mesa 3", items: "2x Pizza Margherita · 1x Suco" },
      { id: "#0040", name: "Retirada — João", items: "1x Combo Frango" },
    ]},
    { label: "Prontos", color: "#22c55e", count: 1, orders: [
      { id: "#0039", name: "Delivery — Ana", items: "2x Caldo de Cana, 1x Batata" },
    ]},
  ];
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Cozinha · FoodNex</span>
        <span style={{ marginLeft: "auto", fontSize: 8, color: "#c94070", fontWeight: 700 }}>● 5 pedidos ativos</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 12, fontSize: 10 }}>
        {cols.map((col) => (
          <div key={col.label}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
              <span style={{ fontWeight: 700, color: col.color, fontSize: 9 }}>{col.label}</span>
              <span style={{ marginLeft: "auto", background: col.color + "22", color: col.color, borderRadius: 99, padding: "1px 6px", fontSize: 8, fontWeight: 700 }}>{col.count}</span>
            </div>
            {col.orders.map((o) => (
              <div key={o.id} style={{ background: "#1a1a2a", borderRadius: 8, padding: 8, marginBottom: 6, border: `1px solid ${col.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#c94070", fontSize: 9 }}>{o.id}</span>
                  <span style={{ fontSize: 8, color: col.color }}>● {col.label === "Aguardando" ? "novo" : col.label === "Em preparo" ? "cozinhando" : "pronto"}</span>
                </div>
                <div style={{ fontSize: 9, color: "#e5e5e5", fontWeight: 600, marginBottom: 3 }}>{o.name}</div>
                <div style={{ fontSize: 8, color: "#888" }}>{o.items}</div>
                <button style={{ marginTop: 6, width: "100%", background: col.color + "22", border: `1px solid ${col.color}44`, borderRadius: 6, padding: "3px 0", fontSize: 8, fontWeight: 700, color: col.color, cursor: "pointer" }}>
                  {col.label === "Aguardando" ? "Aceitar" : col.label === "Em preparo" ? "Marcar Pronto" : "Concluir"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MesasMockup() {
  const tables = [
    { n: 1, status: "livre", value: null },
    { n: 2, status: "ocupada", value: "R$124,00" },
    { n: 3, status: "ocupada", value: "R$87,50" },
    { n: 4, status: "livre", value: null },
    { n: 5, status: "encerrada", value: "R$210,00" },
    { n: 6, status: "ocupada", value: "R$43,00" },
    { n: 7, status: "livre", value: null },
    { n: 8, status: "ocupada", value: "R$156,90" },
  ];
  const styles: Record<string, { border: string; bg: string; badge: string; lbl: string }> = {
    livre:     { border: "#22c55e55", bg: "#22c55e0d", badge: "#22c55e22", lbl: "#22c55e" },
    ocupada:   { border: "#ef444455", bg: "#ef44440d", badge: "#ef444422", lbl: "#ef4444" },
    encerrada: { border: "#f59e0b55", bg: "#f59e0b0d", badge: "#f59e0b22", lbl: "#f59e0b" },
  };
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Mesas · FoodNex</span>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 8 }}>
          {[
            { label: "Livres", val: 3, c: "#22c55e" },
            { label: "Ocupadas", val: 4, c: "#ef4444" },
            { label: "Encerrando", val: 1, c: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.c + "11", border: `1px solid ${s.c}33`, borderRadius: 8, padding: "6px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.c }}>{s.val}</div>
              <div style={{ color: "#888", fontSize: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {tables.map((t) => {
            const s = styles[t.status];
            return (
              <div key={t.n} style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: 8, padding: 7, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#f5f5f5" }}>Mesa {t.n}</div>
                <div style={{ fontSize: 7.5, fontWeight: 600, color: s.lbl, marginTop: 3, background: s.badge, borderRadius: 99, padding: "1px 5px", display: "inline-block", textTransform: "capitalize" }}>{t.status}</div>
                {t.value && <div style={{ fontSize: 9, fontWeight: 700, color: "#ccc", marginTop: 4 }}>{t.value}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GarcomMockup() {
  const calls = [
    { id: "1", table: 3, name: "Fernanda Lima", status: "pendente", time: "14:23" },
    { id: "2", table: 7, name: "Ricardo Alves", status: "atendendo", time: "14:18" },
    { id: "3", table: 2, name: "Julia Santos", status: "pendente", time: "14:30" },
  ];
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Garçom · FoodNex</span>
        <span style={{ marginLeft: "auto", fontSize: 8, background: "#ef444422", color: "#ef4444", borderRadius: 99, padding: "2px 7px", fontWeight: 700 }}>🔔 2 pendentes</span>
      </div>
      <div style={{ padding: 12, fontSize: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ background: "#ef444411", border: "1px solid #ef444444", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#ef4444" }}>2</div>
            <div style={{ fontSize: 8, color: "#ef4444aa" }}>Aguardando</div>
          </div>
          <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b44", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>1</div>
            <div style={{ fontSize: 8, color: "#f59e0baa" }}>Em atendimento</div>
          </div>
        </div>
        {calls.map((c) => (
          <div key={c.id} style={{ background: "#1a1a2a", borderRadius: 10, padding: "8px 10px", marginBottom: 6, border: `1px solid ${c.status === "pendente" ? "#ef444433" : "#f59e0b33"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#c940700d", border: "1px solid #c9407044", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#c94070", flexShrink: 0 }}>
                {c.table}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{c.name}</div>
                <div style={{ fontSize: 8, color: "#888" }}>Mesa {c.table} · {c.time}</div>
              </div>
              <button style={{ background: c.status === "pendente" ? "#c9407022" : "#f59e0b22", border: `1px solid ${c.status === "pendente" ? "#c9407055" : "#f59e0b55"}`, borderRadius: 6, padding: "3px 7px", fontSize: 7.5, fontWeight: 700, color: c.status === "pendente" ? "#c94070" : "#f59e0b", cursor: "pointer", whiteSpace: "nowrap" }}>
                {c.status === "pendente" ? "Atender" : "Concluir"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardapioMockup() {
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Cardápio · FoodNex</span>
      </div>
      <div style={{ padding: 12, fontSize: 10 }}>
        {/* link bar */}
        <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "6px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 7.5, color: "#888", marginBottom: 2 }}>Link do cardápio para clientes</div>
            <div style={{ fontSize: 8.5, color: "#c94070", fontFamily: "monospace" }}>foodnex.app/cardapio/seu-restaurante</div>
          </div>
          <button style={{ background: "#c94070", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Copiar</button>
        </div>
        {/* tabs */}
        <div style={{ display: "flex", gap: 4, background: "#1a1a2a", borderRadius: 8, padding: 3, marginBottom: 10 }}>
          {["Categorias", "Adicionais", "Produtos", "Disponibilidade"].map((t, i) => (
            <div key={t} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 6, fontSize: 7.5, fontWeight: 600, background: i === 0 ? "#13131a" : "transparent", color: i === 0 ? "#f5f5f5" : "#888" }}>{t}</div>
          ))}
        </div>
        {/* category cards */}
        {[
          { name: "Pizzas", items: 8, icon: "🍕" },
          { name: "Hambúrgueres", items: 5, icon: "🍔" },
          { name: "Bebidas", items: 12, icon: "🥤" },
        ].map((cat) => (
          <div key={cat.name} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{cat.name}</div>
              <div style={{ fontSize: 7.5, color: "#888" }}>{cat.items} produtos</div>
            </div>
            <button style={{ background: "#2a2a3a", border: "1px solid #3a3a4a", borderRadius: 5, padding: "2px 7px", fontSize: 7.5, color: "#aaa", cursor: "pointer" }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntregasMockup() {
  const orders = [
    { id: "#0041", name: "Carlos Mendes", addr: "Rua das Flores, 120", total: "R$68,00", status: "pronto" },
    { id: "#0042", name: "Fernanda Cruz", addr: "Av. Brasil, 456 — Ap 3", total: "R$45,50", status: "saiu_entrega" },
    { id: "#0040", name: "Ricardo Lima", addr: "Rua XV de Novembro, 88", total: "R$92,00", status: "pronto" },
  ];
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>Entregas · FoodNex</span>
      </div>
      <div style={{ padding: 12, fontSize: 10 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Prontos", val: 2, c: "#22c55e", active: true },
            { label: "Em rota", val: 1, c: "#3b82f6", active: false },
            { label: "Concluídos", val: 8, c: "#888", active: false },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.active ? s.c + "22" : "#1a1a2a", border: `1px solid ${s.active ? s.c + "55" : "#2a2a3a"}`, borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.active ? s.c : "#666" }}>{s.val}</div>
              <div style={{ fontSize: 7.5, color: s.active ? s.c + "cc" : "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {orders.map((o) => (
          <div key={o.id} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "8px 10px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: "#c94070" }}>{o.id}</span>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: "#e5e5e5" }}>{o.name}</span>
                  <span style={{ fontSize: 7.5, fontWeight: 700, marginLeft: "auto", color: o.status === "pronto" ? "#22c55e" : "#3b82f6", background: o.status === "pronto" ? "#22c55e22" : "#3b82f622", borderRadius: 99, padding: "1px 5px" }}>
                    {o.status === "pronto" ? "Pronto" : "Em rota"}
                  </span>
                </div>
                <div style={{ fontSize: 8, color: "#888" }}>📍 {o.addr}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{o.total}</span>
              <button style={{ background: o.status === "pronto" ? "#c9407022" : "#3b82f622", border: `1px solid ${o.status === "pronto" ? "#c9407055" : "#3b82f655"}`, borderRadius: 6, padding: "3px 8px", fontSize: 7.5, fontWeight: 700, color: o.status === "pronto" ? "#c94070" : "#3b82f6", cursor: "pointer" }}>
                {o.status === "pronto" ? "Despachar →" : "Finalizar ✓"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ FEATURE SECTION ═══════════════════════ */
function FeatureSection({
  id, label, icon, title, desc, mockup, reverse = false,
}: {
  id: string; label: string; icon: string; title: string; desc: string;
  mockup: React.ReactNode; reverse?: boolean;
}) {
  const { ref, visible } = useReveal();
  return (
    <section id={id} style={{ padding: "80px 0", borderTop: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24 }}>
        <div ref={ref} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(50px)",
          transition: "opacity .8s ease, transform .8s ease",
        }}
          className="feature-grid"
        >
          <div style={{ order: reverse ? 2 : 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid rgba(201,64,112,.3)", background: "rgba(201,64,112,.08)", padding: "5px 14px", fontSize: ".75rem", fontWeight: 700, color: "#c94070", marginBottom: 20 }}>
              <span>{icon}</span> {label}
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>{title}</h2>
            <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.7 }}>{desc}</p>
          </div>
          <div style={{ order: reverse ? 1 : 2 }}>{mockup}</div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ PRICING ═══════════════════════ */
function Pricing() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: "Básico", price: annual ? 89 : 99, desc: "Para começar", features: ["1 ponto de venda", "Até 300 pedidos/mês", "Dashboard básico", "Cardápio digital", "Suporte por e-mail"], cta: "Começar grátis" },
    { name: "Profissional", price: annual ? 179 : 199, desc: "Mais popular", features: ["3 pontos de venda", "Pedidos ilimitados", "Cozinha + Entregas", "Mesas + Garçom", "Relatórios avançados", "Suporte prioritário"], cta: "Começar grátis", highlight: true },
    { name: "Enterprise", price: annual ? 359 : 399, desc: "Para redes", features: ["Pontos de venda ilimitados", "Multi-loja", "API personalizada", "Gestor de conta dedicado", "SLA 99.9%"], cta: "Falar com vendas" },
  ];
  return (
    <section id="precos" style={{ padding: "100px 0", borderTop: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{ maxWidth: 1100, marginInline: "auto", paddingInline: 24 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, marginBottom: 12 }}>Planos simples e transparentes</h2>
            <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: "1.05rem" }}>Sem surpresas. Cancele quando quiser.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#1a1a1d", borderRadius: 99, padding: "6px 6px 6px 16px", border: "1px solid #2a2a2e" }}>
              <span style={{ fontSize: ".85rem", color: annual ? "#666" : "#f5f5f5", fontWeight: 600 }}>Mensal</span>
              <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, borderRadius: 99, background: annual ? "#c94070" : "#2a2a2e", border: "none", cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: annual ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .3s" }} />
              </button>
              <span style={{ fontSize: ".85rem", color: annual ? "#f5f5f5" : "#666", fontWeight: 600 }}>Anual</span>
              {annual && <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#22c55e", background: "#22c55e22", borderRadius: 99, padding: "2px 8px" }}>-10%</span>}
            </div>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="pricing-grid">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div style={{ position: "relative", borderRadius: 20, border: p.highlight ? "1px solid #c94070" : "1px solid #2a2a2e", background: p.highlight ? "linear-gradient(145deg,#1e0d14,#1a1a1d)" : "#13131a", padding: 32, height: "100%", boxSizing: "border-box" }}>
                {p.highlight && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#c94070", color: "#fff", fontSize: ".7rem", fontWeight: 800, padding: "3px 14px", borderRadius: "0 0 10px 10px" }}>MAIS POPULAR</div>}
                <div style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>{p.name}</div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "2.6rem", fontWeight: 900, color: "#f5f5f5" }}>R${p.price}</span>
                  <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>/mês</span>
                </div>
                <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 24 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: "#d4d4d8" }}>
                      <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro" style={{ display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12, fontSize: ".9rem", fontWeight: 700, background: p.highlight ? "#c94070" : "transparent", color: p.highlight ? "#fff" : "var(--muted)", border: p.highlight ? "none" : "1px solid #2a2a2e", textDecoration: "none", transition: "opacity .2s" }}>
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ FAQ ═══════════════════════ */
const faqs = [
  { q: "Como funciona o período gratuito?", a: "7 dias sem cartão de crédito. Acesso completo a todos os recursos do plano Profissional." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Sem multa, sem fidelidade. Cancele direto no painel." },
  { q: "O sistema funciona no celular?", a: "Sim. Totalmente responsivo. Use no tablet da cozinha, no celular do garçom ou no computador do caixa." },
  { q: "Meu cardápio é acessível para os clientes?", a: "Sim. Gera um link único do seu cardápio digital que os clientes acessam pelo celular, com pedido direto." },
  { q: "Como os pedidos chegam na cozinha?", a: "Em tempo real. O sistema toca um alerta sonoro e exibe o pedido na tela da cozinha automaticamente." },
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ padding: "100px 0", borderTop: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{ maxWidth: 720, marginInline: "auto", paddingInline: 24 }}>
        <Reveal>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, textAlign: "center", marginBottom: 48 }}>Perguntas frequentes</h2>
        </Reveal>
        {faqs.map((f, i) => (
          <Reveal key={i} delay={i * 50}>
            <div style={{ borderBottom: "1px solid #2a2a2e", padding: "18px 0" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: 0 }}>
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "#f5f5f5" }}>{f.q}</span>
                <span style={{ fontSize: 18, color: "#c94070", flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform .25s" }}>+</span>
              </button>
              {open === i && (
                <p style={{ marginTop: 12, fontSize: ".9rem", color: "var(--muted)", lineHeight: 1.7 }}>{f.a}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function Home() {
  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes glow  { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        .feature-grid { grid-template-columns: 1fr 1fr; }
        @media(max-width:768px){
          .feature-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feature-grid > div { order: unset !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(13,13,15,.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24, height: 64, display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image src="/logo.png" alt="FoodNex" width={110} height={44} style={{ objectFit: "contain" }} priority />
          </Link>
          <div className="nav-links" style={{ display: "flex", gap: 32, marginLeft: 16 }}>
            {[
              { label: "Sistema", href: "#dashboard" },
              { label: "Preços", href: "#precos" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: ".9rem", color: "var(--muted)", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >{l.label}</a>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/login" style={{ fontSize: ".88rem", color: "var(--muted)", textDecoration: "none", padding: "8px 16px", borderRadius: 10, transition: "color .2s" }}>Entrar</Link>
            <Link href="/cadastro" style={{ fontSize: ".88rem", fontWeight: 700, background: "#c94070", color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 10, transition: "opacity .2s", whiteSpace: "nowrap" }}>Testar grátis</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "80px 24px" }}>
          {/* background gradients */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,64,112,.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(201,64,112,.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "float 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "20%", right: "8%", width: 300, height: 300, background: "radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "float 10s ease-in-out infinite reverse" }} />
          {/* grid pattern */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

          <div style={{ position: "relative", maxWidth: 900, marginInline: "auto", textAlign: "center" }}>
            {/* badge */}
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid rgba(201,64,112,.35)", background: "rgba(201,64,112,.08)", padding: "6px 18px", fontSize: ".78rem", fontWeight: 700, color: "#c94070", marginBottom: 40 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c94070", animation: "glow 2s ease-in-out infinite", display: "inline-block" }} />
                7 dias grátis · sem cartão de crédito
              </div>
            </Reveal>

            {/* logo */}
            <Reveal delay={100}>
              <div style={{ marginBottom: 32, animation: "float 6s ease-in-out infinite" }}>
                <Image
                  src="/logo.png"
                  alt="FoodNex — Gestão Inteligente de Pedidos"
                  width={280}
                  height={280}
                  priority
                  style={{ objectFit: "contain", marginInline: "auto", display: "block", filter: "drop-shadow(0 0 60px rgba(201,64,112,.4))" }}
                />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <p style={{ fontSize: "clamp(1.05rem,2.2vw,1.3rem)", color: "var(--muted)", lineHeight: 1.7, maxWidth: 620, marginInline: "auto", marginBottom: 44 }}>
                Do cardápio à cozinha. Do pedido à entrega.<br />
                Gestão inteligente para restaurantes que querem crescer.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 32px", borderRadius: 14, background: "linear-gradient(135deg,#c94070,#e0507f)", color: "#fff", fontWeight: 800, fontSize: "1rem", textDecoration: "none", boxShadow: "0 8px 40px rgba(201,64,112,.4)", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 50px rgba(201,64,112,.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(201,64,112,.4)"; }}
                >
                  Começar teste grátis →
                </Link>
                <a href="#dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,.12)", color: "var(--muted)", fontSize: "1rem", fontWeight: 600, textDecoration: "none", background: "rgba(255,255,255,.04)", transition: "background .2s, color .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "#f5f5f5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  Ver o sistema ↓
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
          <div style={{ maxWidth: 900, marginInline: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
              {[
                { val: 850, prefix: "", suffix: "+", label: "Restaurantes ativos" },
                { val: 12000, prefix: "", suffix: "+", label: "Pedidos por dia" },
                { val: 99, prefix: "", suffix: ".9%", label: "Uptime garantido" },
                { val: 7, prefix: "", suffix: " dias", label: "Teste grátis" },
              ].map((s) => (
                <Reveal key={s.label}>
                  <div>
                    <div style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "#c94070" }}>
                      <Counter to={s.val} prefix={s.prefix} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: ".85rem", color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE SECTIONS ── */}
        <FeatureSection
          id="dashboard"
          label="Dashboard"
          icon="📊"
          title="Visão completa do seu negócio em tempo real"
          desc="Acompanhe faturamento, quantidade de pedidos e ticket médio do dia. Veja todos os pedidos ativos — mesas, entregas e retiradas — num único painel atualizado em tempo real. Controle de caixa integrado com histórico de datas anteriores."
          mockup={<DashboardMockup />}
        />

        <FeatureSection
          id="cozinha"
          label="Cozinha"
          icon="👨‍🍳"
          title="Cozinha organizada com visão por status"
          desc="Pedidos chegam com alerta sonoro e aparecem automaticamente em colunas: Aguardando → Em preparo → Pronto. A equipe aceita, avança e marca pedidos concluídos com um clique. Integração automática com WhatsApp quando o pedido fica pronto."
          mockup={<CozinhaMockup />}
          reverse
        />

        <FeatureSection
          id="mesas"
          label="Mesas"
          icon="🪑"
          title="Gestão de mesas com status em tempo real"
          desc="Veja todas as mesas do restaurante de um olhar — livres em verde, ocupadas em vermelho, encerrando em amarelo. Abra a comanda de cada mesa, registre pagamento por dinheiro, PIX, crédito ou débito, e libere a mesa com um clique."
          mockup={<MesasMockup />}
        />

        <FeatureSection
          id="garcom"
          label="Garçom"
          icon="🛎️"
          title="Chamados de garçom direto do celular do cliente"
          desc="O cliente escaneia o QR da mesa e chama o garçom pelo celular — sem precisar apertar botão físico. O chamado aparece instantaneamente na tela do garçom com nome, mesa e horário. Atenda e conclua com dois cliques."
          mockup={<GarcomMockup />}
          reverse
        />

        <FeatureSection
          id="cardapio"
          label="Cardápio"
          icon="📋"
          title="Cardápio digital com link único para seus clientes"
          desc="Cadastre categorias, produtos, sabores, tamanhos e adicionais. Gere automaticamente um link do cardápio digital que seus clientes abrem no celular para fazer pedidos. Controle disponibilidade de cada item em tempo real."
          mockup={<CardapioMockup />}
        />

        <FeatureSection
          id="entregas"
          label="Entregas"
          icon="🛵"
          title="Controle de delivery do preparo à porta do cliente"
          desc="Acompanhe cada entrega: pronto para despachar, em rota, concluída. Ao despachar, o sistema envia automaticamente uma mensagem de WhatsApp ao cliente informando que o pedido saiu. Histórico completo de entregas do dia."
          mockup={<EntregasMockup />}
          reverse
        />

        <Pricing />
        <FAQ />

        {/* ── CTA FINAL ── */}
        <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,.04)", textAlign: "center" }}>
          <Reveal>
            <div style={{ maxWidth: 640, marginInline: "auto" }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 16 }}>Pronto para transformar seu restaurante?</h2>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", marginBottom: 36 }}>Comece hoje. 7 dias grátis, sem cartão de crédito.</p>
              <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", borderRadius: 14, background: "linear-gradient(135deg,#c94070,#e0507f)", color: "#fff", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none", boxShadow: "0 8px 40px rgba(201,64,112,.4)" }}>
                Criar conta grátis →
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1140, marginInline: "auto", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
          <Image src="/logo.png" alt="FoodNex" width={90} height={36} style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Termos", "Privacidade", "Contato"].map((l) => (
              <a key={l} href="#" style={{ fontSize: ".82rem", color: "var(--muted)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>© {new Date().getFullYear()} FoodNex. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}
