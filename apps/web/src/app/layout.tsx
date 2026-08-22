import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Explora Bolivia | Vinos y gastronomía",
  description: "Maridajes bolivianos explicables y exploración territorial 3D.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
