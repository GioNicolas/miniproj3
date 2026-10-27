# Rede Social da Trilha: Mini-projeto 3 (FullStack)

A turma tem 7 times: 4 de 4 pessoas e 3 de 3. Cada time vai construir uma rede
social de nicho usando este esqueleto: FastAPI + SQLAlchemy + SQLite no backend
e Next.js + TypeScript + Tailwind no frontend. Como dividir o trabalho:
[guia 07](docs/guias/07-organizacao-do-time.md).

O nicho pode ser música, corrida, leitura, jogos do campus ou qualquer outra
comunidade escolhida pelo time. Todos seguem o mesmo contrato de API, mas a
identidade do produto vive no conteúdo, no seed e na interface. Este é o treino
final antes do hackathon de novembro.

**Como vocês são avaliados**: [RUBRICA.md](RUBRICA.md) (leiam hoje; a nota é
calculada por script e o pseudocódigo está lá). O cardápio de features:
[CATALOGO.md](CATALOGO.md). A API exata de cada feature de menu:
[CONTRATO.md](CONTRATO.md). A defesa oral: [docs/defesa.md](docs/defesa.md).

## Como começar

Na primeira vez, instalem as dependências do backend e do frontend:

```bash
cd backend
uv sync
cd ../frontend
npm install
cp .env.local.example .env.local
cd ..
```

Depois, validem o ambiente e executem o projeto:

```bash
make check      # valida o ambiente; tudo precisa ficar verde
make seed       # 3 usuários de exemplo
make test       # → "6 passed, 11 skipped"

# terminal 1
make dev-back   # abra localhost:8000/docs (Swagger)

# terminal 2
make dev-front  # abra localhost:3000/usuarios
```

Se algum comando falhar, consultem
[`docs/guias/00-setup.md`](docs/guias/00-setup.md) antes de continuar.

**Os testes são a especificação do núcleo.** `skipped` não é sucesso. É o
backlog do time: cada
`@skip` em `backend/tests/test_nucleo.py` é uma feature do núcleo esperando por
vocês (remova o skip → veja falhar → implemente até passar). Os testes das
features de menu são **ocultos**: rodam toda noite na infra do instrutor contra
o repo do time, e `make grade` mostra o último relatório (PASS/FAIL por feature +
uma dica citando o CONTRATO.md).

Depois do `make check` verde: leiam o slice de exemplo (`/usuarios`, do model à
página; toda feature de vocês imita esse caminho), escolham o nicho, preencham
os **donos** no [DECISIONS.md](DECISIONS.md) e criem **1 issue por feature**
(template pronto; o PR que entrega fecha com `Closes #N`).

## Regra central das features de menu

Toda feature de menu exige a estrutura de dados em `backend/app/core/` como
**Python puro**, e o endpoint tem que **usá-la de verdade**. O grader sabota o
`core/` do time, e o endpoint tem que quebrar junto. Imitem `core/contadores.py`.
Estrutura bonita que a API ignora = feature vale 0.

## Uso de IA

O uso de IA é permitido. O time deve registrar onde e como utilizou IA na seção
"Uso de IA" do `DECISIONS.md`.

Cada integrante precisa demonstrar domínio sobre o que foi entregue. Na defesa,
vocês devem explicar as decisões, localizar o código e modificar uma feature ao
vivo, sem IA. Entregar código que ninguém do time entende compromete a
pontuação, independentemente de como ele foi produzido.

## Datas

| Marco | Data |
|---|---|
| Início | **[DATA DE INÍCIO]** |
| Entrega final | **24/10/2026** |

Achou um bug no grader? Vale o que o `CONTRATO.md` diz. Abra uma issue no repo da
turma; correção em até ~48h e errata pública.

## Guias

`docs/guias/`: 00-setup · 01-autenticacao (comece por aqui!) · 02-git-em-equipe ·
03-boas-praticas · 04-erros-classicos · 05-jwt · 06-upload · 07-organizacao-do-time ·
08-deploy · 09-teste-autoral · 10-do-zero-ao-esqueleto. Para as features avançadas, usem
`docs/estruturas/` (grafos, árvores, heaps e tries).
