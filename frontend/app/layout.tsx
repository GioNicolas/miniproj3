import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders_Stencil } from "next/font/google";

import { GuardaDeRota } from "@/components/GuardaDeRota";
import { Navbar } from "@/components/Navbar";
import { GLOSSARIO } from "@/lib/glossario";
import "./globals.css";

// Archivo variável (largura + peso): a mesma família faz o impacto (larga, itálica)
// e a leitura (normal). Big Shoulders Stencil é só para números.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
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
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#0e0f11" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${stencil.variable}`}>
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
