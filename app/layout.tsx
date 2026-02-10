import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PoGo Ranker | PvP Optimizer",
  description: "Gerencie seu inventário de Pokémon GO para o competitivo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        {/* Você pode colocar um Navbar global aqui se desejar */}
        {children}
      </body>
    </html>
  );
}