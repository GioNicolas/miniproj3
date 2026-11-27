import type { MetadataRoute } from "next";

// "Adicionar à tela inicial": abre como app, sem a barra do navegador, com o galo de ícone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Frangym",
    short_name: "Frangym",
    description: "Rede de calistenia para iniciantes da UFPB. Constância vence força.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2eb",
    theme_color: "#f5f2eb",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icones/icone-mascaravel-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
