"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─────────────── SCROLL-LOCKED HERO ─────────────── */
function ScrollHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const SCRUB = 3200;
    let dur = 0, target = 0, current = 0, started = false;
    let seeking = false, pending: number | null = null;
    let locked = false, lockedY = 0, touchY = 0;
    let rafId: number;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    function clamp(v: number, a: number, b: number) { return Math.min(b, Math.max(a, v)); }

    function lock() {
      if (locked) return;
      locked = true; lockedY = window.scrollY;
      const b = document.body.style;
      b.position = "fixed"; b.top = `-${lockedY}px`;
      b.left = b.right = "0"; b.width = b.height = "100%";
      b.overscrollBehavior = "none";
    }
    function unlock() {
      if (!locked) return;
      locked = false;
      const y = lockedY, b = document.body.style;
      b.position = b.top = b.left = b.right = b.width = b.height = b.overscrollBehavior = "";
      window.scrollTo(0, y);
    }
    lock();

    function onSeeked() {
      seeking = false;
      if (pending !== null && video) { const t = pending; pending = null; seeking = true; video.currentTime = t; }
    }
    function seekTo(t: number) {
      if (!video) return;
      if (seeking) { pending = t; return; }
      seeking = true; video.currentTime = t;
    }

    video.addEventListener("loadeddata", () => {
      dur = video.duration || 0;
      video.classList.add("rdy");
      if (reduce) video.currentTime = dur * 0.9;
    });
    video.addEventListener("seeked", onSeeked);

    const p = video.play();
    if (p && p.then) p.then(() => video.pause()).catch(() => {});
    else video.pause();

    function push(dy: number) {
      target = clamp(target + dy / SCRUB, 0, 1);
      if (target > 0.001) started = true;
    }

    const onWheel = (e: WheelEvent) => { push(e.deltaY); e.preventDefault(); };
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      push(touchY - y); touchY = y; e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    function frame() {
      current += (target - current) * 0.18;
      if (dur > 0) seekTo(current * dur);

      if (video) video.style.transform = `scale(${1 + current * 0.06})`;

      const t1 = 1 - clamp(current / 0.35, 0, 1);
      if (titleRef.current) {
        titleRef.current.style.opacity = String(t1);
        titleRef.current.style.transform = `translateY(${(1 - t1) * -24}px) scale(${0.96 + t1 * 0.04})`;
        titleRef.current.style.filter = `blur(${(1 - t1) * 10}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = started ? "0" : "1";

      const t2 = clamp((current - 0.82) / 0.18, 0, 1);
      if (taglineRef.current) {
        taglineRef.current.style.opacity = String(t2);
        taglineRef.current.style.transform = `translateY(${(1 - t2) * 20}px) scale(${0.97 + t2 * 0.03})`;
        taglineRef.current.style.filter = `blur(${(1 - t2) * 8}px)`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${current})`;

      rafId = requestAnimationFrame(frame);
    }
    if (!reduce) rafId = requestAnimationFrame(frame);

    const onUnlock = () => unlock();
    window.addEventListener("beforeunload", onUnlock);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("beforeunload", onUnlock);
      unlock();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative", height: "100dvh", width: "100%",
        overflow: "hidden", background: "#05070d", touchAction: "none",
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src="https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", pointerEvents: "none", opacity: 0,
          transition: "opacity .6s", willChange: "transform",
        }}
        className="hero-video"
      />
      {/* gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg,rgba(5,7,13,.4) 0%,rgba(5,7,13,0) 28%,rgba(5,7,13,.1) 65%,rgba(5,7,13,.65) 100%)",
      }} />

      {/* FoodNex logo / title */}
      <div ref={titleRef} style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 6%",
        pointerEvents: "none", willChange: "transform,opacity,filter",
      }}>
        <div style={{
          fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800,
          fontSize: "clamp(3rem, 9vw, 7.5rem)", lineHeight: 1, letterSpacing: "-.04em",
          color: "#f2f4f8", textShadow: "0 4px 40px rgba(0,0,0,.6)",
        }}>
          Food<span style={{ color: "#c94070" }}>Nex</span>
        </div>
        <div style={{
          marginTop: 16, fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "clamp(.85rem,1.8vw,1.1rem)", fontWeight: 500,
          letterSpacing: ".12em", textTransform: "uppercase",
          color: "rgba(242,244,248,.65)",
        }}>
          Gestão inteligente de restaurantes
        </div>
      </div>

      {/* tagline shown at end of scroll */}
      <div ref={taglineRef} style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 8%",
        opacity: 0, pointerEvents: "none", willChange: "transform,opacity,filter",
      }}>
        <span style={{
          fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700,
          fontSize: "clamp(1.3rem,3.5vw,3rem)", lineHeight: 1.2, letterSpacing: "-.01em",
          color: "#f2f4f8", textShadow: "0 4px 30px rgba(0,0,0,.5)",
        }}>
          Do cardápio à cozinha.<br />Do pedido à entrega.
        </span>
      </div>

      {/* scroll hint */}
      <div ref={hintRef} style={{
        position: "absolute", left: "50%", bottom: "clamp(20px,6vh,52px)",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        color: "rgba(240,244,248,.7)", fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "clamp(9px,1.3vw,11px)", fontWeight: 600, letterSpacing: ".3em",
        transition: "opacity .4s", pointerEvents: "none",
      }}>
        <span>SCROLL</span>
        <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden>
          <path d="M7 1L7 17M2 12L7 17L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "rgba(255,255,255,.1)" }}>
        <div ref={barRef} style={{
          height: "100%", width: "100%",
          background: "linear-gradient(90deg,rgba(201,64,112,.7),#c94070)",
          transform: "scaleX(0)", transformOrigin: "left",
        }} />
      </div>

      <style>{`.hero-video.rdy { opacity: 1 !important; }`}</style>
    </div>
  );
}

/* ─────────────── BENTO MOCKUPS ─────────────── */
function BentoMockups() {
  return (
    <section style={{ padding: "96px 0" }} id="sistema">
      <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 800 }}>Veja o sistema em ação</h2>
          <p style={{ marginTop: 10, color: "var(--muted)" }}>Cada tela pensada para o dia a dia do seu restaurante.</p>
        </div>
        <div className="bento-grid">

          {/* DASHBOARD */}
          <div className="bcard bc-dashboard">
            <div className="mk-dashboard">
              <div className="mk-db-top">
                <div className="mk-stat"><div className="val">R$3.240</div><div className="lbl">Faturamento hoje</div><div className="delta">+12% vs ontem</div></div>
                <div className="mk-stat"><div className="val">47</div><div className="lbl">Pedidos hoje</div><div className="delta">+8 vs ontem</div></div>
                <div className="mk-stat"><div className="val">R$68,90</div><div className="lbl">Ticket médio</div><div className="delta">+R$4,20</div></div>
              </div>
              <div className="mk-chart">
                <div className="mk-chart-title">Pedidos por hora</div>
                <div className="chart-bars">
                  {[20,15,10,18,35,55,70,90,75,60,45,38].map((h,i)=>(
                    <span key={i} style={{ height: `${h}%`, opacity: h===90?1:.7 }} />
                  ))}
                </div>
              </div>
              <div className="mk-orders">
                <div className="mk-order-row"><span className="num">#0041</span><span className="name">Mesa 3 — 2x Pizza, 1x Suco</span><span className="status s-prep">Em preparo</span></div>
                <div className="mk-order-row"><span className="num">#0040</span><span className="name">Delivery — Rua das Flores, 120</span><span className="status s-entregue">Saiu entrega</span></div>
                <div className="mk-order-row"><span className="num">#0039</span><span className="name">Retirada — João Silva</span><span className="status s-pronto">Pronto</span></div>
                <div className="mk-order-row"><span className="num">#0038</span><span className="name">Mesa 7 — 1x Hambúrguer, 2x Refri</span><span className="status s-aguard">Aguardando</span></div>
              </div>
            </div>
            <div className="bcard-label"><h3>Dashboard</h3><p>Visão geral em tempo real — pedidos, faturamento e métricas</p></div>
          </div>

          {/* KITCHEN */}
          <div className="bcard bc-kitchen">
            <div className="mk-kitchen">
              <div className="mk-kitchen-head"><span>Cozinha</span><span style={{ color: "var(--wine)", fontSize: ".65rem", fontWeight: 700 }}>● 4 ativos</span></div>
              {[
                { id: "#0041", name: "Mesa 3 — 2 itens", items: "2x Pizza Margherita · 1x Suco Laranja", fill: "85%", cls: "hot", time: "18min", urgent: true },
                { id: "#0040", name: "Delivery — Rua das Flores", items: "1x X-Bacon · 1x Batata Frita G", fill: "55%", cls: "warn", time: "11min", urgent: false },
                { id: "#0039", name: "Retirada — João Silva", items: "1x Combo Frango", fill: "20%", cls: "", time: "4min", urgent: false },
              ].map(k => (
                <div key={k.id} className={`mk-kcard${k.urgent ? " urgent" : ""}`}>
                  <div className="knum">{k.id}</div>
                  <div className="kname">{k.name}</div>
                  <div className="kitems">{k.items}</div>
                  <div className="ktime">
                    <div className="ktime-bar"><div className={`ktime-fill${k.cls ? ` ${k.cls}` : ""}`} style={{ width: k.fill }} /></div>
                    <span style={{ fontSize: ".58rem", fontWeight: 700, color: k.cls === "hot" ? "#f87171" : k.cls === "warn" ? "var(--amber)" : "var(--green)" }}>{k.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bcard-label"><h3>Painel da Cozinha</h3><p>Fila de preparo com temporizadores e prioridade</p></div>
          </div>

          {/* MENU MOBILE */}
          <div className="bcard bc-menu-mobile">
            <div className="mk-phone">
              <div className="mk-phone-bar">
                <div>
                  <div className="rest">Restaurante Sabor & Arte</div>
                  <div className="sub-rest">Aberto agora · Entrega ~35min</div>
                </div>
              </div>
              <div className="mk-menu-items">
                <div className="mk-menu-cat">Pizzas</div>
                {[
                  { emoji: "🍕", bg: "#2a1a1a", name: "Pizza Margherita", desc: "Molho, mussarela, manjericão", price: "R$38" },
                  { emoji: "🫑", bg: "#1a2a1a", name: "Pizza Calabresa", desc: "Molho, calabresa, cebola", price: "R$42" },
                ].map(item => (
                  <div key={item.name} className="mk-menu-item">
                    <div className="mk-item-img" style={{ background: item.bg }}>{item.emoji}</div>
                    <div className="mk-item-info">
                      <div className="mk-item-name">{item.name}</div>
                      <div className="mk-item-desc">{item.desc}</div>
                    </div>
                    <div><div className="mk-item-price">{item.price}</div><div className="mk-add-btn">+</div></div>
                  </div>
                ))}
                <div className="mk-menu-cat">Hambúrgueres</div>
                {[
                  { emoji: "🍔", bg: "#2a1f0a", name: "X-Bacon", desc: "180g, bacon, queijo, alface", price: "R$32" },
                  { emoji: "🥤", bg: "#0a1a2a", name: "Suco Natural", desc: "Laranja, limão ou maracujá", price: "R$12" },
                ].map(item => (
                  <div key={item.name} className="mk-menu-item">
                    <div className="mk-item-img" style={{ background: item.bg }}>{item.emoji}</div>
                    <div className="mk-item-info">
                      <div className="mk-item-name">{item.name}</div>
                      <div className="mk-item-desc">{item.desc}</div>
                    </div>
                    <div><div className="mk-item-price">{item.price}</div><div className="mk-add-btn">+</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bcard-label"><h3>Cardápio Digital</h3><p>Menu online com QR code — cliente pede pelo celular</p></div>
          </div>

          {/* TRACKING */}
          <div className="bcard bc-tracking">
            <div className="mk-track">
              <div className="mk-track-code">Pedido #0041</div>
              <div className="mk-track-title">Em preparo na cozinha</div>
              <div className="mk-steps">
                {[
                  { dot: "✓", dotCls: "done", lineCls: "done", label: "Recebido", sub: "" },
                  { dot: "2", dotCls: "active", lineCls: "", label: "Em preparo", sub: "Na cozinha agora" },
                  { dot: "3", dotCls: "", lineCls: "", label: "Saiu para entrega", sub: "" },
                  { dot: "4", dotCls: "", lineCls: null, label: "Entregue!", sub: "" },
                ].map((s, i) => (
                  <div key={i} className="mk-step">
                    <div className="mk-step-left">
                      <div className={`mk-step-dot${s.dotCls ? ` ${s.dotCls}` : ""}`}>{s.dot}</div>
                      {s.lineCls !== null && <div className={`mk-step-line${s.lineCls ? ` ${s.lineCls}` : ""}`} />}
                    </div>
                    <div className="mk-step-text">
                      <div className={`st${s.dotCls ? ` ${s.dotCls}` : ""}`}>{s.label}</div>
                      {s.sub && <div className="sd">{s.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bcard-label"><h3>Rastreio do Pedido</h3><p>Cliente acompanha em tempo real no celular</p></div>
          </div>

          {/* TABLES */}
          <div className="bcard bc-tables">
            <div className="mk-tables">
              <div style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Mapa de Mesas</div>
              <div className="mk-tables-grid">
                {["occ","","occ","part","","occ","part",""].map((cls, i) => (
                  <div key={i} className={`mk-table${cls ? ` ${cls}` : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width={12} height={12}>
                      <rect x="3" y="9" width="18" height="3" rx="1"/><path d="M6 12v6M18 12v6"/>
                    </svg>
                    Mesa {i+1}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {[["var(--wine)","Ocupada"],["var(--amber)","Conta pedida"],["var(--border)","Livre"]].map(([color, label]) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: ".6rem", color: color === "var(--border)" ? "var(--muted)" : color }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="bcard-label"><h3>Gestão de Mesas</h3><p>Mapa de ocupação com QR code por assento</p></div>
          </div>

          {/* DELIVERY */}
          <div className="bcard bc-delivery">
            <div className="mk-delivery">
              <div style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Entregas ativas</div>
              {[
                { id: "#0040", addr: "Rua das Flores, 120 — Apto 4", eta: "Entregador: Carlos · ~8 min", pct: "72%", bColor: "var(--wine)", badge: "Saiu", badgeStyle: { background: "rgba(201,64,112,.15)", color: "var(--wine)" } },
                { id: "#0037", addr: "Av. Brasil, 850 — Bl. B", eta: "Entregador: Ana · 2 min atrás", pct: "100%", bColor: "var(--green)", badge: "Entregue", badgeStyle: { background: "rgba(74,222,128,.15)", color: "var(--green)" } },
                { id: "#0042", addr: "Rua Ipê, 33", eta: "Aguardando entregador", pct: "30%", bColor: "var(--blue)", badge: "Preparando", badgeStyle: { background: "rgba(96,165,250,.15)", color: "var(--blue)" } },
              ].map(d => (
                <div key={d.id} className="mk-del-row">
                  <div className="dtop">
                    <div className="dnum">{d.id}</div>
                    <span style={{ fontSize: ".58rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, ...d.badgeStyle }}>{d.badge}</span>
                  </div>
                  <div className="daddr">{d.addr}</div>
                  <div className="deta">{d.eta}</div>
                  <div className="prog"><span style={{ width: d.pct, background: d.bColor }} /></div>
                </div>
              ))}
            </div>
            <div className="bcard-label"><h3>Gestão de Entregas</h3><p>Controle de entregadores e status em tempo real</p></div>
          </div>

          {/* REPORTS */}
          <div className="bcard bc-reports">
            <div className="mk-reports">
              <div className="mk-rep-left">
                <div style={{ display: "flex", gap: 10 }}>
                  <div className="mk-rep-card" style={{ flex: 1 }}><div className="rl">Faturamento do mês</div><div className="rv">R$ 48.230</div></div>
                  <div className="mk-rep-card" style={{ flex: 1 }}><div className="rl">Total de pedidos</div><div className="rv">842</div></div>
                </div>
                <div className="mk-big-chart">
                  <div className="ct">Faturamento diário — outubro</div>
                  <svg width="100%" viewBox="0 0 280 60" preserveAspectRatio="none" height="56">
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c94070" stopOpacity=".4" />
                        <stop offset="100%" stopColor="#c94070" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 C20,40 40,50 60,35 C80,20 100,30 120,22 C140,14 160,28 180,18 C200,8 220,20 240,12 C260,4 280,10 280,8 L280,60 L0,60 Z" fill="url(#ag)" />
                    <path d="M0,45 C20,40 40,50 60,35 C80,20 100,30 120,22 C140,14 160,28 180,18 C200,8 220,20 240,12 C260,4 280,10 280,8" fill="none" stroke="#c94070" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div className="mk-rep-right">
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Top produtos</div>
                <div className="mk-rep-list">
                  {[["Pizza Margherita","R$3.840"],["X-Bacon","R$2.960"],["Combo Frango","R$2.420"],["Batata Frita G","R$1.890"],["Suco Natural","R$1.260"]].map(([n,v])=>(
                    <div key={n} className="mk-rep-item"><span>{n}</span><b>{v}</b></div>
                  ))}
                </div>
                <div className="mk-rep-card" style={{ marginTop: "auto" }}>
                  <div className="rl">Fechamento de hoje</div>
                  <div className="rv" style={{ fontSize: "1.1rem" }}>R$ 3.240</div>
                  <div style={{ fontSize: ".62rem", color: "var(--green)", marginTop: 2 }}>47 pedidos · ticket R$68,90</div>
                </div>
              </div>
            </div>
            <div className="bcard-label"><h3>Relatórios & Fechamento de Caixa</h3><p>Análise de vendas, top produtos e fechamento diário</p></div>
          </div>

          {/* WAITER */}
          <div className="bcard bc-waiter">
            <div className="mk-waiter">
              <div className="mk-waiter-head">
                App do Garçom
                <div className="mk-waiter-sub">Turno: noite · 3 mesas ativas</div>
              </div>
              <div className="mk-notif">
                <span className="bell">🔔</span>
                <div className="ntxt"><span>Mesa 4</span> pediu a conta</div>
              </div>
              <div className="mk-waiter-tabs">
                <div className="mk-wtab a">Minhas mesas</div>
                <div className="mk-wtab">Chamados</div>
              </div>
              {[["Mesa 1","2x Pizza · 2x Refri","22min · R$120,00"],["Mesa 3","1x X-Bacon · 1x Suco","8min · R$44,00"],["Mesa 7","3x Combo Frango","3min · R$138,00"]].map(([n,i,t])=>(
                <div key={n} className="mk-wcard">
                  <div className="wn">{n}</div>
                  <div className="wi">{i}</div>
                  <div className="wt">Pedido há {t}</div>
                </div>
              ))}
            </div>
            <div className="bcard-label"><h3>App do Garçom</h3><p>Pedidos e chamadas de mesa direto no celular</p></div>
          </div>

          {/* SETTINGS */}
          <div className="bcard bc-settings">
            <div className="mk-settings">
              <div className="mk-stabs">
                <div className="mk-stab a">Empresa</div>
                <div className="mk-stab">Mesas</div>
              </div>
              <div className="mk-field"><div className="fl">Nome do restaurante</div><div className="fv">Sabor & Arte</div></div>
              <div className="mk-field"><div className="fl">Link do cardápio</div><div className="fv" style={{ color: "var(--wine)" }}>foodnex.app/sabor-arte</div></div>
              <div className="mk-toggle-row">
                <div><div className="tl">Aceitar pedidos</div><div className="tls">Restaurante aberto ao público</div></div>
                <div className="mk-tog" />
              </div>
              <div className="mk-toggle-row">
                <div><div className="tl">Delivery ativo</div><div className="tls">Receber pedidos de entrega</div></div>
                <div className="mk-tog" />
              </div>
              <div className="mk-field"><div className="fl">Taxa de entrega</div><div className="fv">R$ 5,00</div></div>
            </div>
            <div className="bcard-label"><h3>Configurações</h3><p>Horários, taxas, cardápio e controles do restaurante</p></div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────── PRICING ─────────────── */
type BillingCycle = "mensal" | "anual";

function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("anual");
  const monthly = 179.9, annual = 97.9;
  const price = billing === "mensal" ? monthly : annual;
  const annualTotal = annual * 12;
  const annualSaving = monthly * 12 - annualTotal;
  const items = [
    "Pedidos ilimitados","Usuários ilimitados","Cardápio digital com QR code",
    "Painel da cozinha em tempo real","Mesas, delivery e retirada",
    "App do garçom","Relatórios e fechamento de caixa",
    "Notificações WhatsApp","Suporte via chat","Atualizações incluídas",
  ];
  return (
    <section id="precos" style={{ padding: "96px 0", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 800 }}>Plano simples, sem surpresas</h2>
          <p style={{ marginTop: 10, color: "var(--muted)" }}>Um único plano com tudo incluso. Sem limite de usuários ou pedidos.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 4 }}>
            {(["mensal","anual"] as BillingCycle[]).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: ".85rem", fontWeight: 600, padding: "9px 20px", borderRadius: 10,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                background: billing === b ? "var(--wine)" : "transparent",
                color: billing === b ? "#fff" : "var(--muted)",
                transition: "all .15s",
              }}>
                {b === "mensal" ? "Mensal" : "Anual"}
                {b === "anual" && (
                  <span style={{
                    fontSize: ".6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                    background: billing === "anual" ? "rgba(255,255,255,.2)" : "var(--wine-dim)",
                    color: billing === "anual" ? "#fff" : "var(--wine)",
                  }}>-45%</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 460, marginInline: "auto", background: "var(--card)", border: "2px solid var(--wine)", borderRadius: 24, padding: 40, boxShadow: "0 0 80px var(--wine-glow)" }}>
          <p style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--wine)" }}>Plano completo</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 12 }}>
            <strong style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>
              R$ {price.toFixed(2).replace(".", ",")}
            </strong>
            <span style={{ fontSize: ".9rem", color: "var(--muted)", paddingBottom: 6 }}>/mês</span>
          </div>
          {billing === "anual" && (
            <>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 4 }}>Cobrado R$ {annualTotal.toFixed(2).replace(".", ",")} à vista</p>
              <p style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--green)", marginTop: 2 }}>Você economiza R$ {annualSaving.toFixed(2).replace(".", ",")} por ano</p>
            </>
          )}
          <ul style={{ listStyle: "none", margin: "28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--wine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/cadastro" style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "var(--wine)", color: "#fff", fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: "1rem", fontWeight: 700, padding: "16px", borderRadius: 14,
            transition: "background .15s",
          }}>
            Começar 7 dias grátis
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p style={{ textAlign: "center", fontSize: ".72rem", color: "var(--muted)", marginTop: 10 }}>Sem cartão de crédito · Cancele quando quiser</p>
        </div>
        <p style={{ textAlign: "center", fontSize: ".72rem", color: "var(--muted)", marginTop: 28 }}>Os valores podem ser reajustados conforme novas funcionalidades forem adicionadas.</p>
      </div>
    </section>
  );
}

/* ─────────────── FAQ ─────────────── */
const faqs = [
  { q: "Preciso de equipamento especial?", a: "Não. O FoodNex funciona em qualquer dispositivo com navegador. Para imprimir comandas você precisará de uma impressora térmica 80mm." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Sem fidelidade. Cancele quando quiser e não será cobrado no próximo ciclo." },
  { q: "O período de teste é gratuito?", a: "Sim, 7 dias completamente grátis, sem precisar de cartão de crédito." },
  { q: "Quantos funcionários posso cadastrar?", a: "Ilimitado. Cozinheiros, garçons e entregadores sem custo extra." },
  { q: "Os valores podem mudar?", a: "Podem ser reajustados com novas funcionalidades, mas clientes ativos são avisados com 30 dias de antecedência." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ padding: "96px 0", background: "var(--card)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 720, marginInline: "auto", paddingInline: 24 }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 800, marginBottom: 48 }}>Perguntas frequentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((item, i) => (
            <div key={i} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, padding: "18px 22px", background: "none", border: "none",
                fontFamily: "inherit", fontSize: ".88rem", fontWeight: 600,
                color: "var(--foreground)", cursor: "pointer", textAlign: "left",
              }}>
                {item.q}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transition: "transform .2s", transform: open === i ? "rotate(180deg)" : "none" }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: "0 22px 18px", fontSize: ".84rem", color: "var(--muted)", lineHeight: 1.7 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--background) 82%, transparent)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBlock: 15 }}>
          <span style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "var(--wine)", letterSpacing: "-.02em" }}>FoodNex</span>
          <nav style={{ display: "flex", gap: 28, fontSize: ".85rem", color: "var(--muted)" }}>
            <a href="#sistema" style={{ transition: "color .15s" }}>Sistema</a>
            <a href="#precos" style={{ transition: "color .15s" }}>Preços</a>
            <a href="#faq" style={{ transition: "color .15s" }}>FAQ</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ fontSize: ".85rem", color: "var(--muted)", padding: "8px 12px", borderRadius: 10 }}>Entrar</Link>
            <Link href="/cadastro" style={{
              fontSize: ".85rem", fontWeight: 600, background: "var(--wine)", color: "#fff",
              padding: "9px 18px", borderRadius: 11,
            }}>Testar grátis</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <ScrollHero />

      {/* PROOF BAR */}
      <div style={{ borderBlock: "1px solid var(--border)", background: "var(--card)", paddingBlock: 22 }}>
        <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px 40px", textAlign: "center" }}>
          {[["7 dias","teste gratuito"],["3 modos","mesa, delivery, retirada"],["Tempo real","pedidos ao vivo"],["1 plano","tudo incluso"]].map(([v,l])=>(
            <div key={l}>
              <p style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: "1.5rem", fontWeight: 800 }}>{v}</p>
              <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BENTO */}
      <BentoMockups />

      {/* PRICING */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* CTA FINAL */}
      <section style={{ borderTop: "1px solid var(--border)", background: "var(--wine-dim)", paddingBlock: 96, textAlign: "center" }}>
        <div style={{ maxWidth: 720, marginInline: "auto", paddingInline: 24 }}>
          <h2 style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 800 }}>Pronto para modernizar seu restaurante?</h2>
          <p style={{ color: "var(--muted)", margin: "12px auto 36px", maxWidth: 480 }}>Comece grátis por 7 dias. Sem burocracia, sem cartão de crédito.</p>
          <Link href="/cadastro" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--wine)", color: "#fff", fontFamily: "'Sora', system-ui, sans-serif",
            fontSize: "1rem", fontWeight: 700, padding: "16px 36px", borderRadius: 16,
          }}>
            Criar minha conta grátis
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", paddingBlock: 28 }}>
        <div style={{ maxWidth: 1140, marginInline: "auto", paddingInline: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: ".78rem", color: "var(--muted)" }}>
          <span style={{ fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 800, color: "var(--wine)" }}>FoodNex</span>
          <span>Gestão inteligente de pedidos para restaurantes</span>
          <div style={{ display: "flex", gap: 22 }}>
            <Link href="/login">Entrar</Link>
            <Link href="/cadastro">Cadastrar</Link>
          </div>
        </div>
      </footer>

      <BentoStyles />
    </>
  );
}

/* ─────────────── BENTO CSS (injected) ─────────────── */
function BentoStyles() {
  return (
    <style>{`
      :root {
        --wine: #c94070;
        --wine-h: #e0507f;
        --wine-dim: rgba(201,64,112,0.12);
        --wine-glow: rgba(201,64,112,0.2);
        --green: #4ade80;
        --amber: #fbbf24;
        --blue: #60a5fa;
      }

      .bento-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-rows: 56px;
        gap: 16px;
      }
      .bcard {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: border-color .2s, transform .2s;
        position: relative;
      }
      .bcard:hover { border-color: var(--wine); transform: translateY(-2px); }
      .bcard-label {
        position: absolute; bottom: 0; left: 0; right: 0;
        padding: 12px 16px 14px;
        background: linear-gradient(0deg, rgba(13,13,15,.95) 0%, rgba(13,13,15,0) 100%);
        z-index: 5;
      }
      .bcard-label h3 { font-size: .82rem; font-weight: 700; color: #f0f0f2; }
      .bcard-label p { font-size: .72rem; color: rgba(240,240,242,.6); margin-top: 2px; }

      .bc-dashboard   { grid-column: 1 / 8;  grid-row: 1 / 9;  }
      .bc-kitchen     { grid-column: 8 / 13; grid-row: 1 / 6;  }
      .bc-menu-mobile { grid-column: 8 / 11; grid-row: 6 / 14; }
      .bc-tracking    { grid-column: 11/ 13; grid-row: 6 / 14; }
      .bc-tables      { grid-column: 1 / 5;  grid-row: 9 / 15; }
      .bc-delivery    { grid-column: 5 / 8;  grid-row: 9 / 15; }
      .bc-reports     { grid-column: 1 / 7;  grid-row: 15/ 22; }
      .bc-waiter      { grid-column: 7 / 10; grid-row: 14/ 22; }
      .bc-settings    { grid-column: 10/ 13; grid-row: 14/ 22; }

      /* DASHBOARD */
      .mk-dashboard { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
      .mk-db-top { display: flex; gap: 10px; }
      .mk-stat { flex: 1; background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
      .mk-stat .val { font-family: 'Sora', sans-serif; font-size: 1.15rem; font-weight: 800; }
      .mk-stat .lbl { font-size: .65rem; color: var(--muted); margin-top: 1px; }
      .mk-stat .delta { font-size: .65rem; color: var(--green); font-weight: 600; }
      .mk-chart { flex: 1; background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
      .mk-chart-title { font-size: .68rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
      .chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 52px; }
      .chart-bars span { flex: 1; border-radius: 4px 4px 0 0; background: var(--wine); }
      .mk-orders { display: flex; flex-direction: column; gap: 6px; }
      .mk-order-row { display: flex; align-items: center; gap: 8px; background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 8px; padding: 7px 10px; font-size: .7rem; }
      .mk-order-row .num { font-weight: 700; color: var(--wine); min-width: 36px; }
      .mk-order-row .name { flex: 1; }
      .mk-order-row .status { padding: 2px 8px; border-radius: 99px; font-size: .6rem; font-weight: 700; }
      .s-prep { background: rgba(251,191,36,.15); color: var(--amber); }
      .s-pronto { background: rgba(74,222,128,.15); color: var(--green); }
      .s-entregue { background: rgba(201,64,112,.15); color: var(--wine); }
      .s-aguard { background: rgba(96,165,250,.15); color: var(--blue); }

      /* KITCHEN */
      .mk-kitchen { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
      .mk-kitchen-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
      .mk-kitchen-head span { font-size: .65rem; font-weight: 700; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
      .mk-kcard { background: var(--card2, #1f1f23); border-radius: 10px; border: 1px solid var(--border); padding: 10px 12px; }
      .mk-kcard.urgent { border-color: rgba(251,191,36,.4); }
      .mk-kcard .knum { font-size: .65rem; color: var(--wine); font-weight: 700; }
      .mk-kcard .kname { font-size: .75rem; font-weight: 600; margin-top: 1px; }
      .mk-kcard .kitems { font-size: .65rem; color: var(--muted); margin-top: 3px; }
      .mk-kcard .ktime { margin-top: 6px; display: flex; align-items: center; gap: 4px; font-size: .62rem; font-weight: 700; }
      .ktime-bar { flex: 1; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
      .ktime-fill { height: 100%; border-radius: 2px; background: var(--green); }
      .ktime-fill.warn { background: var(--amber); }
      .ktime-fill.hot { background: #f87171; }

      /* MENU MOBILE */
      .mk-phone { flex: 1; display: flex; flex-direction: column; background: #0d0d0f; }
      .mk-phone-bar { background: #1a1a1d; padding: 10px 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); }
      .mk-phone-bar .rest { font-size: .7rem; font-weight: 700; }
      .mk-phone-bar .sub-rest { font-size: .6rem; color: var(--muted); }
      .mk-menu-items { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
      .mk-menu-cat { font-size: .6rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--wine); padding: 8px 12px 4px; }
      .mk-menu-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid rgba(42,42,46,.6); }
      .mk-item-img { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
      .mk-item-info { flex: 1; min-width: 0; }
      .mk-item-name { font-size: .68rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .mk-item-desc { font-size: .58rem; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .mk-item-price { font-size: .68rem; font-weight: 700; color: var(--wine); }
      .mk-add-btn { width: 20px; height: 20px; border-radius: 6px; background: var(--wine); display: flex; align-items: center; justify-content: center; color: #fff; font-size: .85rem; font-weight: 700; flex-shrink: 0; }

      /* TRACKING */
      .mk-track { flex: 1; display: flex; flex-direction: column; background: #0d0d0f; padding: 14px; gap: 10px; }
      .mk-track-code { font-size: .6rem; color: var(--muted); font-weight: 600; }
      .mk-track-title { font-size: .78rem; font-weight: 700; }
      .mk-steps { display: flex; flex-direction: column; gap: 0; flex: 1; }
      .mk-step { display: flex; gap: 8px; }
      .mk-step-left { display: flex; flex-direction: column; align-items: center; }
      .mk-step-dot { width: 18px; height: 18px; border-radius: 99px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .5rem; font-weight: 800; color: var(--muted); flex-shrink: 0; }
      .mk-step-dot.done { background: var(--wine); border-color: var(--wine); color: #fff; }
      .mk-step-dot.active { border-color: var(--wine); color: var(--wine); background: rgba(201,64,112,.1); }
      .mk-step-line { width: 2px; flex: 1; background: var(--border); margin: 2px 0; min-height: 16px; }
      .mk-step-line.done { background: var(--wine); }
      .mk-step-text { padding-bottom: 14px; }
      .mk-step-text .st { font-size: .65rem; font-weight: 600; color: var(--muted); }
      .mk-step-text .st.done { color: var(--wine); }
      .mk-step-text .st.active { color: var(--foreground); }
      .mk-step-text .sd { font-size: .58rem; color: var(--muted); }

      /* TABLES */
      .mk-tables { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
      .mk-tables-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
      .mk-table { aspect-ratio: 1; border-radius: 10px; border: 2px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: .6rem; font-weight: 700; color: var(--muted); gap: 2px; }
      .mk-table.occ { border-color: var(--wine); background: var(--wine-dim); color: var(--wine); }
      .mk-table.part { border-color: var(--amber); background: rgba(251,191,36,.08); color: var(--amber); }

      /* DELIVERY */
      .mk-delivery { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
      .mk-del-row { background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
      .mk-del-row .dtop { display: flex; justify-content: space-between; align-items: center; }
      .mk-del-row .dnum { font-size: .65rem; color: var(--wine); font-weight: 700; }
      .mk-del-row .daddr { font-size: .68rem; font-weight: 500; }
      .mk-del-row .deta { font-size: .6rem; color: var(--muted); }
      .mk-del-row .prog { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
      .mk-del-row .prog span { display: block; height: 100%; border-radius: 2px; }

      /* REPORTS */
      .mk-reports { padding: 20px; flex: 1; display: flex; gap: 16px; }
      .mk-rep-left { flex: 1.4; display: flex; flex-direction: column; gap: 10px; }
      .mk-rep-right { flex: 1; display: flex; flex-direction: column; gap: 10px; }
      .mk-rep-card { background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
      .mk-rep-card .rv { font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 800; }
      .mk-rep-card .rl { font-size: .65rem; color: var(--muted); }
      .mk-big-chart { flex: 1; background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
      .mk-big-chart .ct { font-size: .65rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
      .mk-rep-list { flex: 1; display: flex; flex-direction: column; gap: 5px; }
      .mk-rep-item { display: flex; align-items: center; justify-content: space-between; font-size: .68rem; padding: 6px 0; border-bottom: 1px solid var(--border); }
      .mk-rep-item span { font-weight: 500; }
      .mk-rep-item b { color: var(--wine); }

      /* WAITER */
      .mk-waiter { flex: 1; display: flex; flex-direction: column; background: #0d0d0f; }
      .mk-waiter-head { background: #1a1a1d; padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: .72rem; font-weight: 700; }
      .mk-waiter-sub { font-size: .6rem; color: var(--muted); font-weight: 400; }
      .mk-notif { margin: 10px 12px; background: rgba(201,64,112,.12); border: 1px solid rgba(201,64,112,.3); border-radius: 10px; padding: 8px 10px; display: flex; gap: 8px; align-items: flex-start; }
      .mk-notif .bell { color: var(--wine); font-size: .9rem; flex-shrink: 0; }
      .mk-notif .ntxt { font-size: .65rem; font-weight: 500; }
      .mk-notif .ntxt span { color: var(--wine); font-weight: 700; }
      .mk-waiter-tabs { display: flex; gap: 4px; padding: 0 12px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
      .mk-wtab { font-size: .62rem; font-weight: 600; padding: 6px 8px; color: var(--muted); border-bottom: 2px solid transparent; }
      .mk-wtab.a { color: var(--wine); border-bottom-color: var(--wine); }
      .mk-wcard { margin: 4px 12px; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; }
      .mk-wcard .wn { font-size: .65rem; color: var(--wine); font-weight: 700; }
      .mk-wcard .wi { font-size: .7rem; font-weight: 500; }
      .mk-wcard .wt { font-size: .62rem; color: var(--muted); }

      /* SETTINGS */
      .mk-settings { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
      .mk-stabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
      .mk-stab { font-size: .62rem; font-weight: 600; padding: 4px 10px; border-radius: 8px; background: var(--card2, #1f1f23); border: 1px solid var(--border); color: var(--muted); }
      .mk-stab.a { background: var(--wine-dim); border-color: rgba(201,64,112,.4); color: var(--wine); }
      .mk-field { background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
      .mk-field .fl { font-size: .6rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
      .mk-field .fv { font-size: .72rem; font-weight: 500; }
      .mk-toggle-row { display: flex; align-items: center; justify-content: space-between; background: var(--card2, #1f1f23); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
      .mk-toggle-row .tl { font-size: .72rem; font-weight: 500; }
      .mk-toggle-row .tls { font-size: .6rem; color: var(--muted); }
      .mk-tog { width: 32px; height: 18px; border-radius: 99px; background: var(--wine); position: relative; flex-shrink: 0; }
      .mk-tog::after { content: ''; position: absolute; top: 2px; right: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; }

      /* RESPONSIVE */
      @media (max-width: 900px) {
        .bento-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: auto; }
        .bc-dashboard, .bc-kitchen, .bc-menu-mobile, .bc-tracking,
        .bc-tables, .bc-delivery, .bc-reports, .bc-waiter, .bc-settings {
          grid-column: auto; grid-row: auto;
        }
        .bcard { min-height: 220px; }
        .bc-dashboard { grid-column: 1 / -1; min-height: 280px; }
        .bc-reports { grid-column: 1 / -1; min-height: 280px; }
      }
      @media (max-width: 560px) {
        .bento-grid { grid-template-columns: 1fr; }
        .bc-dashboard, .bc-reports { grid-column: 1; }
      }
    `}</style>
  );
}
