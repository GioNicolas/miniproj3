// Tudo que mexe no token salvo no login fica aqui.

export const ROTAS_PUBLICAS = ["/login", "/registro"];

export function sair() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
