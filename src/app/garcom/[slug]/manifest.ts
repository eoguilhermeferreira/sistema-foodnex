import type { MetadataRoute } from "next";

export default function manifest({ params }: { params: { slug: string } }): MetadataRoute.Manifest {
  return {
    name: "Garçom — FoodNex",
    short_name: "Garçom",
    description: "Painel do garçom — chamadas em tempo real",
    start_url: `/garcom/${params.slug}`,
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#7f1d1d",
    icons: [
      { src: "/icon-512.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
