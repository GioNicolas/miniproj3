# Guia 08 — Deploy público (bônus +5)

Uma receita só, ponta a ponta: backend no **Render** (free), front na
**Vercel** (free). O bônus é verificado na defesa: o avaliador abre a sua URL
e percorre cadastro → login → post → follow → feed. Gravar o vídeo contra a
URL pública é recomendado, não obrigatório.

## Antes de começar: os 3 avisos do free tier

1. **O filesystem é efêmero**: a cada deploy ou restart, o `app.db` (SQLite) e
   a pasta `uploads/` **somem**. Para uma demo isso é aceitável — desde que o
   banco renasça populado (passo 2).
2. **Cold start**: sem tráfego, o Render hiberna o serviço; a primeira request
   demora ~1 minuto. **Abra a URL uns minutos antes da demo/defesa.**
3. Nunca ligue `DEBUG=true` em produção — o bypass de auth viraria porta aberta.

## Passo 1 — backend no Render

1. [render.com](https://render.com) → New → **Web Service** → conecte o repo do time.
2. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install uv && uv sync --frozen`
   - **Start Command**: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
3. Em **Environment**, adicione `SEED_ON_BOOT=true` (e NADA de `DEBUG`).

## Passo 2 — banco renasce populado (`SEED_ON_BOOT`)

No lifespan do `main.py`, logo depois do `create_all`/rebuild:

```python
import os

if os.environ.get("SEED_ON_BOOT") == "true":
    from scripts.seed import main as rodar_seed  # ou seu seed_fake
    rodar_seed()
```

Como o filesystem zera a cada restart, "resetar o banco" vira feature: a demo
sempre começa com a rede populada pelo seu seed fake.

## Passo 3 — CORS com a URL pública

O `allow_origins` do `main.py` só tem `localhost:3000`. Adicione o domínio que
a Vercel vai te dar (você pode voltar aqui depois do passo 4):

```python
allow_origins=[
    "http://localhost:3000",
    "https://SEU-FRONT.vercel.app",
],
```

Commite e o Render redeploya sozinho.

## Passo 4 — front na Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → importe o repo.
2. **Root Directory**: `frontend` (framework Next é detectado sozinho).
3. Em **Environment Variables**: `NEXT_PUBLIC_API_URL` = `https://SEU-BACK.onrender.com`.
4. Deploy. Volte ao passo 3 com a URL final do front, se ainda não colocou.

## Verificação

```bash
curl -s https://SEU-BACK.onrender.com/usuarios | head -c 120
# (a primeira pode demorar ~1 min — cold start)
# → {"items":[...],"total":...}
```

Depois, na URL da Vercel: cadastro → login → post → follow → feed, o mesmo
fluxo do vídeo. Funcionou aí = funciona na defesa.

## Pós-defesa: de entrega a portfólio

Quando o repo virar público (o export acontece **depois** da defesa), 15
minutos transformam entrega em portfólio:

- [ ] README com o pitch do nicho (2 parágrafos), 2–3 screenshots e a URL pública no topo
- [ ] `RUBRICA.md`/`CATALOGO.md` movidos para `docs/` (são material da disciplina, não do produto)
- [ ] **MANTENHA o `DECISIONS.md`** com os benchmarks — "medi trie vs bisect e
      aqui estão os números" é exatamente o que impressiona num portfólio
- [ ] URL viva (free tier hiberna, mas volta sozinho)
