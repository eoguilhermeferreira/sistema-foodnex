import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SYNCPAY_BASE_URL!;
const CLIENT_ID = process.env.SYNCPAY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SYNCPAY_CLIENT_SECRET!;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const res = await fetch(`${BASE}/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  // cache com 5 min de margem
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  return cachedToken.token;
}

export async function POST(req: NextRequest) {
  try {
    const { period, method } = await req.json();
    // period: "monthly" | "annual"
    // method: "card" | "pix"

    const token = await getAccessToken();

    // Planos cadastrados no painel Sync Payments:
    // Substitua pelos IDs reais após criar os planos no painel
    const PLAN_IDS: Record<string, string> = {
      monthly: process.env.SYNCPAY_PLAN_MONTHLY ?? "",
      annual: process.env.SYNCPAY_PLAN_ANNUAL ?? "",
    };

    const planId = PLAN_IDS[period];
    if (!planId) {
      return NextResponse.json(
        { error: "Plano não configurado. Adicione SYNCPAY_PLAN_MONTHLY e SYNCPAY_PLAN_ANNUAL nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    // Cria a sessão de checkout (link de pagamento)
    const checkoutRes = await fetch(`${BASE}/subscriptions/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        payment_method: method === "card" ? "credit_card" : "pix_automatico",
      }),
    });

    const checkout = await checkoutRes.json();

    if (!checkoutRes.ok) {
      return NextResponse.json({ error: checkout }, { status: checkoutRes.status });
    }

    const url = checkout.checkout_url ?? checkout.url ?? checkout.link ?? checkout.payment_url;
    if (!url) {
      return NextResponse.json({ error: "API não retornou URL de checkout", raw: checkout }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
