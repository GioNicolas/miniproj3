import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";

import { GuardaDeRota } from "@/components/GuardaDeRota";
import { Navbar } from "@/components/Navbar";
import { GLOSSARIO } from "@/lib/glossario";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: GLOSSARIO.rede,
  description: "Rede de calistenia para iniciantes da UFPB. Constância vence força.",
};

// viewportFit "cover" libera o env(safe-area-inset-bottom) usado na barra do celular.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-fundo font-corpo text-tinta">
        <Navbar />
        {/* pb-24: espaço para a barra inferior do celular não cobrir o conteúdo */}
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:pb-6">
          <GuardaDeRota>{children}</GuardaDeRota>
        </main>
      </body>
    </html>
  );
}
