export default function Home() {
  return (
    <div className="space-y-3">
      <h1 className="font-titulo text-2xl">Feed</h1>
      <p className="text-suave">
        Aqui nasce o feed do seu nicho (feature do núcleo). Enquanto isso, veja
        o slice de exemplo em{" "}
        <a href="/usuarios" className="underline">
          /usuarios
        </a>{" "}
        — toda feature sua imita aquele caminho.
      </p>
    </div>
  );
}
