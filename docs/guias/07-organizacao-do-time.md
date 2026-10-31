# Guia 07: divisão do time

São 7 times: 4 de 4 pessoas e 3 de 3. A avaliação é a mesma para todos.

## O produto é de todo mundo

Nicho, público, problema, vídeo e pitch são decisões do time inteiro. Todo
mundo opina na seção Produto do `DECISIONS.md`. Treinar o senso de produto é o
objetivo do projeto, e ele não fica com uma pessoa só.

## Ninguém fica só no front

Cada pessoa aprende mais fazendo uma feature de ponta a ponta. Por isso o dono
de uma feature faz ela inteira: backend, tela e, se usar, a estrutura em `core/`.

Além das features, cada pessoa cuida de uma área e revisa os PRs que mexem
nela:

- **Backend:** models, routers, services e `main.py`.
- **Frontend:** layout, navegação e `frontend/lib/api.ts`.
- **Dados:** seed, estruturas do `core/` e deploy.

## Time de 3

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Frontend | Auth, Perfil |
| B | Backend | Posts, Feed, Curtidas, Comentários |
| C | Dados | Follow, Seed fake |


## Time de 4

| Pessoa | Área | Núcleo |
|---|---|---|
| A | Frontend | Auth |
| B | Backend | Posts, Feed, Comentários |
| C | Dados | Follow, Curtidas, Seed fake |
| D | Reforça a área mais carregada (por exemplo, deploy e testes) | Perfil |

Se sobrar tempo, vale investir no deploy, que dá bônus.

Nos dois casos, cada pessoa é dona de pelo menos uma feature. Podem trocar áreas
e features à vontade.

## Ordem de trabalho

1. Todo mundo com `make check` verde. Escolham o nicho, comecem a seção
   Produto e a tabela de donos do `DECISIONS.md` e abram uma issue por
   feature. O arquivo muda junto com o projeto, então não precisa ficar pronto.
2. A pessoa A faz auth, porque quase todo teste do núcleo depende dela.
   Enquanto isso, os outros escrevem as estruturas do `core/`: são Python puro
   e dá para testar sem login.
3. Terminem o núcleo antes das outras features: quase tudo depende dele.
4. Uma branch por feature de menu. Conflito em `main.py` é o mais comum; a
   receita está no [guia 02](02-git-em-equipe.md).
