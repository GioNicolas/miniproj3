// Mensagem de erro da rede, igual à das telas de login e cadastro.
export function Erro({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-perigo-fundo px-3 py-2 text-sm text-perigo">
      {children}
    </p>
  );
}
