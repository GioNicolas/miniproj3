# Catálogo de features

Todo trio constrói sobre o **mesmo contrato de API** — rota, método, request e response de cada **feature de menu** estão no `CONTRATO.md` (divergir = teste falha = 0 na feature); o **núcleo** é especificado pelos testes `@skip` do template. O **nicho** do trio vive em conteúdo, seed e UI, nunca no contrato.

Cada feature intermediária/avançada exige: (a) estrutura implementada em `backend/app/core/` como Python puro testável (imite o padrão de `core/contadores.py`), (b) o endpoint **usando** o core (há teste-sabotagem), (c) linha na tabela do `DECISIONS.md` com dono nomeado, (d) ≥ 1 teste autoral do trio (sem ele, × 0,7). Os testes do grader para o menu são **ocultos** e rodam na infra do instrutor — o contrato exato está no `CONTRATO.md`. Na defesa oral, cada feature sorteada pontua em escala **100/50/0** conforme o dono explica e altera ao vivo (ver RUBRICA.md).

Pontuação: ver [RUBRICA.md](RUBRICA.md). Esforço: P = pequeno, M = médio, G = grande. Nas intermediárias a faixa de pontos segue o esforço (P = fácil 3 pts, M = média 5 pts, G = difícil 7 pts; **no máximo 3 fáceis pontuam**). Nas avançadas: M = 8 pts, G = 10 pts.

## Núcleo (obrigatório — 25 pts o bloco)

| Feature | Estrutura de dados | Esforço | Valor de produto | Descrição |
|---|---|---|---|---|
| Cadastro e login com hash de senha | dict/hash (sessões, lookup O(1)) | M | ★★★★★ | Registro/login seguindo o guia de auth, com hash de senha e sessões guardadas num dict token→user_id consultado em cada request. |
| Posts de texto (CRUD) | nenhuma (lista de registros) | P | ★★★★★ | Criar, listar, editar e deletar posts de texto exibidos em cards no feed. |
| Feed cronológico paginado | lista (ordenação + Big O da paginação) | M | ★★★★★ | Timeline do mais novo ao mais antigo com 'carregar mais' (offset/limit). |
| Perfil de usuário (avatar, bio) | nenhuma | M | ★★★★☆ | Página de perfil editável com avatar por URL, bio e listagem dos próprios posts. |
| Seguir/seguidores | dict user_id→set de seguidos | M | ★★★★★ | Follow/unfollow com contadores e listas 'seguidores'/'seguindo' clicáveis no perfil. |
| Curtidas | set de pares (user_id, post_id), checagem O(1) | P | ★★★★☆ | Like/unlike idempotente com contador e coração preenchido. |
| Comentários (lista plana) | lista | M | ★★★★☆ | Comentar posts, listados em ordem cronológica sob o post; 1 nível de resposta é extensão opcional. |
| Seed de dados fake | listas + dicts (geração de relacionamentos) | P | ★★★★★ | Script com faker que popula usuários, posts, follows e likes para a demo nunca parecer vazia. |

## Menu intermediário (mínimo 8 para nota cheia — cap 40 pts)

Estruturas já ensinadas, uso criativo.

| Feature | Estrutura de dados | Esforço | Pontos | Valor de produto | Descrição |
|---|---|---|---|---|---|
| Trending de hashtags | dict de contagem + sort; deque como variação | P | 3 (fácil) | ★★★★☆ | Painel com as top 5 tags das últimas 24h via Counter; variação com deque sliding window para 'última hora'. |
| Feed 'Explorar' com filtro | lista + dict (índices de filtro) | P | 3 (fácil) | ★★★★☆ | Aba com posts de todo mundo, filtrável por tag/canal. |
| Bookmarks (Salvos) | set de post_ids por usuário | P | 3 (fácil) | ★★★☆☆ | Salvar/remover posts numa aba privada 'Salvos'. |
| Últimos N visitantes do perfil | deque com maxlen | P | 3 (fácil) | ★★★☆☆ | Buffer das últimas 10 visitas ao perfil, sem duplicatas consecutivas. |
| Amigos em comum | sets (interseção/diferença) | P | 3 (fácil) | ★★★☆☆ | No perfil alheio, 'X e Y também seguem' via interseção dos conjuntos de seguidos. |
| Streak de atividade | set de datas (checagem O(1)) | P | 3 (fácil) | ★★★☆☆ | Dias consecutivos postando exibidos no perfil, com aviso de streak em risco. |
| Histórico de navegação com 'voltar' | pilha | P | 3 (fácil) | ★★☆☆☆ | Pilha de perfis/posts visitados na sessão com botão voltar que faz pop. |
| Rate limit de posts | deque + sliding window | P | 3 (fácil) | ★★☆☆☆ | Sliding window com deque de timestamps: só posta se houver menos de N posts nos últimos X minutos. |
| Hashtags com índice invertido | dict/hash + set (dedup de tags por post) | M | 5 (média) | ★★★★☆ | Extrair #tags do texto e manter dict tag→posts para abrir a página de cada tag clicável. |
| Notificações | fila/deque (eventos em ordem) + set de lidas | M | 5 (média) | ★★★★☆ | Sino com contador de não lidas e eventos (curtiu, seguiu, comentou, mencionou) marcáveis como lidos. |
| Busca de usuários por prefixo (busca binária) | lista ordenada + busca binária | M | 5 (média) | ★★★★☆ | Autocomplete de @username com lista ordenada (bisect.insort no cadastro) e bisect_left para achar o intervalo do prefixo. |
| Sugestões de quem seguir | sets + dict como Counter | M | 5 (média) | ★★★★☆ | Card 'quem seguir' com amigos-de-amigos, ordenado por quantos dos seus seguidos os seguem. |
| Enquetes | dict opção→contagem + set de votantes | M | 5 (média) | ★★★★☆ | Post-enquete com 2-4 opções, um voto por usuário e barra de resultados em %. |
| Feed ranqueado 'Em alta' | ordenação por chave composta (O(n log n) discutível) | M | 5 (média) | ★★★★☆ | Aba alternativa ordenada por score (curtidas + comentários com decaimento por idade). |
| Stories do dia (posts efêmeros) | fila (expiração FIFO por timestamp) | M | 5 (média) | ★★★★☆ | Post que expira em 24h e some do feed, com destaque no topo. |
| Nota/review com estrelas | dict item→lista de notas + média incremental | M | 5 (média) | ★★★★☆ | Post-review com nota 1-5 sobre item do nicho e média agregada na página do item. |
| Menções @username | dict (lookup de username O(1)) | M | 5 (média) | ★★★☆☆ | Detectar @usuario no texto, linkar pro perfil e notificar o mencionado. |
| Busca de posts por palavra | dict + interseção de sets | M | 5 (média) | ★★★☆☆ | Índice invertido palavra→set de post_ids com interseção de sets para múltiplos termos. |
| Fila de moderação de denúncias | fila/deque | M | 5 (média) | ★★★☆☆ | Denunciar post/usuário; painel de moderador (flag is_admin) processa a fila FIFO, sempre o mais antigo primeiro. |
| Conta privada + pedidos de follow | fila (pedidos em ordem de chegada) | M | 5 (média) | ★★★☆☆ | Toggle de conta privada; pedidos entram numa fila de solicitações para aceitar/recusar. |
| Bloquear usuário | set de bloqueados (filtro O(1) em todos os feeds) | M | 5 (média) | ★★★☆☆ | Bloqueado não vê perfil/posts nem pode seguir; follow mútuo é desfeito. |
| Badges/conquistas | set (badges conquistadas, sem duplicata) | M | 5 (média) | ★★★☆☆ | Badges (primeiro post, 10 seguidores, streak de 7 dias) checadas a cada ação e exibidas no perfil. |
| Listas/coleções curadas | dict coleção→lista ordenada / set de ids | M | 5 (média) | ★★★☆☆ | Coleções nomeadas de posts ou perfis (ex.: 'melhores do nicho'), públicas no perfil. |
| Heatmap de atividade 7×24 | matriz (lista de listas) | M | 5 (média) | ★★★☆☆ | Matriz dia×hora de posts/interações renderizada como heatmap estilo GitHub. |
| Cache LRU de perfis | LRU = dict + deque | M | 5 (média) | ★★☆☆☆ | Cache de perfis com capacidade fixa (dict + deque à mão, sem functools) e endpoint de debug com hits/misses/despejos. |
| Comunidades/grupos | dict grupo→posts + sets de membros | G | 7 (difícil) | ★★★★☆ | Criar e entrar em grupos do nicho com feed próprio e lista de membros. |

## Menu avançado (mínimo 3 para nota cheia — cap 25 pts)

Estruturas **não ensinadas** (grafo, árvore, heap, trie) ou tecnologia extra — as de estrutura nova têm mini-guia em `docs/estruturas/` (com a receita "Como medir" de 10 linhas). Toda avançada exige **medição real** contra a alternativa ingênua: números saídos de `scripts/bench_<feature>.py` (rodável via `make bench`) colados no `DECISIONS.md` **+ 1 frase de interpretação**. Sem medição válida, pontua como intermediária difícil (7 pts). A ingênua vencer em N pequeno é resultado válido — pontua a interpretação, não a vitória.

Duas exceções nomeadas: **Posts com imagem (upload)** é "tecnologia extra" — não tem estrutura possível, dispensa `core/` e medição; seus gates são o teste oculto, o guia 06 e a alteração sob medida na defesa. **DMs 1-para-1** usa estruturas já ensinadas (dispensa mini-guia); sua medição compara o dict de conversas vs varredura linear da tabela de mensagens.

| Feature | Estrutura de dados | Esforço | Pontos | Valor de produto | Descrição |
|---|---|---|---|---|---|
| Posts com imagem (upload) | nenhuma (tecnologia extra: upload/estáticos) | M | 8 | ★★★★☆ | Upload via FastAPI UploadFile salvo em pasta local e servido estático. |
| Graus de separação (BFS no grafo de follows) | grafo + BFS com fila + dict de predecessores | M | 8 | ★★★☆☆ | 'Você está a N conexões desta pessoa' via BFS, com extensão exibindo o caminho (você → Ana → alvo) por dict de predecessores. |
| Top-K com heap | heap (desafio avançado) | M | 8 | ★★★☆☆ | 'Top 10 da semana' com heapq.nlargest sobre o score em vez de ordenar tudo, explicando O(n log k). |
| Comentários em árvore | árvore (desafio avançado) | G | 10 | ★★★★☆ | Respostas aninhadas via parent_id, serializadas e renderizadas recursivamente com indentação e colapso. |
| DMs 1-para-1 | dict par de usuários→fila de mensagens | G | 10 | ★★★★☆ | Conversa privada com lista de conversas ordenada pela mais recente, atualizada por polling. |
| Autocomplete com trie | trie (desafio avançado) | G | 10 | ★★★☆☆ | Trie em memória de hashtags/usernames alimentando sugestão por prefixo em tempo real, comparável com a versão bisect. |

## Apêndice: features avaliadas e cortadas (27)

Cortadas da lista pontuada por não demonstrarem estrutura de dados ou por redundância. O trio **pode** fazê-las — deixam a demo melhor e podem aparecer no vídeo e no pitch, mas não valem pontos próprios (nem de feature, nem item extra no checklist de produto).

| Feature | Por que foi cortada |
|---|---|
| Repost/Retweet | Sem DS demonstrável (só uma FK); extra livre que não pontua estrutura na rubrica. |
| Post fixado no perfil | Sem DS real; cosmético, funde 2 duplicatas cortadas juntas. |
| Selo de verificado | Puro cosmético sem DS; não justifica vaga no catálogo pontuado. |
| Silenciar (mute) | Redundante com bloquear usuário — mesmo set de filtro, valor incremental mínimo. |
| Rascunhos | É um flag de status no modelo; sem DS e sem impacto na demo. |
| Rascunhos empilhados no editor | Uso forçado de pilha; a demonstração de pilha já está coberta pelo histórico 'voltar'. |
| Desfazer última ação (undo) | Pilha já demonstrada no histórico; reverter ações arbitrárias é traiçoeiro demais para iniciante. |
| Feed 'Novidades da plataforma' | Pilha forçada (é só ordem decrescente) e valor de produto baixo. |
| Onboarding pós-cadastro | 'Fila de etapas' é DS forçada; o seed de dados resolve o feed vazio muito mais barato. |
| Coordenadas/metadata imutável (tupla) | Tupla como chave é ponto didático fraco demais para sustentar uma feature; mencionar no DECISIONS.md basta. |
| Agendamento de posts | Resolvido por filtro published_at <= now na query; a fila de prioridade alegada nunca aparece de verdade. |
| Threads (fio de posts) | 'Lista encadeada na prática' é forçado e o valor de produto é marginal ao lado de comentários. |
| Feed 'para você' por tags seguidas | Redundante com Explorar filtrado + hashtags; interseção de sets já demonstrada em amigos em comum e busca. |
| Follows mútuos = 'amigos' | Regra de produto pequena, redundante com amigos em comum (mesma interseção de sets). |
| Analytics do perfil | Redundante com heatmap 7×24 + feed ranqueado; mesmas agregações com menos apelo visual. |
| Trending da última hora | Variação do trending de hashtags — absorvida como nota (deque sliding window) no item mantido. |
| Leaderboard/Ranking semanal de usuários | Redundante com feed ranqueado + top-K heap; bisect já demonstrado na busca de usuários. |
| Reações com emoji | Redundante com curtidas — mesmo padrão dict/set com mais UI para manter. |
| Verificação de username em tempo real | Set O(1) já demonstrado em likes/bookmarks/bloqueio; valor marginal. |
| Buscas recentes | Mesmo padrão deque maxlen dos últimos visitantes do perfil, que tem mais apelo social. |
| Sessões ativas / logout remoto | Extensão pequena da auth com valor de demo baixo; o dict de sessões já pontua no núcleo. |
| Preferências de notificação | Valor de produto e didático baixos; settings sem demo visível. |
| Modo escuro | Sem DS; polish de Tailwind que o trio pode fazer fora do catálogo pontuado. |
| Página de configurações | Amarração de outras features sem DS própria; surge naturalmente se as features existirem. |
| Estados vazios e de erro caprichados | Prática de qualidade transversal (vale na rubrica de produto), não uma feature de catálogo. |
| Acessibilidade básica | Requisito transversal obrigatório de qualquer tela, não um item de menu. |
| Exportar meus dados | Sem DS e invisível numa demo; charme LGPD não compensa a vaga. |

## Justificativas de curadoria (por feature mantida)

<details>
<summary>Expandir — por que cada feature está no catálogo</summary>

- **Cadastro e login com hash de senha** — Base de tudo; funde a ideia 'Sessões de login em memória' e já demonstra dict de forma honesta.
- **Posts de texto (CRUD)** — Sem isso não existe rede; tudo depende disso.
- **Feed cronológico paginado** — Funde 3 duplicatas; é a lista que sustenta o produto e cabe na semana 1.
- **Perfil de usuário (avatar, bio)** — Funde 'Perfil completo'; obrigatório numa rede social — avatar por URL evita upload na semana 1.
- **Seguir/seguidores** — Funde Follow/Unfollow + listas; alimenta feed, sugestões e é a ponte pro desafio de grafos.
- **Curtidas** — Funde 'Curtidas com contagem' + 'Curtida única'; set com uso real e barato.
- **Comentários (lista plana)** — Rede sem comentário parece morta; versão plana cabe na semana 1, árvore fica no avançado.
- **Seed de dados fake** — Maior retorno por esforço do projeto; mata o problema do feed vazio melhor que onboarding.
- **Bookmarks (Salvos)** — Funde 2 duplicatas; set O(1) visível na UI com esforço mínimo.
- **Hashtags com índice invertido** — Funde 2 duplicatas; demo clara de hash e pré-requisito do trending.
- **Trending de hashtags** — Funde 3 duplicatas (topics, 24h, contador, última hora); heap top-k vira o upgrade avançado.
- **Menções @username** — Funde 2 duplicatas; parsing + lookup, combina com a fila de notificações.
- **Notificações** — Funde 4 duplicatas; deixa a rede 'viva' e demonstra fila de forma honesta.
- **Busca de usuários por prefixo (busca binária)** — Funde 4 duplicatas; única demo natural de busca binária; vale citar a comparação com scan linear na coluna "Por quê" do DECISIONS.md (medição só é obrigatória nas avançadas).
- **Busca de posts por palavra** — Full-text simples que demonstra dict+set combinados de verdade.
- **Histórico de navegação com 'voltar'** — Funde 5 duplicatas; a demonstração de pilha mais barata e visível do catálogo.
- **Últimos N visitantes do perfil** — Funde 2 duplicatas; uso legítimo de deque de tamanho fixo, feature 'de Orkut' que anima demo.
- **Rate limit de posts** — Demo clara de O(1) amortizado; pouco visível na demo mas ouro na rubrica.
- **Fila de moderação de denúncias** — Funde 3 duplicatas; fila com semântica real de negócio, não forçada.
- **Conta privada + pedidos de follow** — Funde 2 duplicatas; segunda fila natural, e privacidade dá cara de rede de verdade.
- **Amigos em comum** — Funde 2 duplicatas; operação de conjunto visível na UI quase de graça após o follow.
- **Sugestões de quem seguir** — Funde 2 duplicatas; é BFS de profundidade 2 disfarçado — ponte perfeita pro desafio de grafos.
- **Bloquear usuário** — Funde 2 duplicatas; o valor está na filtragem O(1) espalhada pelos endpoints. Mute cortado por redundância.
- **Enquetes** — Interativa na demo e combina dict+set com regra de unicidade real.
- **Feed ranqueado 'Em alta'** — Funde upvote/hot + ranking semanal; heap top-k vira o upgrade avançado.
- **Stories do dia (posts efêmeros)** — Feature moderna reconhecível que dá vida à demo com expiração simples por query.
- **Cache LRU de perfis** — Combinação clássica de duas DS ensinadas; valor de produto baixo, valor de rubrica alto.
- **Streak de atividade** — Funde 2 duplicatas; gamificação barata que gera retenção 'de mentira' convincente na demo.
- **Badges/conquistas** — Personaliza por nicho e reusa dados de outras features.
- **Feed 'Explorar' com filtro** — Barato e faz o app parecer vivo mesmo com poucos usuários — essencial em demo.
- **Listas/coleções curadas** — Funde coleções de posts + listas de usuários; flexível para qualquer nicho.
- **Nota/review com estrelas** — Encaixe perfeito para nichos de filmes/livros/jogos/restaurantes — diferencia o produto do trio.
- **Heatmap de atividade 7×24** — Visual forte na demo com uma DS composta simples; substitui 'analytics do perfil'.
- **Comunidades/grupos** — Funde canais + grupos; gordo mas dá muito produto — só para trio adiantado, cortar papéis de mod se apertar.
- **Graus de separação (BFS no grafo de follows)** — Funde 3 duplicatas; grafo é novo mas a fila do BFS eles já dominam — o desafio guiado ideal.
- **Comentários em árvore** — Funde 3 duplicatas; upgrade natural dos comentários planos do núcleo, recursão no back e no front.
- **Top-K com heap** — Upgrade direto do trending/feed ranqueado; o avançado de melhor custo-benefício.
- **Autocomplete com trie** — Funde 2 duplicatas; medir trie vs bisect rende discussão de Big O ouro pra rubrica.
- **DMs 1-para-1** — Funde 2 duplicatas; DS é ensinada mas polling + telas extras é tecnologia/esforço de semana 2 avançada.
- **Posts com imagem (upload)** — Muda muito a cara da demo, mas upload/estáticos é tech extra fora do trilho ensinado.

</details>
