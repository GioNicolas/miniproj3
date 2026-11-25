"""Smoke test da URL pública (#14): o caminho que a banca vai fazer, de ponta a ponta.

Rode depois de cada deploy:
    cd backend && uv run python scripts/smoke.py
    cd backend && uv run python scripts/smoke.py http://localhost:8000 http://localhost:3000

Só usa a biblioteca padrão. Cria duas contas `smoke_*` descartáveis e apaga os
posts que criou; não mexe em nada do frango_demo (só lê). Sai com código 1 se
algum passo falhar.
"""

import json
import sys
import time
import urllib.error
import urllib.request

API = (sys.argv[1] if len(sys.argv) > 1 else "https://rede-trilha-api.onrender.com").rstrip("/")
ORIGEM = sys.argv[2] if len(sys.argv) > 2 else "https://miniproj3-six.vercel.app"
SENHA_DEMO = "senha-forte-123"
falhas: list[str] = []


def req(metodo: str, caminho: str, corpo=None, token: str | None = None, extra=None):
    cabecalhos = {"Content-Type": "application/json", "Origin": ORIGEM, **(extra or {})}
    if token:
        cabecalhos["Authorization"] = f"Bearer {token}"
    dados = json.dumps(corpo).encode() if corpo is not None else None
    pedido = urllib.request.Request(API + caminho, data=dados, method=metodo, headers=cabecalhos)
    try:
        # o plano free do Render dorme: a primeira resposta pode levar ~1 min
        with urllib.request.urlopen(pedido, timeout=120) as resposta:
            bruto = resposta.read()
            try:
                corpo = json.loads(bruto) if bruto else None
            except ValueError:  # o preflight de CORS responde texto
                corpo = bruto.decode(errors="replace")
            return resposta.status, corpo, resposta.headers
    except urllib.error.HTTPError as erro:
        return erro.code, erro.read().decode(errors="replace")[:200], erro.headers


def passo(nome: str, ok: bool, detalhe="") -> bool:
    print(f"{'ok   ' if ok else 'FALHA'} {nome}" + (f"  ({detalhe})" if detalhe != "" and not ok else ""))
    if not ok:
        falhas.append(nome)
    return ok


def logar(username: str, senha: str) -> str | None:
    status, corpo, _ = req("POST", "/auth/login", {"username": username, "password": senha})
    return corpo["token"] if status == 200 else None


def main() -> int:
    print(f"API {API}  |  origem {ORIGEM}\n")

    # CORS: o navegador da Vercel precisa poder chamar a API
    _, _, cabecalhos = req(
        "OPTIONS", "/auth/login", extra={"Access-Control-Request-Method": "POST",
                                        "Access-Control-Request-Headers": "content-type,authorization"}
    )
    passo("CORS libera a URL da Vercel", cabecalhos.get("access-control-allow-origin") == ORIGEM,
          cabecalhos.get("access-control-allow-origin"))

    # --- o que a banca vê entrando como frango_demo (só leitura) ---
    demo = logar("frango_demo", SENHA_DEMO)
    if passo("login do frango_demo (seed rodou)", demo is not None):
        status, feed, _ = req("GET", "/feed", token=demo)
        passo("feed do demo cheio", status == 200 and feed["total"] >= 20, status)
        status, granja, _ = req("GET", "/granja", token=demo)
        passo("Granja da Semana com pódio e patentes",
              status == 200 and len(granja["items"]) >= 3 and "nivel" in granja["items"][0]["usuario"], status)
        status, perfil, _ = req("GET", "/usuarios/frango_demo", token=demo)
        passo("perfil do demo com o frango", status == 200 and perfil["frango"]["nivel"] in
              ("Pintinho", "Frango", "Galo", "Monstro"), status)
        status, arvore, _ = req("GET", "/progressoes", token=demo)
        estados = {p["estado"] for p in arvore["progressoes"]} if status == 200 else set()
        passo("árvore com dominada, disponível e bloqueada", estados == {"dominada", "disponivel", "bloqueada"}, estados)
        status, conversas, _ = req("GET", "/conversas", token=demo)
        passo("chat do demo com conversas", status == 200 and conversas["total"] >= 3, status)
        status, _, _ = req("GET", "/explorar", token=demo)
        passo("explorar", status == 200, status)

    # --- o caminho de quem acabou de chegar: cadastro → post → follow → feed ---
    sufixo = time.strftime("%H%M%S")
    contas = [f"smoke_a{sufixo}", f"smoke_b{sufixo}"]
    tokens = {}
    for username in contas:
        status, _, _ = req("POST", "/auth/registro",
                           {"username": username, "name": "Smoke Test", "password": "senha-smoke-123"})
        passo(f"cadastro de {username}", status == 201, status)
        tokens[username] = logar(username, "senha-smoke-123")
    a, b = contas
    if not passo("login das contas novas", all(tokens.values())):
        return 1

    status, treino, _ = req("POST", "/treinos", {"texto": "Smoke: negativa na barra",
                            "exercicios": [{"progressao": "barra_negativa", "series": 3, "reps": 5}]}, tokens[a])
    passo("A registra um treino", status == 201, status)
    status, _, _ = req("POST", "/treinos", {"texto": "x", "exercicios": [{"progressao": "supino"}]}, tokens[a])
    passo("treino fora da árvore é recusado", status == 422, status)
    status, post, _ = req("POST", "/posts", {"texto": "Smoke: alguém tem dica pra australiana?"}, tokens[b])
    passo("B posta", status == 201, status)

    status, _, _ = req("POST", f"/usuarios/{a}/follow", token=tokens[b])
    passo("B segue A", status == 204, status)
    status, feed, _ = req("GET", "/feed", token=tokens[b])
    autores = [p["autor"]["username"] for p in feed["items"]] if status == 200 else []
    passo("feed de B traz B e A, mais novo primeiro", autores[:2] == [b, a], autores)

    if treino and isinstance(treino, dict):
        status, _, _ = req("POST", f"/posts/{treino['id']}/curtir", token=tokens[b])
        passo("B dá tamo junto no treino de A", status == 204, status)
        status, _, _ = req("POST", f"/posts/{treino['id']}/comentarios", {"texto": "Boa!"}, tokens[b])
        passo("B comenta", status == 201, status)
        status, perfil, _ = req("GET", f"/usuarios/{a}", token=tokens[b])
        passo("A já tem frango e B aparece como seguidor",
              status == 200 and perfil["frango"]["forca"] > 0 and perfil["seguidores"] == 1, status)
        status, granja, _ = req("GET", "/granja", token=tokens[b])
        passo("A entra na Granja de B", status == 200 and any(
            c["usuario"]["username"] == a and c["dias_treinados"] == 1 for c in granja["items"]), status)

    status, conversa, _ = req("POST", "/conversas", {"participantes": [a]}, tokens[b])
    if passo("B abre conversa com A", status in (200, 201), status):
        req("POST", f"/conversas/{conversa['id']}/mensagens", {"texto": "bora na barra?"}, tokens[b])
        status, lidas, _ = req("GET", "/conversas/nao-lidas", token=tokens[a])
        passo("A vê a mensagem não lida", status == 200 and lidas["total"] == 1, lidas)

    status, _, _ = req("GET", "/feed")
    passo("feed sem login dá 401", status == 401, status)

    for dono, criado in ((a, treino), (b, post)):
        if isinstance(criado, dict):
            req("DELETE", f"/posts/{criado['id']}", token=tokens[dono])

    print(f"\n{'tudo certo' if not falhas else f'{len(falhas)} falha(s): ' + '; '.join(falhas)}")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
