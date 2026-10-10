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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
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

/* ═══════════════════════ BROWSER FRAME ═══════════════════════ */
function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#13131a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a", boxShadow: "0 24px 80px rgba(0,0,0,.7)" }}>
      <div style={{ background: "#0d0d14", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#666", fontSize: 9 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════ PHONE FRAME ═══════════════════════ */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 240, background: "#0d0d0d", borderRadius: 36, border: "3px solid #2a2a2a", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.9), 0 0 0 1px #1a1a1a", position: "relative" }}>
        {/* status bar */}
        <div style={{ height: 32, background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", position: "relative" }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>00:09</span>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 70, height: 20, background: "#0d0d0d", borderRadius: "0 0 14px 14px", border: "2px solid #1a1a1a", borderTop: "none" }} />
          <span style={{ fontSize: 8, color: "#fff" }}>▌▌▌ 4G</span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════ MOCKUPS ═══════════════════════ */

function DashboardMockup() {
  return (
    <BrowserFrame title="Dashboard · FoodNex">
      <div style={{ padding: 12, fontSize: 10 }}>
        {/* Caixa Aberto banner */}
        <div style={{ background: "#16a34a22", border: "1px solid #16a34a44", borderRadius: 8, padding: "6px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", animation: "glow 2s ease-in-out infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 8.5, fontWeight: 700, color: "#4ade80" }}>Caixa Aberto</span>
          <span style={{ fontSize: 8, color: "#86efac", marginLeft: "auto" }}>Aberto às 11:00</span>
          <button style={{ fontSize: 7.5, fontWeight: 700, color: "#ef4444", background: "#ef444411", border: "1px solid #ef444433", borderRadius: 5, padding: "2px 7px", cursor: "pointer" }}>Fechar Caixa</button>
        </div>
        {/* stat cards row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
          {[
            { val: "23", lbl: "Pedidos no Caixa", color: "#c94070" },
            { val: "8", lbl: "Em Preparo", color: "#3b82f6" },
            { val: "3", lbl: "Prontos", color: "#22c55e" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#1a1a2a", borderRadius: 8, padding: "8px 8px 6px", border: "1px solid #2a2a3a" }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 7.5, color: "#888", marginTop: 2, lineHeight: 1.2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        {/* stat cards row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[
            { val: "5", lbl: "Entregas", color: "#a855f7" },
            { val: "4", lbl: "Mesas Ocupadas", color: "#f59e0b" },
            { val: "R$1.840", lbl: "Faturamento Caixa", color: "#22c55e" },
          ].map((s) => (
            <div key={s.lbl} style={{ background: "#1a1a2a", borderRadius: 8, padding: "8px 8px 6px", border: "1px solid #2a2a3a" }}>
              <div style={{ fontSize: s.val.startsWith("R$") ? 11 : 15, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 7.5, color: "#888", marginTop: 2, lineHeight: 1.2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        {/* Atividade Recente */}
        <div style={{ background: "#1a1a2a", borderRadius: 8, padding: "8px 10px", border: "1px solid #2a2a3a" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#aaa", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Atividade Recente</div>
          {[
            { num: "#0041", desc: "Mesa 3 — 2x Pizza, 1x Suco", status: "Em preparo", sc: "#3b82f6" },
            { num: "#0040", desc: "Entrega — Av. Brasil, 456", status: "Saiu entrega", sc: "#a855f7" },
            { num: "#0039", desc: "Retirada — Pedro Alves", status: "Pronto", sc: "#22c55e" },
            { num: "#0038", desc: "Mesa 7 — 1x X-Burguer, 2x Refri", status: "Aguardando", sc: "#f59e0b" },
          ].map((o) => (
            <div key={o.num} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #1e1e2e" }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#c94070", minWidth: 30 }}>{o.num}</span>
              <span style={{ fontSize: 8, color: "#ccc", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.desc}</span>
              <span style={{ fontSize: 7, fontWeight: 700, color: o.sc, background: o.sc + "22", borderRadius: 99, padding: "1px 5px", whiteSpace: "nowrap" }}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function CozinhaMockup() {
  const cols = [
    { label: "Aguardando aceite", color: "#f59e0b", orders: [
      { id: "#0043", name: "Mesa 5", items: "1x Margherita, 1x Frango" },
    ]},
    { label: "Em preparo", color: "#3b82f6", orders: [
      { id: "#0041", name: "Mesa 3", items: "2x X-Bacon, 1x Batata" },
    ]},
    { label: "Prontos", color: "#22c55e", orders: [
      { id: "#0039", name: "Retirada — João", items: "1x Combo Frango" },
    ]},
    { label: "Concluídos hoje", color: "#555", orders: [] },
  ];
  return (
    <BrowserFrame title="Cozinha · FoodNex">
      <div style={{ padding: "10px 10px 10px", fontSize: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          {cols.map((col) => (
            <div key={col.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: col.color, fontSize: 8, lineHeight: 1.2 }}>{col.label}</span>
              </div>
              {col.label === "Concluídos hoje" ? (
                <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#555" }}>14</div>
                  <div style={{ fontSize: 7.5, color: "#444" }}>pedidos</div>
                </div>
              ) : col.orders.map((o) => (
                <div key={o.id} style={{ background: "#1a1a2a", borderRadius: 8, padding: 7, marginBottom: 6, border: `1px solid ${col.color}33` }}>
                  <span style={{ fontWeight: 700, color: "#c94070", fontSize: 8 }}>{o.id}</span>
                  <div style={{ fontSize: 8.5, color: "#e5e5e5", fontWeight: 700, margin: "3px 0 2px" }}>{o.name}</div>
                  <div style={{ fontSize: 7.5, color: "#888", marginBottom: 6 }}>{o.items}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <button style={{ width: "100%", background: "#ef444411", border: "1px solid #ef444433", borderRadius: 5, padding: "2px 0", fontSize: 7, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Cancelar</button>
                    <button style={{ width: "100%", background: "#2a2a3a", border: "1px solid #3a3a4a", borderRadius: 5, padding: "2px 0", fontSize: 7, fontWeight: 700, color: "#aaa", cursor: "pointer" }}>Imprimir</button>
                    <button style={{ width: "100%", background: col.color + "22", border: `1px solid ${col.color}44`, borderRadius: 5, padding: "2px 0", fontSize: 7, fontWeight: 700, color: col.color, cursor: "pointer" }}>
                      {col.label === "Aguardando aceite" ? "Aceitar" : "Pedido Pronto"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function MesasMockup() {
  const tables = [
    { n: 1, status: "livre", value: null },
    { n: 2, status: "ocupada", value: "R$124,00" },
    { n: 3, status: "ocupada", value: "R$87,50" },
    { n: 4, status: "livre", value: null },
    { n: 5, status: "ocupada", value: "R$210,00" },
    { n: 6, status: "ocupada", value: "R$43,00" },
    { n: 7, status: "livre", value: null },
    { n: 8, status: "ocupada", value: "R$156,90" },
  ];
  const styles: Record<string, { border: string; bg: string; badge: string; lbl: string }> = {
    livre:   { border: "#22c55e55", bg: "#22c55e0d", badge: "#22c55e22", lbl: "#22c55e" },
    ocupada: { border: "#ef444455", bg: "#ef44440d", badge: "#ef444422", lbl: "#ef4444" },
  };
  const livres = tables.filter(t => t.status === "livre").length;
  const ocupadas = tables.filter(t => t.status === "ocupada").length;
  return (
    <BrowserFrame title="Mesas · FoodNex">
      <div style={{ padding: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10, fontSize: 8 }}>
          <div style={{ background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 8, padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#22c55e" }}>{livres}</div>
            <div style={{ color: "#86efac", fontSize: 8, marginTop: 1 }}>Livres</div>
          </div>
          <div style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 8, padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ef4444" }}>{ocupadas}</div>
            <div style={{ color: "#fca5a5", fontSize: 8, marginTop: 1 }}>Ocupadas</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {tables.map((t) => {
            const s = styles[t.status];
            return (
              <div key={t.n} style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#f5f5f5" }}>Mesa {t.n}</div>
                <div style={{ fontSize: 7.5, fontWeight: 600, color: s.lbl, marginTop: 3, background: s.badge, borderRadius: 99, padding: "1px 5px", display: "inline-block", textTransform: "capitalize" }}>{t.status}</div>
                {t.value && <div style={{ fontSize: 9, fontWeight: 700, color: "#ccc", marginTop: 4 }}>{t.value}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </BrowserFrame>
  );
}

function GarcomMockup() {
  return (
    <PhoneFrame>
      <div style={{ background: "#0d0d14", minHeight: 440, padding: 14 }}>
        {/* Store header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, background: "#1a1a2a", borderRadius: 10, border: "1px solid #2a2a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍕</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#f5f5f5", letterSpacing: "0.03em" }}>PIZZA NOVA</div>
            <div style={{ fontSize: 9, color: "#888" }}>Painel do Garçom</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div style={{ background: "#ef444411", border: "1px solid #ef444440", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#ef4444", marginBottom: 4 }}>Aguardando</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>1</div>
          </div>
          <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b40", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#f59e0b", marginBottom: 4 }}>Em atendimento</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>0</div>
          </div>
        </div>
        {/* Call card */}
        <div style={{ background: "#ef444411", border: "1px solid #ef444440", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#f5f5f5" }}>Mesa 4</div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Carlos · 00:08</div>
            </div>
            <button style={{ background: "#c94070", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer" }}>Atender</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function CardapioMockup() {
  const [tab, setTab] = useState<"admin" | "cliente">("admin");
  return (
    <div>
      {/* view toggle */}
      <div style={{ display: "flex", gap: 4, background: "#1a1a2a", borderRadius: 10, padding: 3, marginBottom: 10, border: "1px solid #2a2a3a" }}>
        {(["admin", "cliente"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", background: tab === t ? "#c94070" : "transparent", color: tab === t ? "#fff" : "#888", transition: "all .2s" }}>
            {t === "admin" ? "Painel Admin" : "Cardápio do Cliente"}
          </button>
        ))}
      </div>

      {tab === "admin" ? (
        <BrowserFrame title="Cardápio · FoodNex">
          <div style={{ padding: 12, fontSize: 10 }}>
            {/* link bar */}
            <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "6px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 7.5, color: "#888", marginBottom: 2 }}>Link público do cardápio</div>
                <div style={{ fontSize: 8.5, color: "#c94070", fontFamily: "monospace" }}>foodnex.app/pizzanova</div>
              </div>
              <button style={{ background: "#c94070", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Copiar</button>
            </div>
            {/* tabs */}
            <div style={{ display: "flex", gap: 3, background: "#1a1a2a", borderRadius: 8, padding: 3, marginBottom: 10 }}>
              {["Categorias", "Adicionais", "Produtos", "Disponibilidade"].map((t, i) => (
                <div key={t} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 6, fontSize: 7.5, fontWeight: 600, background: i === 0 ? "#13131a" : "transparent", color: i === 0 ? "#f5f5f5" : "#888" }}>{t}</div>
              ))}
            </div>
            {/* category cards */}
            {[
              { name: "Pizzas", items: 12 },
              { name: "Hambúrgueres", items: 7 },
              { name: "Bebidas", items: 10 },
            ].map((cat) => (
              <div key={cat.name} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{cat.name}</div>
                  <div style={{ fontSize: 7.5, color: "#888" }}>{cat.items} produtos</div>
                </div>
                <button style={{ background: "#2a2a3a", border: "1px solid #3a3a4a", borderRadius: 5, padding: "2px 7px", fontSize: 7.5, color: "#aaa", cursor: "pointer" }}>Editar</button>
              </div>
            ))}
          </div>
        </BrowserFrame>
      ) : (
        <PhoneFrame>
          <div style={{ background: "#0d0d14", minHeight: 480 }}>
            {/* banner placeholder */}
            <div style={{ height: 80, background: "linear-gradient(135deg, #7c2d12, #c94070)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Promoção do Fim de Semana</span>
            </div>
            {/* store info */}
            <div style={{ padding: "10px 12px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 38, height: 38, background: "#1a1a2a", borderRadius: 10, border: "1px solid #2a2a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🍕</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#f5f5f5" }}>PIZZA NOVA</div>
                  <span style={{ fontSize: 7.5, fontWeight: 700, color: "#22c55e", background: "#22c55e22", borderRadius: 99, padding: "1px 7px", display: "inline-block" }}>Aberto agora</span>
                </div>
              </div>
              <div style={{ fontSize: 8, color: "#888", marginBottom: 8 }}>Seg à Dom das 18h — 00h</div>
              {/* service pills */}
              <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                {["Entrega 30 min", "Retirada 15 min", "Mesa 20 min"].map((p) => (
                  <span key={p} style={{ fontSize: 7.5, color: "#aaa", background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 99, padding: "2px 7px" }}>{p}</span>
                ))}
              </div>
              {/* category tabs */}
              <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto" }}>
                {["Pizzas", "Hambúrgueres", "Bebidas", "Sobremesas"].map((c, i) => (
                  <span key={c} style={{ fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 99, background: i === 0 ? "#c94070" : "#1a1a2a", color: i === 0 ? "#fff" : "#888", border: i === 0 ? "none" : "1px solid #2a2a3a" }}>{c}</span>
                ))}
              </div>
              {/* products */}
              {[
                { name: "Pizza Margherita", desc: "Molho, mozzarella, manjericão", price: "R$ 32,00" },
                { name: "Pizza Frango c/ Catupiry", desc: "Frango desfiado, catupiry, orégano", price: "R$ 38,00" },
              ].map((p) => (
                <div key={p.name} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: 10, marginBottom: 6, display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#f5f5f5" }}>{p.name}</div>
                    <div style={{ fontSize: 8, color: "#888", marginTop: 2 }}>{p.desc}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#c94070", marginTop: 4 }}>{p.price}</div>
                  </div>
                  <div style={{ width: 44, height: 44, background: "#2a2a3a", borderRadius: 8, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame>
      )}
    </div>
  );
}

function RetiradasMockup() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
      {/* Admin view */}
      <BrowserFrame title="Retiradas · FoodNex">
        <div style={{ padding: 12, fontSize: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 8, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#f59e0b" }}>3</div>
              <div style={{ fontSize: 7.5, color: "#f59e0b99" }}>Aguardando retirada</div>
            </div>
            <div style={{ background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: 8, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#22c55e" }}>11</div>
              <div style={{ fontSize: 7.5, color: "#22c55e99" }}>Concluídas hoje</div>
            </div>
          </div>
          <input style={{ width: "100%", background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 6, padding: "4px 8px", fontSize: 8, color: "#888", boxSizing: "border-box", marginBottom: 8, outline: "none" }} placeholder="Buscar por cliente..." readOnly />
          {[
            { id: "#0043", name: "Pedro Alves", items: "1x Combo Frango", total: "R$28,00", status: "pronto" },
            { id: "#0041", name: "Carla Souza", items: "2x X-Bacon", total: "R$52,00", status: "pronto" },
            { id: "#0038", name: "Lucas Ferreira", items: "1x Pizza M, 1x Suco", total: "R$45,00", status: "pronto" },
          ].map((o) => (
            <div key={o.id} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 8px", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: "#c94070" }}>{o.id}</span>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: "#e5e5e5" }}>{o.name}</span>
                <span style={{ marginLeft: "auto", fontSize: 7, fontWeight: 700, color: "#f59e0b", background: "#f59e0b22", borderRadius: 99, padding: "1px 5px" }}>Aguardando</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 7.5, color: "#888" }}>{o.items} · {o.total}</span>
                <button style={{ background: "#c9407022", border: "1px solid #c9407055", borderRadius: 5, padding: "2px 7px", fontSize: 7.5, fontWeight: 700, color: "#c94070", cursor: "pointer" }}>Entregar →</button>
              </div>
            </div>
          ))}
        </div>
      </BrowserFrame>

      {/* Client tracking phone */}
      <PhoneFrame>
        <div style={{ background: "#0d0d14", minHeight: 420, padding: 14 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: "#c9407022", border: "1px solid #c9407044", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginInline: "auto", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🕐</span>
            </div>
            <div style={{ fontSize: 8.5, color: "#888" }}>Pedido #0043 · Pedro Alves</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#f5f5f5", margin: "4px 0 2px" }}>Pedido recebido</div>
            <div style={{ fontSize: 8.5, color: "#888" }}>Aguardando o restaurante confirmar</div>
          </div>
          {/* Timeline */}
          <div style={{ position: "relative", paddingLeft: 28 }}>
            {[
              { step: 1, label: "Pedido recebido", sub: "Aguardando confirmar", active: true },
              { step: 2, label: "Em preparo", sub: "", active: false },
              { step: 3, label: "Pronto para retirada", sub: "", active: false },
              { step: 4, label: "Retirado!", sub: "", active: false },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 20 : 0, position: "relative" }}>
                {/* connector line */}
                {i < 3 && <div style={{ position: "absolute", left: -20, top: 16, width: 2, height: 24, background: "#2a2a3a" }} />}
                <div style={{ position: "absolute", left: -26, top: 0, width: 14, height: 14, borderRadius: "50%", background: s.active ? "#c94070" : "#2a2a3a", border: s.active ? "2px solid #e0507f" : "2px solid #3a3a4a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: s.active ? "#fff" : "#666" }}>{s.step}</span>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: s.active ? "#f5f5f5" : "#555" }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 8, color: "#888", marginTop: 1 }}>{s.sub}</div>}
                </div>
              </div>
            ))}
          </div>
          {/* Order summary */}
          <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 12px", marginTop: 18 }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Resumo do Pedido</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, marginBottom: 4 }}>
              <span style={{ color: "#ccc" }}>1x Combo Frango</span>
              <span style={{ color: "#ccc" }}>R$ 28,00</span>
            </div>
            <div style={{ borderTop: "1px solid #2a2a3a", paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>Total</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>R$ 28,00</span>
            </div>
          </div>
        </div>
      </PhoneFrame>
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
    <BrowserFrame title="Entregas · FoodNex">
      <div style={{ padding: 12, fontSize: 10 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Prontos", val: 2, c: "#22c55e", active: true },
            { label: "Em rota", val: 1, c: "#3b82f6", active: false },
            { label: "Entregues", val: 8, c: "#888", active: false },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.active ? s.c + "22" : "#1a1a2a", border: `1px solid ${s.active ? s.c + "55" : "#2a2a3a"}`, borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.active ? s.c : "#666" }}>{s.val}</div>
              <div style={{ fontSize: 7.5, color: s.active ? s.c + "cc" : "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {orders.map((o) => (
          <div key={o.id} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "8px 10px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 8.5, fontWeight: 800, color: "#c94070" }}>{o.id}</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: "#e5e5e5" }}>{o.name}</span>
              <span style={{ fontSize: 7.5, fontWeight: 700, marginLeft: "auto", color: o.status === "pronto" ? "#22c55e" : "#3b82f6", background: o.status === "pronto" ? "#22c55e22" : "#3b82f622", borderRadius: 99, padding: "1px 5px" }}>
                {o.status === "pronto" ? "Pronto" : "Em rota"}
              </span>
            </div>
            <div style={{ fontSize: 8, color: "#888", marginBottom: 5 }}>📍 {o.addr}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{o.total}</span>
              <button style={{ background: o.status === "pronto" ? "#c9407022" : "#3b82f622", border: `1px solid ${o.status === "pronto" ? "#c9407055" : "#3b82f655"}`, borderRadius: 6, padding: "3px 8px", fontSize: 7.5, fontWeight: 700, color: o.status === "pronto" ? "#c94070" : "#3b82f6", cursor: "pointer" }}>
                {o.status === "pronto" ? "Despachar →" : "Finalizar ✓"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

function RelatoriosMockup() {
  const payments = [
    { label: "PIX", val: "R$21.900", pct: 45, color: "#22c55e" },
    { label: "Dinheiro", val: "R$12.400", pct: 26, color: "#3b82f6" },
    { label: "Cartão Crédito", val: "R$9.800", pct: 20, color: "#a855f7" },
    { label: "Cartão Débito", val: "R$4.220", pct: 9, color: "#f59e0b" },
  ];
  return (
    <BrowserFrame title="Relatórios · FoodNex">
      <div style={{ padding: 12, fontSize: 10 }}>
        {/* Date filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
          <div style={{ flex: 1, background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 6, padding: "4px 8px", fontSize: 8, color: "#888" }}>01/10/2025</div>
          <span style={{ fontSize: 8, color: "#555" }}>→</span>
          <div style={{ flex: 1, background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 6, padding: "4px 8px", fontSize: 8, color: "#888" }}>31/10/2025</div>
          <button style={{ background: "#c94070", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Filtrar</button>
        </div>
        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[
            { val: "R$48.320", lbl: "Total Faturado", c: "#22c55e" },
            { val: "712", lbl: "Pedidos", c: "#c94070" },
            { val: "R$67,85", lbl: "Ticket Médio", c: "#3b82f6" },
          ].map((k) => (
            <div key={k.lbl} style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "8px 8px 6px" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: k.c }}>{k.val}</div>
              <div style={{ fontSize: 7.5, color: "#888", marginTop: 2 }}>{k.lbl}</div>
            </div>
          ))}
        </div>
        {/* Payment breakdown */}
        <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Formas de Pagamento</div>
          {payments.map((p) => (
            <div key={p.label} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: "#ccc" }}>{p.label}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: p.color }}>{p.val} <span style={{ color: "#666", fontWeight: 400 }}>({p.pct}%)</span></span>
              </div>
              <div style={{ background: "#2a2a3a", borderRadius: 99, height: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
        {/* Type breakdown */}
        <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Por Tipo de Pedido</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { type: "Mesa", count: 340, pct: 48, c: "#c94070" },
              { type: "Entrega", count: 228, pct: 32, c: "#3b82f6" },
              { type: "Retirada", count: 144, pct: 20, c: "#22c55e" },
            ].map((t) => (
              <div key={t.type} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: t.c }}>{t.count}</div>
                <div style={{ fontSize: 7.5, color: "#888" }}>{t.type}</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: t.c }}>{t.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function WhatsAppMockup() {
  return (
    <BrowserFrame title="WhatsApp · FoodNex">
      <div style={{ padding: 14, fontSize: 10 }}>
        {/* Status */}
        <div style={{ background: "#16a34a22", border: "1px solid #16a34a44", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#25d36622", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>💬</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80" }}>WhatsApp Conectado</div>
            <div style={{ fontSize: 8, color: "#86efac" }}>+55 (11) 99999-9999</div>
          </div>
          <button style={{ marginLeft: "auto", background: "#ef444411", border: "1px solid #ef444433", borderRadius: 6, padding: "3px 8px", fontSize: 7.5, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Desconectar</button>
        </div>

        {/* PIX Key */}
        <div style={{ background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: "#f5f5f5", marginBottom: 6 }}>Chave PIX para Pagamentos</div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1, background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 6, padding: "5px 8px", fontSize: 8, color: "#888" }}>restaurante@email.com</div>
            <button style={{ background: "#c94070", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 8, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Salvar</button>
          </div>
        </div>

        {/* Como funciona */}
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Como funciona</div>
          {[
            { n: 1, title: "Conecte seu WhatsApp", sub: "Escaneie o QR code no painel de configurações" },
            { n: 2, title: "Pedidos confirmados automaticamente", sub: "O cliente recebe confirmação ao fazer o pedido" },
            { n: 3, title: "Notificação de saída para entrega", sub: "Aviso automático quando o entregador sai" },
            { n: 4, title: "Chave PIX integrada", sub: "Cliente recebe a chave PIX direto no WhatsApp" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#c9407022", border: "1px solid #c9407044", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 8.5, fontWeight: 900, color: "#c94070" }}>{s.n}</span>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#f5f5f5" }}>{s.title}</div>
                <div style={{ fontSize: 7.5, color: "#888", marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ═══════════════════════ FEATURE SECTION ═══════════════════════ */
function FeatureSection({
  id, label, title, desc, mockup, reverse = false,
}: {
  id: string; label: string; title: string; desc: string;
  mockup: React.ReactNode; reverse?: boolean;
}) {
  const { ref, visible } = useReveal();
  return (
    <section id={id} style={{ padding: "80px 0", borderTop: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{ maxWidth: 1200, marginInline: "auto", paddingInline: 24 }}>
        <div ref={ref} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 64,
          alignItems: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(50px)",
          transition: "opacity .8s ease, transform .8s ease",
        }}
          className="feature-grid"
        >
          <div style={{ order: reverse ? 2 : 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", borderRadius: 99, border: "1px solid rgba(201,64,112,.3)", background: "rgba(201,64,112,.08)", padding: "5px 14px", fontSize: ".75rem", fontWeight: 700, color: "#c94070", marginBottom: 20 }}>
              {label}
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>{title}</h2>
            <p style={{ fontSize: ".95rem", color: "var(--muted)", lineHeight: 1.75 }}>{desc}</p>
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
    { name: "Básico", price: annual ? 89 : 99, desc: "Para começar", features: ["1 ponto de venda", "Até 300 pedidos/mês", "Dashboard completo", "Cardápio digital", "Suporte por e-mail"], cta: "Começar grátis" },
    { name: "Profissional", price: annual ? 179 : 199, desc: "Mais popular", features: ["3 pontos de venda", "Pedidos ilimitados", "Cozinha + Entregas + Retiradas", "Mesas + Garçom", "Relatórios avançados", "WhatsApp integrado", "Suporte prioritário"], cta: "Começar grátis", highlight: true },
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
                <Link href="/cadastro" style={{ display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12, fontSize: ".9rem", fontWeight: 700, background: p.highlight ? "#c94070" : "transparent", color: p.highlight ? "#fff" : "var(--muted)", border: p.highlight ? "none" : "1px solid #2a2a2e", textDecoration: "none" }}>
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
  { q: "O WhatsApp é obrigatório?", a: "Não. O WhatsApp é opcional. Quando conectado, automatiza confirmações e notificações de entrega para o cliente." },
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
        .feature-grid { grid-template-columns: 1fr 1.2fr; }
        @media(max-width:900px){
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
            <Image src="/logo.png" alt="FoodNex" width={80} height={32} style={{ objectFit: "contain" }} priority />
          </Link>
          <div className="nav-links" style={{ display: "flex", gap: 28, marginLeft: 8 }}>
            {[
              { label: "Sistema", href: "#dashboard" },
              { label: "Preços", href: "#precos" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.href} href={l.href} style={{ fontSize: ".88rem", color: "var(--muted)", textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >{l.label}</a>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/login" style={{ fontSize: ".88rem", color: "var(--muted)", textDecoration: "none", padding: "8px 16px", borderRadius: 10 }}>Entrar</Link>
            <Link href="/cadastro" style={{ fontSize: ".88rem", fontWeight: 700, background: "#c94070", color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 10, whiteSpace: "nowrap" }}>Testar grátis</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "80px 24px" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,64,112,.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(201,64,112,.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "float 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "20%", right: "8%", width: 300, height: 300, background: "radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "float 10s ease-in-out infinite reverse" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

          <div style={{ position: "relative", maxWidth: 900, marginInline: "auto", textAlign: "center" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid rgba(201,64,112,.35)", background: "rgba(201,64,112,.08)", padding: "6px 18px", fontSize: ".78rem", fontWeight: 700, color: "#c94070", marginBottom: 40 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c94070", animation: "glow 2s ease-in-out infinite", display: "inline-block" }} />
                7 dias grátis · sem cartão de crédito
              </div>
            </Reveal>

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
                { val: 850, suffix: "+", label: "Restaurantes ativos" },
                { val: 12000, suffix: "+", label: "Pedidos por dia" },
                { val: 99, suffix: ".9%", label: "Uptime garantido" },
                { val: 7, suffix: " dias", label: "Teste grátis" },
              ].map((s) => (
                <Reveal key={s.label}>
                  <div>
                    <div style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "#c94070" }}>
                      <Counter to={s.val} suffix={s.suffix} />
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
          title="Visão completa do seu negócio em tempo real"
          desc="Acompanhe faturamento, quantidade de pedidos e ticket médio do dia. Veja todos os pedidos ativos — mesas, entregas e retiradas — num único painel. Controle de caixa integrado com histórico de datas anteriores e acompanhamento de mesas ocupadas."
          mockup={<DashboardMockup />}
        />

        <FeatureSection
          id="cozinha"
          label="Cozinha"
          title="Cozinha organizada com visão por status"
          desc="Pedidos chegam com alerta sonoro divididos em 4 colunas: Aguardando aceite → Em preparo → Prontos → Concluídos hoje. Aceite, imprima ou avance o status do pedido com um clique. Botão de cancelamento disponível em qualquer etapa."
          mockup={<CozinhaMockup />}
          reverse
        />

        <FeatureSection
          id="mesas"
          label="Mesas"
          title="Gestão de mesas com status em tempo real"
          desc="Veja todas as mesas do restaurante de um olhar — livres em verde e ocupadas em vermelho. Abra a comanda de cada mesa, registre o pagamento por dinheiro, PIX, cartão de crédito ou débito, e libere a mesa com um clique."
          mockup={<MesasMockup />}
        />

        <FeatureSection
          id="garcom"
          label="Garçom"
          title="Chamados de garçom direto no celular"
          desc="O cliente escaneia o QR da mesa e chama o garçom pelo celular — sem precisar apertar botão físico. O chamado aparece instantaneamente na tela do garçom com nome, mesa e horário. Atenda e conclua com dois toques."
          mockup={<GarcomMockup />}
          reverse
        />

        <FeatureSection
          id="cardapio"
          label="Cardápio"
          title="Cardápio digital com link único para seus clientes"
          desc="Cadastre categorias, produtos, sabores, tamanhos e adicionais no painel admin. Gere automaticamente um link do cardápio digital que seus clientes abrem no celular para fazer pedidos. Controle disponibilidade de cada item em tempo real."
          mockup={<CardapioMockup />}
        />

        <FeatureSection
          id="retiradas"
          label="Retiradas"
          title="Pedidos para retirar com acompanhamento do cliente"
          desc="Gerencie pedidos de balcão com fila de espera em tempo real. O cliente acompanha o status do pedido pelo celular — da confirmação até ficar pronto para retirar — sem precisar ligar para o restaurante."
          mockup={<RetiradasMockup />}
          reverse
        />

        <FeatureSection
          id="entregas"
          label="Entregas"
          title="Controle de delivery do preparo à porta do cliente"
          desc="Acompanhe cada entrega: pronto para despachar, em rota, concluída. Ao despachar, o sistema envia automaticamente uma mensagem de WhatsApp ao cliente informando que o pedido saiu. Histórico completo de entregas do dia."
          mockup={<EntregasMockup />}
        />

        <FeatureSection
          id="relatorios"
          label="Relatórios"
          title="Dados completos para decisões mais inteligentes"
          desc="Filtre por período e veja total faturado, número de pedidos e ticket médio. Breakdown completo por forma de pagamento e por tipo de pedido — mesa, entrega ou retirada. Imprima ou exporte em segundos."
          mockup={<RelatoriosMockup />}
          reverse
        />

        <FeatureSection
          id="whatsapp"
          label="WhatsApp"
          title="Automação de mensagens pelo WhatsApp"
          desc="Conecte seu número de WhatsApp e automatize confirmações, notificações de entrega e envio de chave PIX para seus clientes. Tudo configurado no painel em minutos, sem precisar de um número adicional."
          mockup={<WhatsAppMockup />}
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
