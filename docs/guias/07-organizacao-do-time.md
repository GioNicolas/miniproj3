# Guia 07: como organizar o time

A turma tem 7 times: 4 de 4 pessoas e 3 de 3. As regras e os limites de pontos
são os mesmos para todos (ver [`RUBRICA.md`](../../RUBRICA.md)).

## A regra que define a divisão

Na defesa, cada pessoa altera ao vivo uma feature de menu que é dela, e isso
passa por `core/`, endpoint e teste. Por isso ninguém pode ficar só no front.

Dividam o trabalho em duas camadas:

1. **Features, de ponta a ponta.** Quem é dono de uma feature faz o `core/`, o
   endpoint, o teste autoral e a tela dela.
2. **Uma área por pessoa.** Além das próprias features, cada pessoa cuida de
   uma parte que é de todo mundo: base do front, núcleo, deploy, produto.

A área é onde a pessoa revisa os PRs dos outros e resolve o que trava o time.
Ela não faz sozinha o trabalho daquela área.

## Time de 3

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Base do front: layout, navegação, `lib/api.ts`, componentes reaproveitados | Auth (back e front), Perfil |
| B | Back: modelos, `main.py`, revisão dos PRs de backend | Posts, Feed, Curtidas, Comentários |
| C | Produto e entrega: seed do nicho, deploy, vídeo, pitch | Follow, Seed fake |

Menu: o intermediário fecha em 40 com 8 features M, e o avançado em 25 com
três features. São 11 features, umas 4 por pessoa. Cada pessoa pega pelo menos
uma M ou G.

## Time de 4

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Base do front: layout, navegação, `lib/api.ts`, componentes reaproveitados | Auth (back e front) |
| B | Back: modelos, `main.py`, revisão dos PRs de backend | Posts, Feed, Comentários |
| C | Dados e entrega: seed do nicho, benchmarks, deploy | Follow, Curtidas, Seed fake |
| D | Produto: seção Produto do `DECISIONS.md`, vídeo, pitch, testes de uso | Perfil |

Menu: as mesmas 11 features, umas 3 por pessoa. Com uma pessoa a mais, sobra
tempo para o que dá bônus: deploy (+5) e até 3 features além do limite (+3).

## Por onde começar

1. **Dia 1, todo mundo:** `make check` verde, nicho escolhido, seção Produto
   do `DECISIONS.md` preenchida, donos na tabela e uma issue por feature.
2. **Auth primeiro.** Quase todo teste do núcleo depende dela. Enquanto a
   pessoa A faz auth, os outros escrevem as estruturas do `core/`, que são
   Python puro e não precisam de login para serem testadas.
3. **Núcleo antes do menu.** Feature de menu em cima de núcleo quebrado não
   passa no teste oculto.
4. **Menu em paralelo.** Uma branch por feature. O conflito mais comum é em
   `main.py`; a receita está no [guia 02](02-git-em-equipe.md).

## Combinados que evitam briga

- Quem aprova o PR não é quem escreveu, e a pessoa da área revisa os PRs dela.
- Feature parada há dois dias vira assunto do time, não segredo do dono.
- Antes da defesa, cada pessoa treina os [arquétipos](../defesa.md) na
  própria feature, sem IA.

Essa divisão é um ponto de partida. Podem trocar áreas e features, desde que
cada pessoa continue dona de pelo menos uma feature de menu M ou G.
