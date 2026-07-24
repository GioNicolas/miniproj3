# Rede Social da Trilha — Mini-projeto 3 (FullStack)

Seu trio vai construir uma **rede social de nicho** — músicos, corredores,
leitores, gamers do campus, vocês escolhem — em cima deste esqueleto:
FastAPI + SQLAlchemy + SQLite no back, Next.js + TypeScript + Tailwind no front.
Mesmo contrato de API para todo mundo; o **nicho vive no conteúdo, no seed e na
UI**. É o treino final antes do hackathon de novembro.

**Como você é avaliado**: [RUBRICA.md](RUBRICA.md) (leia HOJE — a nota é
calculada por script e o pseudocódigo está lá). O cardápio de features:
[CATALOGO.md](CATALOGO.md). A API exata de cada feature de menu:
[CONTRATO.md](CONTRATO.md). A defesa oral: [docs/defesa.md](docs/defesa.md).

## Os primeiros 30 minutos

```bash
make check      # valida seu ambiente — TUDO verde antes de seguir (guia 00 se falhar)
make seed       # 3 usuários de exemplo
make dev-back   # backend em localhost:8000 — abra localhost:8000/docs (Swagger)
make dev-front  # noutro terminal — abra localhost:3000/usuarios
make test       # → "6 passed, 11 skipped"
```

**Os testes são a sua spec.** `skipped` não é sucesso — é o seu backlog: cada
`@skip` em `backend/tests/test_nucleo.py` é uma feature do núcleo esperando por
você (remova o skip → veja falhar → implemente até passar). Os testes das
features de menu são **ocultos**: rodam toda noite na infra do instrutor contra
o seu repo, e `make grade` mostra seu último relatório (PASS/FAIL por feature +
uma dica citando o CONTRATO.md).

Depois do `make check` verde: leiam o slice de exemplo (`/usuarios`, do model à
página — toda feature de vocês imita esse caminho), escolham o nicho, preencham
os **donos** no [DECISIONS.md](DECISIONS.md) e criem **1 issue por feature**
(template pronto; o PR que entrega fecha com `Closes #N`).

## A regra que separa aprovado de reprovado

Toda feature de menu exige a estrutura de dados em `backend/app/core/` como
**Python puro** — e o endpoint tem que **usá-la de verdade** (o grader sabota o
seu `core/` e o endpoint tem que quebrar junto). Imite `core/contadores.py`.
Estrutura bonita que a API ignora = feature vale 0.

## IA

**Permitida, com disclosure** (seção "Uso de IA" no DECISIONS.md). A
contrapartida: o que você entrega passa por testes que você nunca viu, e na
defesa você **modifica seu código ao vivo, sem IA**. Código que ninguém do trio
domina não pontua — gerado por IA ou não.

## Cronograma

| Quando | O quê |
|---|---|
| **[DATA] (dia 1–2)** | nicho, donos, issues; ninguém espera a auth (guia 01, Passo 0) |
| **[DATA] (dia 3)** | checkpoint de auth: testes de auth verdes + login no Swagger |
| **[DATA] (dia 4)** | branch break-glass publicada (custa só os pontos de auth) |
| **[DATA] (sexta)** | sexta do MVP: congelamento no DECISIONS.md + ensaio de defesa |
| **[DATA] (quarta, semana 2)** | quarta do deploy (plantão; bônus +5) |
| **[DATA] e [DATA]** | demo day (pitch ao vivo, 3 pts) + defesas (2 bancas, 2 tardes) |
| **24/10/2026** | entrega final |

Achou um bug no grader? Vale o que o CONTRATO.md diz — abra issue no repo da
turma; correção em até ~48h e errata pública.

## Guias

`docs/guias/`: 00-setup · 01-autenticacao (comece por aqui!) · 02-git-em-equipe ·
03-boas-praticas · 04-erros-classicos · 05-jwt · 06-upload · 08-deploy ·
09-teste-autoral · 10-do-zero-ao-esqueleto — e `docs/estruturas/` (grafos,
árvores, heaps, tries) para as features avançadas.
