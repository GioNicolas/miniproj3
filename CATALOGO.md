# Catálogo de features

O time escolhe um nicho, mas segue o mesmo contrato de API. Personalizem
conteúdo, seed e interface. Não mudem rotas ou campos do
[`CONTRATO.md`](CONTRATO.md).

Features de menu precisam de:

1. estrutura em `backend/app/core/` como Python puro;
2. endpoint usando essa estrutura;
3. dono e justificativa no `DECISIONS.md`;
4. pelo menos um teste autoral.

P = pequeno, M = médio, G = grande. A pontuação completa está na
[`RUBRICA.md`](RUBRICA.md).

## Núcleo

O núcleo vale 25 pontos e é definido pelos testes `@skip` em
`backend/tests/test_nucleo.py`.

| Feature | Estrutura | Esforço | Descrição |
|---|---|---|---|
| Cadastro e login com hash de senha | dict de sessões | M | Registro, login e autenticação por token. |
| Posts de texto (CRUD) | lista de registros | P | Criar, listar, editar e apagar posts. |
| Feed cronológico paginado | lista ordenada | M | Posts mais novos primeiro, com offset e limit. |
| Perfil de usuário (avatar, bio) | nenhuma | M | Perfil editável com posts do usuário. |
| Seguir/seguidores | dict de sets | M | Follow, unfollow, listas e contadores. |
| Curtidas | set de pares | P | Like e unlike idempotentes. |
| Comentários (lista plana) | lista | M | Comentários em ordem cronológica. |
| Seed de dados fake | listas e dicts | P | Usuários, posts, follows e likes para a demo. |

## Menu intermediário

Vale até 40 pontos. P vale 3, M vale 5 e G vale 7. No máximo três features P
pontuam.

| Feature | Estrutura de dados | Esforço | Pontos | Descrição |
|---|---|---|---|---|
| Trending de hashtags | Counter + ordenação | P | 3 | Top 5 tags das últimas 24 horas. |
| Feed 'Explorar' com filtro | lista + índice por tag | P | 3 | Posts de todos, com filtro opcional. |
| Bookmarks (Salvos) | set por usuário | P | 3 | Salvar e remover posts numa lista privada. |
| Últimos N visitantes do perfil | deque com maxlen | P | 3 | Dez visitas mais recentes, sem repetição consecutiva. |
| Amigos em comum | interseção de sets | P | 3 | Pessoas seguidas pelos dois usuários. |
| Streak de atividade | set de datas | P | 3 | Dias consecutivos com posts. |
| Histórico de navegação com 'voltar' | pilha | P | 3 | Histórico de perfis e posts visitados. |
| Rate limit de posts | deque de timestamps | P | 3 | Limite por janela de tempo. |
| Hashtags com índice invertido | dict de sets | M | 5 | Índice tag para posts. |
| Notificações | deque + set de lidas | M | 5 | Eventos sociais e contador de não lidas. |
| Busca de usuários por prefixo (busca binária) | lista ordenada + bisect | M | 5 | Autocomplete de usernames. |
| Sugestões de quem seguir | sets + Counter | M | 5 | Amigos de amigos ordenados por conexões. |
| Enquetes | dict + set de votantes | M | 5 | Enquetes com um voto por usuário. |
| Feed ranqueado 'Em alta' | ordenação por score | M | 5 | Posts ordenados por engajamento e idade. |
| Stories do dia (posts efêmeros) | fila por timestamp | M | 5 | Posts que expiram após 24 horas. |
| Nota/review com estrelas | média incremental | M | 5 | Avaliação de 1 a 5 estrelas. |
| Menções @username | dict de usernames | M | 5 | Detectar, linkar e notificar menções. |
| Busca de posts por palavra | índice invertido | M | 5 | Busca por interseção de termos. |
| Fila de moderação de denúncias | fila | M | 5 | Denúncias processadas em FIFO. |
| Conta privada + pedidos de follow | fila de pedidos | M | 5 | Aceitar ou recusar solicitações. |
| Bloquear usuário | set de bloqueados | M | 5 | Remover relações e ocultar conteúdo. |
| Badges/conquistas | set de badges | M | 5 | Conquistas sem duplicatas. |
| Listas/coleções curadas | lista + set | M | 5 | Coleções públicas de posts. |
| Heatmap de atividade 7×24 | matriz | M | 5 | Posts agrupados por dia e hora. |
| Cache LRU de perfis | dict + deque | M | 5 | Cache com hits, misses e despejos. |
| Comunidades/grupos | dict + sets | G | 7 | Grupos com membros e feed próprio. |

## Menu avançado

Vale até 25 pontos. M vale 8 e G vale 10.

Cada avançada exige `scripts/bench_<feature>.py`, execução por `make bench`,
resultado no `DECISIONS.md` e uma frase interpretando a comparação. Sem medição
válida, vale 7 pontos e entra no bloco intermediário.

Upload é tecnologia extra: não exige `core/` nem benchmark. DMs compara o dict
de conversas com uma varredura linear das mensagens.

| Feature | Estrutura de dados | Esforço | Pontos | Descrição |
|---|---|---|---|---|
| Posts com imagem (upload) | tecnologia extra | M | 8 | Upload local de jpg, png ou webp. |
| Graus de separação (BFS no grafo de follows) | grafo + BFS | M | 8 | Distância e caminho entre usuários. |
| Top-K com heap | heap | M | 8 | Posts mais curtidos da semana. |
| Comentários em árvore | árvore + recursão | G | 10 | Respostas aninhadas. |
| DMs 1-para-1 | dict de conversas + fila | G | 10 | Mensagens privadas por conversa. |
| Autocomplete com trie | trie | G | 10 | Sugestões de tags ou usernames por prefixo. |

## Apêndice

Features fora deste catálogo podem melhorar o produto, mas não recebem pontos
próprios.
