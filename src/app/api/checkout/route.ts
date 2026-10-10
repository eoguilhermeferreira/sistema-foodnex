import { NextRequest, NextResponse } from "next/server";

const CHECKOUT_URLS: Record<string, string> = {
  monthly: "https://syncpaycheckout.com/checkout/a2f24391-21ae-4289-b358-b20574018eca+a2f24202-b015-4bd5-bb43-855b707c0945",
  annual: "https://syncpaycheckout.com/checkout/a2f251fa-b562-4b2c-94a4-e3ecc20ae290+a2f250ea-f3bc-4dd9-abd6-5e5bbe535e8d",
};

export async function POST(req: NextRequest) {
  const { period } = await req.json();
  const url = CHECKOUT_URLS[period];
  if (!url) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }
  return NextResponse.json({ url });
}
