import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders_Stencil, Work_Sans } from "next/font/google";

import { GuardaDeRota } from "@/components/GuardaDeRota";
import { AjusteDoTeclado } from "@/components/AjusteDoTeclado";
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

const DESCRICAO = "Rede de calistenia para iniciantes da UFPB. Constância vence força.";

// Ícones e prévia do link vêm dos arquivos em app/ (favicon.ico, icon.png, apple-icon.png,
// opengraph-image.png) e do manifest.ts. metadataBase deixa a URL da imagem absoluta,
// que é o que o WhatsApp precisa para mostrar a prévia.
export const metadata: Metadata = {
  metadataBase: new URL("https://miniproj3-six.vercel.app"),
  title: GLOSSARIO.rede,
  description: DESCRICAO,
  applicationName: GLOSSARIO.rede,
  appleWebApp: { capable: true, title: GLOSSARIO.rede, statusBarStyle: "default" },
  openGraph: { type: "website", locale: "pt_BR", siteName: GLOSSARIO.rede, title: GLOSSARIO.rede, description: DESCRICAO },
  twitter: { card: "summary_large_image" },
};

// viewportFit "cover" libera o env(safe-area-inset-bottom) usado na barra do celular.
// themeColor pinta a barra do navegador no celular com o fundo da rede.
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#f5f2eb" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${stencil.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-fundo font-corpo text-tinta">
        <Navbar />
        <AjusteDoTeclado />
        {/* pb-24: espaço para a barra inferior do celular não cobrir o conteúdo */}
        <main className="mx-auto max-w-5xl px-5 pb-28 pt-2 md:pb-10 md:pt-8">
          <GuardaDeRota>{children}</GuardaDeRota>
        </main>
      </body>
    </html>
  );
}
