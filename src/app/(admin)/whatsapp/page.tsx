"use client";

import { useEffect, useState, useCallback } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "qr" | "connected" | "error";

const EVOLUTION_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL ?? "";
const EVOLUTION_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY ?? "";

async function apiCall(path: string, method = "GET", body?: object) {
  const res = await fetch(`${EVOLUTION_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export default function WhatsAppPage() {
  const company = useCompany();
  const instanceName = `foodnex-${company.id}`;

  const [status, setStatus] = useState<Status>("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [savingPix, setSavingPix] = useState(false);
  const [pixSaved, setPixSaved] = useState(false);

  // load pix key from DB
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("companies")
      .select("pix_key")
      .eq("id", company.id)
      .single()
      .then(({ data }) => {
        if (data) setPixKey((data as any).pix_key ?? "");
      });
  }, [company.id]);

  const checkStatus = useCallback(async () => {
    if (!EVOLUTION_URL) return;
    try {
      const data = await apiCall(`/instance/connectionState/${instanceName}`);
      const state = data?.instance?.state ?? data?.state ?? data?.connectionStatus;
      if (state === "open") {
        setStatus("connected");
        setQrCode(null);
      } else if (state === "connecting" || state === "close") {
        setStatus("qr");
      }
    } catch {
      setStatus("idle");
    }
  }, [instanceName]);

  // poll while waiting for QR scan
  useEffect(() => {
    if (status !== "qr") return;
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [status, checkStatus]);

  async function connect() {
    if (!EVOLUTION_URL) {
      setErrorMsg("URL da Evolution API não configurada. Configure NEXT_PUBLIC_EVOLUTION_API_URL no ambiente.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      // create instance (v2: qr comes in the response)
      let createData: any = null;
      try {
        createData = await apiCall("/instance/create", "POST", {
          instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
        });
      } catch {
        // instance may already exist — ignore
      }

      // try to get base64 from create response first (v2.3+)
      let base64 =
        createData?.qrcode?.base64 ??
        createData?.base64 ??
        createData?.qr?.base64 ??
        null;

      // fallback: /instance/connect
      if (!base64) {
        try {
          const qrData = await apiCall(`/instance/connect/${instanceName}`);
          base64 = qrData?.base64 ?? qrData?.qrcode?.base64 ?? qrData?.code ?? null;
        } catch {}
      }
      if (base64) {
        setQrCode(base64);
        setStatus("qr");
      } else {
        // already connected?
        await checkStatus();
      }
    } catch (e: any) {
      setErrorMsg(e.message ?? "Erro ao conectar");
      setStatus("error");
    }
  }

  async function disconnect() {
    if (!EVOLUTION_URL) return;
    try {
      await apiCall(`/instance/logout/${instanceName}`, "DELETE");
    } catch {}
    setStatus("idle");
    setQrCode(null);
  }

  async function savePix() {
    setSavingPix(true);
    const supabase = createClient();
    await supabase.from("companies").update({ pix_key: pixKey } as any).eq("id", company.id);
    setSavingPix(false);
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 2500);
  }

  const notConfigured = !EVOLUTION_URL;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">WhatsApp</h1>
      <p className="mt-1 text-sm text-muted">
        Conecte o WhatsApp do seu estabelecimento para enviar confirmações automáticas aos clientes.
      </p>

      {/* status card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                status === "connected"
                  ? "bg-green-500"
                  : status === "qr" || status === "loading"
                  ? "bg-yellow-400"
                  : "bg-zinc-500"
              }`}
            />
            <p className="text-sm font-medium text-foreground">
              {status === "connected"
                ? "WhatsApp conectado"
                : status === "qr"
                ? "Aguardando leitura do QR Code..."
                : status === "loading"
                ? "Conectando..."
                : "WhatsApp desconectado"}
            </p>
          </div>

          {status === "connected" ? (
            <button
              onClick={disconnect}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              Desconectar
            </button>
          ) : status !== "loading" ? (
            <button
              onClick={connect}
              disabled={notConfigured}
              className="rounded-lg bg-wine px-4 py-1.5 text-sm font-medium text-white hover:bg-wine-hover disabled:opacity-50"
            >
              {status === "error" ? "Tentar novamente" : "Conectar WhatsApp"}
            </button>
          ) : null}
        </div>

        {/* QR Code */}
        {status === "qr" && qrCode && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <p className="text-sm text-muted text-center">
              Abra o WhatsApp no celular → <strong>Aparelhos conectados</strong> → <strong>Conectar aparelho</strong> → escaneie o QR Code abaixo
            </p>
            <div className="rounded-xl border border-border bg-white p-3">
              <img
                src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                className="h-52 w-52"
              />
            </div>
            <p className="text-xs text-muted">O QR Code expira em 60 segundos. Clique em "Tentar novamente" se expirar.</p>
          </div>
        )}

        {/* error */}
        {status === "error" && errorMsg && (
          <div className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* not configured warning */}
        {notConfigured && (
          <div className="mt-4 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
            <p className="font-medium">Evolution API não configurada</p>
            <p className="mt-1 text-xs">
              Configure as variáveis <code>NEXT_PUBLIC_EVOLUTION_API_URL</code> e <code>NEXT_PUBLIC_EVOLUTION_API_KEY</code> no ambiente (Vercel ou Railway).
            </p>
          </div>
        )}

        {/* connected info */}
        {status === "connected" && (
          <div className="mt-4 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Mensagens automáticas ativadas. Quando um cliente fizer um pedido, receberá a confirmação no WhatsApp.
          </div>
        )}
      </div>

      {/* chave pix */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Chave Pix</h2>
        <p className="mt-1 text-xs text-muted">
          Quando o cliente escolher Pix como pagamento, a chave será enviada automaticamente na mensagem de confirmação.
        </p>
        <div className="mt-4 flex gap-3">
          <input
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
            className="flex-1 rounded-lg border border-border bg-card-hover px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-wine"
          />
          <button
            onClick={savePix}
            disabled={savingPix}
            className="rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white hover:bg-wine-hover disabled:opacity-50"
          >
            {pixSaved ? "Salvo!" : savingPix ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {/* como funciona */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Como funciona</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted list-decimal list-inside">
          <li>Cliente faz o pedido no cardápio digital e informa o telefone</li>
          <li>Pedido confirmado → mensagem enviada automaticamente no WhatsApp do cliente</li>
          <li>Mensagem inclui: número do pedido, itens, total, forma de pagamento</li>
          <li>Se pagamento for Pix: a chave Pix do estabelecimento é enviada junto</li>
        </ol>
        <div className="mt-4 rounded-lg bg-card-hover px-4 py-3 text-xs text-muted">
          <p className="font-medium text-foreground mb-1">Exemplo de mensagem enviada:</p>
          <p>✅ Pedido <strong>#0042</strong> confirmado!</p>
          <p>━━━━━━━━━━━━━━━━</p>
          <p>🍕 1x Calabresa Grande</p>
          <p>🥤 2x Refrigerante Lata</p>
          <p>━━━━━━━━━━━━━━━━</p>
          <p>💰 Total: R$ 65,00</p>
          <p>💳 Pagamento: Pix</p>
          <p>🔑 Chave Pix: <em>[sua chave aqui]</em></p>
          <p>━━━━━━━━━━━━━━━━</p>
          <p>Obrigado pela preferência! 🙏</p>
        </div>
      </div>
    </div>
  );
}
