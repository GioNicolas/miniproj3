import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders_Stencil, Work_Sans } from "next/font/google";

import { GuardaDeRota } from "@/components/GuardaDeRota";
import { Navbar } from "@/components/Navbar";
import { GLOSSARIO } from "@/lib/glossario";
import "./globals.css";

// Archivo larga e itálica faz o impacto (marca, título, botão principal); Work Sans
// faz a leitura (todo o resto). Big Shoulders Stencil é só para números grandes.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});
// adjustFontFallback: false porque o Next não tem as medidas dessa fonte para ajustar a reserva.
const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-stencil",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: GLOSSARIO.rede,
  description: "Rede de calistenia para iniciantes da UFPB. Constância vence força.",
};

// viewportFit "cover" libera o env(safe-area-inset-bottom) usado na barra do celular.
// themeColor pinta a barra do navegador no celular com o fundo da rede.
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0d1220" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${stencil.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-fundo font-corpo text-tinta">
        <Navbar />
        {/* pb-24: espaço para a barra inferior do celular não cobrir o conteúdo */}
        <main className="mx-auto max-w-xl px-5 pb-28 pt-2 md:pb-10 md:pt-8">
          <GuardaDeRota>{children}</GuardaDeRota>
        </main>
      </body>
    </html>
  );
}
