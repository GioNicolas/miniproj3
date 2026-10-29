# Mini-projeto 3: rede social de nicho

Cada time constrói uma rede social para uma comunidade que escolhe (música,
corrida, leitura, jogos do campus...). A turma tem 7 times: 4 de 4 pessoas e
3 de 3. Todos partem do mesmo esqueleto (FastAPI + SQLAlchemy + SQLite no
backend, Next.js + TypeScript + Tailwind no frontend) e do mesmo núcleo
(cadastro, login, posts, feed, perfil, seguir, curtidas e comentários). Depois
disso, cada time escolhe as features do catálogo que quer construir e o nicho,
então cada rede acaba diferente da outra.

Este é o treino final antes do hackathon de novembro.

## O que ler

| Documento | Para quê |
|---|---|
| [RUBRICA.md](RUBRICA.md) | Como a nota é calculada. Leiam hoje. |
| [CATALOGO.md](CATALOGO.md) | As features que vocês podem escolher e quanto cada uma vale. |
| [CONTRATO.md](CONTRATO.md) | Rota, campos e status das features de menu. Vale só para as que o time escolher. |
| [DECISIONS.md](DECISIONS.md) | O que o time preenche: produto, donos, medições, uso de IA. |
| [docs/defesa.md](docs/defesa.md) | Como é a defesa oral. |
| [docs/guias/](docs/guias/) | Setup, autenticação, git em equipe, deploy e outros. |

## Como começar

Instalem as dependências uma vez:

```bash
cd backend && uv sync && cd ..
cd frontend && npm install && cp .env.local.example .env.local && cd ..
```

Depois validem o ambiente:

```bash
make check      # tudo precisa ficar verde
make seed       # cria 3 usuários de exemplo
make test       # deve mostrar "6 passed, 11 skipped"
```

Para rodar o projeto, abram dois terminais:

```bash
make dev-back   # API em localhost:8000, Swagger em localhost:8000/docs
make dev-front  # site em localhost:3000/usuarios
```

Se algum comando falhar, vejam o [guia 00](docs/guias/00-setup.md).

## Primeiros passos do time

1. Leiam o slice de exemplo (`/usuarios`, do model à página). Toda feature
   nova segue o mesmo caminho.
2. Escolham o nicho e preencham a seção Produto e a tabela de donos no
   [DECISIONS.md](DECISIONS.md).
3. Abram uma issue por feature (há um template). O PR que entrega a feature
   fecha a issue com `Closes #N`.
4. Façam o núcleo antes do menu. Divisão de trabalho sugerida: [guia 07](docs/guias/07-organizacao-do-time.md).

## Como os testes funcionam

- **Núcleo.** Os testes de `backend/tests/test_nucleo.py` são a especificação.
  Um teste `skipped` é uma feature ainda não entregue: removam o `@skip`,
  vejam o teste falhar e implementem até passar.
- **Menu.** Os testes das features de menu são ocultos. Rodam toda noite
  contra o repo do time, e `make grade` mostra o último relatório (PASS ou FAIL
  por feature, com uma dica que cita o `CONTRATO.md`).

## Regra das features de menu

Toda feature de menu precisa de uma estrutura de dados em `backend/app/core/`,
escrita em Python puro, e o endpoint tem que usá-la de verdade. O corretor
sabota o `core/` do time e o endpoint deve quebrar junto. Se a API ignora a
estrutura, a feature vale 0. Usem `core/contadores.py` como modelo.

## Uso de IA

IA é permitida. Registrem no `DECISIONS.md` onde e como vocês a usaram.

Na defesa cada integrante explica as decisões, localiza o código e altera uma
feature ao vivo, sem IA. Código que ninguém do time entende perde pontos,
independente de quem o escreveu.

## Prazos

| Marco | Data |
|---|---|
| Início | `[DATA DE INÍCIO]` |
| Entrega final | `[DATA DE ENTREGA]` |

## Bugs no corretor

Vale o que o `CONTRATO.md` diz. Se o corretor discordar do contrato, abram uma
issue neste repo. A correção sai em até 48 horas, com errata pública.

## Guias

Os guias ficam em `docs/guias/`: 00 setup, 01 autenticação (comecem por aqui),
02 git em equipe, 03 boas práticas, 04 erros clássicos, 05 JWT (opcional),
06 upload, 07 organização do time, 08 deploy, 09 teste autoral, 10 do zero ao
esqueleto. Para as features avançadas, vejam `docs/estruturas/` (grafos,
árvores, heaps e tries).
