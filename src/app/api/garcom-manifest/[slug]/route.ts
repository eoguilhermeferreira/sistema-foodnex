import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manifest = {
    name: "Garçom — FoodNex",
    short_name: "Garçom",
    description: "Painel do garçom — chamadas em tempo real",
    start_url: `/garcom/${slug}`,
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#7f1d1d",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
