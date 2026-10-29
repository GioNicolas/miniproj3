# Catálogo de features

Cada time escolhe um nicho e personaliza conteúdo, seed e interface. Rotas e
campos seguem o [`CONTRATO.md`](CONTRATO.md) e não mudam.

Uma feature de menu só pontua com os quatro requisitos da
[`RUBRICA.md`](RUBRICA.md): teste oculto passando, estrutura em
`backend/app/core/` (Python puro), endpoint que usa essa estrutura e linha
válida no `DECISIONS.md`. Para features do núcleo e do menu intermediário, o
time escolhe a estrutura, e a banca pergunta o porquê na defesa.

Esforço: P = pequeno, M = médio, G = grande.

## Núcleo

O núcleo vale 25 pontos. Os testes dele estão em `backend/tests/test_nucleo.py`,
marcados com `@skip` até o time implementar.

| Feature | Esforço | Descrição |
|---|---|---|
| Cadastro e login com hash de senha | M | Registro, login e autenticação por token. |
| Posts de texto (CRUD) | P | Criar, listar, editar e apagar posts. |
| Feed cronológico paginado | M | Posts mais novos primeiro, com offset e limit. |
| Perfil de usuário (avatar, bio) | M | Perfil editável com posts do usuário. |
| Seguir/seguidores | M | Follow, unfollow, listas e contadores. |
| Curtidas | P | Like e unlike idempotentes. |
| Comentários (lista plana) | M | Comentários em ordem cronológica. |
| Seed de dados fake | P | Usuários, posts, follows e likes para a demo. |

## Menu intermediário

Vale até 40 pontos. P vale 3, M vale 5 e G vale 7. No máximo três features P
pontuam.

| Feature | Esforço | Pontos | Descrição |
|---|---|---|---|
| Trending de hashtags | P | 3 | Top 5 tags das últimas 24 horas. |
| Feed 'Explorar' com filtro | P | 3 | Posts de todos, com filtro opcional. |
| Bookmarks (Salvos) | P | 3 | Salvar e remover posts numa lista privada. |
| Últimos N visitantes do perfil | P | 3 | Dez visitas mais recentes, sem repetição consecutiva. |
| Amigos em comum | P | 3 | Pessoas seguidas pelos dois usuários. |
| Streak de atividade | P | 3 | Dias consecutivos com posts. |
| Histórico de navegação com 'voltar' | P | 3 | Histórico de perfis e posts visitados. |
| Rate limit de posts | P | 3 | Limite por janela de tempo. |
| Hashtags com índice invertido | M | 5 | Índice tag para posts. |
| Notificações | M | 5 | Eventos sociais e contador de não lidas. |
| Busca de usuários por prefixo (busca binária) | M | 5 | Autocomplete de usernames. |
| Sugestões de quem seguir | M | 5 | Amigos de amigos ordenados por conexões. |
| Enquetes | M | 5 | Enquetes com um voto por usuário. |
| Feed ranqueado 'Em alta' | M | 5 | Posts ordenados por engajamento e idade. |
| Stories do dia (posts efêmeros) | M | 5 | Posts que expiram após 24 horas. |
| Nota/review com estrelas | M | 5 | Avaliação de 1 a 5 estrelas. |
| Menções @username | M | 5 | Detectar, linkar e notificar menções. |
| Busca de posts por palavra | M | 5 | Busca por interseção de termos. |
| Fila de moderação de denúncias | M | 5 | Denúncias processadas em FIFO. |
| Conta privada + pedidos de follow | M | 5 | Aceitar ou recusar solicitações. |
| Bloquear usuário | M | 5 | Remover relações e ocultar conteúdo. |
| Badges/conquistas | M | 5 | Conquistas sem duplicatas. |
| Listas/coleções curadas | M | 5 | Coleções públicas de posts. |
| Heatmap de atividade 7×24 | M | 5 | Posts agrupados por dia e hora. |
| Cache LRU de perfis | M | 5 | Cache com hits, misses e despejos. |
| Comunidades/grupos | G | 7 | Grupos com membros e feed próprio. |

## Menu avançado

Vale até 25 pontos. M vale 8 e G vale 10.

Cada avançada exige `scripts/bench_<feature>.py`, execução por `make bench`,
resultado no `DECISIONS.md` e uma frase interpretando a comparação. Sem medição
válida, vale 7 pontos e entra no bloco intermediário.

Upload não exige `core/` nem benchmark. Em DMs, o benchmark compara o dict de
conversas com uma varredura linear das mensagens.

| Feature | Estrutura de dados | Esforço | Pontos | Descrição |
|---|---|---|---|---|
| Posts com imagem (upload) | tecnologia extra | M | 8 | Upload local de jpg, png ou webp. |
| Graus de separação (BFS no grafo de follows) | grafo + BFS | M | 8 | Distância e caminho entre usuários. |
| Top-K com heap | heap | M | 8 | Posts mais curtidos da semana. |
| Comentários em árvore | árvore + recursão | G | 10 | Respostas aninhadas. |
| DMs 1-para-1 | dict de conversas + fila | G | 10 | Mensagens privadas por conversa. |
| Autocomplete com trie | trie | G | 10 | Sugestões de tags ou usernames por prefixo. |

Features fora deste catálogo podem melhorar o produto, mas não recebem pontos.
