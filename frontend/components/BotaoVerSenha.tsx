// Botão "Mostrar / Ocultar" que fica dentro do campo de senha (login e cadastro).
export function BotaoVerSenha({ ver, alternar }: { ver: boolean; alternar: () => void }) {
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ver}
      aria-label={ver ? "Esconder a senha" : "Mostrar a senha"}
      className="min-h-11 min-w-11 rounded-r-[10px] px-4 text-[13px] font-semibold text-ceu focus-visible:outline-2 focus-visible:outline-ceu"
    >
      {ver ? "Ocultar" : "Mostrar"}
    </button>
  );
}
