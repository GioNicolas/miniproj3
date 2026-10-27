# Guia 00 — Setup (do zero ao `make check` verde)

Meta deste guia: **todo mundo do time** com o ambiente verde antes de começar. Se algo
falhar, procure a mensagem na seção de erros no fim — cada uma tem o conserto
exato. Não gaste mais de 1h nisso sozinho: travou, chame monitor.

## O que instalar (uma vez só)

Você precisa de 4 coisas. Python **não** está na lista — o `uv` cuida dele.

| Ferramenta | Para quê | Como instalar |
|---|---|---|
| **git** | versionar em equipe | já vem no macOS/Linux; Windows: dentro do WSL (abaixo) |
| **uv** | Python + dependências do backend | https://docs.astral.sh/uv/getting-started/installation/ |
| **node 20+** | rodar o frontend | de preferência via nvm: https://github.com/nvm-sh/nvm |
| **make** | os comandos `make check`, `make test`... | macOS: `xcode-select --install` · Ubuntu/WSL: `sudo apt install make` |

## macOS / Linux

```bash
# 1. uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# feche e reabra o terminal, depois:
uv --version
# → uv 0.9.x

# 2. node via nvm (instale o nvm pelo link acima primeiro)
nvm install 22 && nvm use 22
node --version
# → v22.x.x
```

## Windows — use WSL2 (recomendação forte)

Todo o projeto (make, uvicorn, caminhos de arquivo) assume um terminal Linux.
No Windows nativo até dá para sofrer, mas **ninguém vai te dar suporte nele**.
O caminho suportado é WSL2:

```powershell
# PowerShell como administrador:
wsl --install
# reinicie o PC quando pedir; na primeira abertura do Ubuntu, crie usuário/senha
```

A partir daqui, **tudo acontece dentro do terminal Ubuntu** (procure "Ubuntu"
no menu iniciar): siga a seção "macOS / Linux" acima, incluindo
`sudo apt update && sudo apt install make git`.

No VS Code, instale a extensão **WSL** e abra o projeto com
`code .` de dentro do Ubuntu — assim o editor, o terminal e os arquivos vivem
no mesmo lugar. Clone o repo **dentro** do WSL (em `~/`), nunca em
`/mnt/c/...` (é lento e dá problema de permissão).

## Clonar e validar

```bash
# aceite o link do GitHub Classroom (cria o repo do seu time), depois:
git clone <url-do-repo-do-seu-time>
cd <nome-do-repo>

# backend
cd backend && uv sync && cd ..
# → Resolved N packages ... (uv baixa o Python 3.12 sozinho se precisar)

# frontend
cd frontend && npm install && cp .env.local.example .env.local && cd ..

# o momento da verdade:
make check
```

Saída esperada:

```
check_setup — validando o ambiente

  ✓ python 3.12
  ✓ uv instalado
  ✓ node v22.x.x
  ✓ backend responde: GET /usuarios → 200
  ✓ core/ conectado: GET /usuarios/stats → 200

tudo verde — próximos passos: make seed, make dev-back, make dev-front
```

Verde? Vá para a seção **"Como começar"** do README. É lá que o projeto
começa de verdade.

## Erros comuns de instalação

**`✗ python 3.9 — precisa de 3.11+`** (ou qualquer versão velha)
Causa clássica: Python da Anaconda ou do sistema na frente no PATH. Você
**não precisa consertar o PATH**: o projeto roda tudo via `uv run`, que usa o
Python certo (pinado em `backend/.python-version`). Rode:
```bash
cd backend && uv python install 3.12 && uv sync
make check
```
Se ainda acusar versão velha, você rodou `python scripts/...` direto — sempre
`uv run python scripts/...` (o Makefile já faz isso por você).

**`✗ node v16.x — precisa de 20+`**
```bash
nvm install 22 && nvm use 22 && nvm alias default 22
```
Sem nvm: desinstale o node antigo e instale o atual em https://nodejs.org.

**`command not found: make`**
macOS: `xcode-select --install`. Ubuntu/WSL: `sudo apt install make`.
Windows fora do WSL: volte para a seção Windows — é sério.

**`command not found: uv` logo depois de instalar**
O instalador mexeu no seu perfil de shell — feche e **reabra o terminal**.

**`npm install` explode com erro de permissão ou de versão**
Confira `node --version` (20+) e se você está na pasta `frontend/`. Em WSL,
confira que o repo está em `~/...` e não em `/mnt/c/...`.
