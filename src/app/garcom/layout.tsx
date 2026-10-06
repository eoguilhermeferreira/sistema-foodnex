import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garçom — FoodNex",
};

export default function GarcomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
