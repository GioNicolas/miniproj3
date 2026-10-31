# Guia 07: divisão do time

São 7 times: 4 de 4 pessoas e 3 de 3. A rubrica e os limites de pontos são os
mesmos para todos.

## O produto é de todo mundo

Nicho, público, problema, vídeo e pitch são decisões do time inteiro. Todo
mundo opina na seção Produto do `DECISIONS.md`. Treinar o senso de produto é o
objetivo do projeto, e ele não fica com uma pessoa só.

## Ninguém fica só no front

Cada pessoa aprende mais fazendo uma feature de ponta a ponta. Por isso o dono
de uma feature faz ela inteira: `core/`, endpoint, teste autoral e tela.

Além das features, cada pessoa cuida de uma área e revisa os PRs que mexem
nela:

- **Backend:** models, routers, services e `main.py`.
- **Frontend:** layout, navegação e `frontend/lib/api.ts`.
- **Dados:** seed, estruturas do `core/`, benchmarks e deploy.

## Time de 3

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Frontend | Auth, Perfil |
| B | Backend | Posts, Feed, Curtidas, Comentários |
| C | Dados | Follow, Seed fake |

Para fechar 40 + 25 no menu são umas 11 features, cerca de 4 por pessoa.

## Time de 4

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Frontend | Auth |
| B | Backend | Posts, Feed, Comentários |
| C | Dados | Follow, Curtidas, Seed fake |
| D | Reforça a área mais carregada (por exemplo, deploy e benchmarks) | Perfil |

As mesmas 11 features dão cerca de 3 por pessoa. O tempo que sobra pode ir
para o bônus: deploy e features além do limite.

Nos dois casos, cada pessoa precisa ser dona de pelo menos uma feature de menu
M ou G. Podem trocar áreas e features à vontade dentro dessa regra.

## Ordem de trabalho

1. Todo mundo com `make check` verde. Escolham o nicho, comecem a seção
   Produto e a tabela de donos do `DECISIONS.md` e abram uma issue por
   feature. O arquivo muda junto com o projeto, então não precisa ficar pronto.
2. A pessoa A faz auth, porque quase todo teste do núcleo depende dela.
   Enquanto isso, os outros escrevem as estruturas do `core/`: são Python puro
   e dá para testar sem login.
3. Terminem o núcleo antes do menu. O teste oculto de uma feature de menu
   falha se o núcleo estiver quebrado.
4. Uma branch por feature de menu. Conflito em `main.py` é o mais comum; a
   receita está no [guia 02](02-git-em-equipe.md).
