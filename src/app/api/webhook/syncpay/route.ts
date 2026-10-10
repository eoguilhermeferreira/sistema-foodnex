import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const WEBHOOK_SECRET = process.env.SYNCPAY_WEBHOOK_SECRET!;

function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(payload);
  const expected = hmac.digest("hex");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-syncpay-signature") ?? req.headers.get("x-signature") ?? "";

  if (WEBHOOK_SECRET && signature && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = (event.type ?? event.event ?? event.status) as string | undefined;

  console.log("[syncpay webhook]", type, JSON.stringify(event).slice(0, 300));

  if (type && (type.includes("subscription") || type.includes("transaction"))) {
    const subscription = (event.subscription ?? event.data) as Record<string, unknown> | undefined;
    const customerEmail = (
      (subscription?.customer as Record<string, unknown>)?.email ??
      (event.customer as Record<string, unknown>)?.email ??
      event.email
    ) as string | undefined;

    if (customerEmail) {
      console.log("[syncpay webhook] provision access for", customerEmail);
    }
  }

  return NextResponse.json({ received: true });
}
