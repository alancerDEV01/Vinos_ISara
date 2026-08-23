import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Bolivia en la copa | IA sensorial y maridaje",
  description: "Plataforma inteligente y educativa de maridajes bolivianos explicables, patrimonio gastronómico y exploración territorial 3D.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
