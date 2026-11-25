import { redirect } from "next/navigation";

// /treinos fica para a árvore de progressões (#10). Até ela entrar, a aba
// Treinos da Navbar leva direto ao registro.
export default function TreinosPage() {
  redirect("/treinos/registrar");
}
