import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    "mailto:contato@foodnex.com.br",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await req.json();

  // Supabase webhook payload shape: { type, table, record, ... }
  const record = body.record ?? body;
  const company_id: string = record.company_id;
  const table_number: number = record.table_number;
  const customer_name: string = record.customer_name;

  if (!company_id) return NextResponse.json({ ok: true });

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("company_id", company_id);

  if (!subs || subs.length === 0) return NextResponse.json({ ok: true });

  const payload = JSON.stringify({
    title: "🛎️ Chamada de garçom",
    body: `Mesa ${table_number} — ${customer_name}`,
    tag: record.id ?? "call",
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  return NextResponse.json({ ok: true });
}
