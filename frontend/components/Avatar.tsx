import type { Patente } from "@/lib/glossario";

const ANEL: Record<Patente, string> = {
  Pintinho: "border-patente-pintinho",
  Frango: "border-patente-frango",
  Galo: "border-patente-galo",
  Monstro: "border-patente-monstro",
};

const TAMANHO = {
  p: "h-8 w-8 border-2 text-[11px]",
  m: "h-11 w-11 border-[3px] text-[13px]",
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const duas = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : partes[0]?.slice(0, 2) ?? "";
  return duas.toUpperCase();
}

// Avatar com anel da cor da patente. Sem patente (o backend ainda não manda), o anel some.
export function Avatar({
  name,
  avatarUrl,
  patente,
  tamanho = "m",
}: {
  name: string;
  avatarUrl: string;
  patente?: Patente;
  tamanho?: keyof typeof TAMANHO;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevado font-semibold text-tinta ${TAMANHO[tamanho]} ${patente ? ANEL[patente] : "border-transparent"}`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        iniciais(name)
      )}
    </div>
  );
}
