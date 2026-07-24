# CONTRATO.md — a API das features de menu

> Gerado automaticamente do contrato do instrutor — **não edite este arquivo**.
> O grader testa exatamente o que está aqui. Divergir de rota, campo ou status
> = teste falha = feature vale 0 (RUBRICA). O **núcleo** não está aqui: a spec
> dele são os testes `@skip` em `backend/tests/test_nucleo.py`.

Convenções: paginação = `{"items": [...], "total", "offset", "limit"}`;
🔒 = exige `Authorization: Bearer <token>`; datas em ISO 8601 UTC.
O que o contrato NÃO especifica é por sua conta — e é de lá que saem os seus
testes autorais (guia 09).


## Descoberta e conteúdo

### Hashtags com índice invertido

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/tags/{tag}/posts`<br>query: offset, limit | — | 200 | página de posts que contêm #tag, mais novo primeiro |

- tag = palavra iniciada por # no texto do post: [a-z0-9_]+, comparação casefold
- tags repetidas no mesmo post contam uma vez (dedup por post)
- o índice tag→posts vive em core/ e é atualizado no POST /posts (não é LIKE no banco)

### Trending de hashtags

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/tags/trending` | — | 200 | {"items": [{"tag": str, "contagem": int}]} — top 5 |

- conta só posts das últimas 24h; ordem decrescente de contagem; empate = alfabética
- depende da feature Hashtags (usa as mesmas tags extraídas)

### Feed 'Explorar' com filtro

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/explorar`<br>query: tag (opcional), offset, limit | — | 200 | página com posts de TODOS os usuários, mais novo primeiro |

- ?tag=x filtra pelos posts com a tag (sem ?tag, devolve tudo)

### Busca de usuários por prefixo (busca binária)

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/busca/usuarios`<br>query: prefixo | — | 200 | {"items": [UserOut]} — máx 10, ordem alfabética |

- usernames que começam com o prefixo (casefold)
- core/: lista ordenada mantida com bisect.insort no registro + bisect_left na busca (scan linear no banco = core de teatro)

### Busca de posts por palavra

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/busca/posts`<br>query: q (termos separados por espaço), offset, limit | — | 200 | página de posts contendo TODOS os termos, mais novo primeiro |

- palavra = [a-z0-9_]+, casefold; múltiplos termos = interseção de sets
- core/: índice invertido palavra→set de post_ids, atualizado no POST /posts

### Enquetes

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/enquetes` | `{"pergunta": str, "opcoes": [str] (2 a 4)}` | 201 | {"id", "pergunta", "opcoes", "total_votos": 0} |
| POST | 🔒 `/enquetes/{id}/votar` | `{"opcao": int (índice, 0-based)}` | 200 | o mesmo formato do GET (resultados atualizados) |
| GET | 🔒 `/enquetes/{id}` | — | 200 | {"pergunta", "opcoes": [{"texto", "votos"}], "total_votos", "ja_votei": bool} |

- 1 voto por usuário: segundo voto → 409
- opção fora do intervalo → 422
- core/: dict opção→contagem + set de votantes

### Feed ranqueado 'Em alta'

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/em-alta`<br>query: offset, limit | — | 200 | página de posts ordenada por score decrescente |

- score = (curtidas + 2×comentários) / (horas_desde_criação + 2) — fórmula FIXA
- empate = mais novo primeiro

### Stories do dia (posts efêmeros)

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/stories` | `{"texto": str}` | 201 | {"id", "texto", "autor", "created_at"} |
| GET | 🔒 `/stories` | — | 200 | {"items": [stories]} — mais nova primeiro |

- GET devolve só stories de quem eu sigo (+ as minhas) criadas nas últimas 24h
- expiração: story com mais de 24h nunca aparece (fila FIFO por timestamp em core/; a expiração é conferida na defesa)

### Nota/review com estrelas

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts/{post_id}/avaliar` | `{"estrelas": int (1 a 5)}` | 200 | {"media_estrelas": float, "avaliacoes": int} |

- reavaliar substitui a nota anterior do usuário (não duplica)
- GET /posts/{id} ganha os campos media_estrelas (null se 0 avaliações) e avaliacoes
- core/: média incremental (sem recalcular a lista toda a cada GET)


## Social

### Amigos em comum

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}/amigos-em-comum` | — | 200 | {"items": [UserOut]} — ordem alfabética |

- interseção entre quem EU sigo e quem {username} segue (sets em core/)

### Sugestões de quem seguir

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/sugestoes` | — | 200 | {"items": [{"usuario": UserOut, "seguido_por": int}]} — máx 10 |

- amigos-de-amigos: seguidos dos meus seguidos, excluindo eu e quem já sigo
- seguido_por = quantos dos MEUS seguidos seguem a pessoa; ordem decrescente, empate alfabético

### Menções @username

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}/mencoes`<br>query: offset, limit | — | 200 | página de posts que mencionam @{username}, mais novo primeiro |

- menção = @username de usuário EXISTENTE no texto do post (lookup O(1) num dict)
- GET /posts/{id} ganha o campo mencoes: [usernames]
- se o trio tiver Notificações, menção gera evento tipo 'mencionou'

### Bloquear usuário

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/usuarios/{username}/bloquear` | — | 204 | — |
| DELETE | 🔒 `/usuarios/{username}/bloquear` | — | 204 | — |
| GET | 🔒 `/bloqueados` | — | 200 | {"items": [UserOut]} |

- bloquear desfaz follow nos DOIS sentidos
- para o bloqueado, meu perfil/posts respondem 404 e follow em mim responde 404
- meu feed/buscas nunca mostram conteúdo de quem eu bloqueei (set com filtro O(1))

### Conta privada + pedidos de follow

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| PATCH | 🔒 `/usuarios/eu` | `{"privado": bool}` | 200 | perfil atualizado (campo novo no PATCH que já existe) |
| POST | 🔒 `/usuarios/{username}/follow` | — | 202 | {"detail": "pedido enviado"} — quando a conta é privada |
| GET | 🔒 `/pedidos` | — | 200 | {"items": [{"id", "de": UserOut, "criado_em"}]} — FIFO |
| POST | 🔒 `/pedidos/{id}/aceitar` | — | 204 | — |
| POST | 🔒 `/pedidos/{id}/recusar` | — | 204 | — |

- follow em conta pública continua 200/204 imediato; em privada vira pedido (202)
- aceitar transforma o pedido em follow; fila em ordem de chegada

### Últimos N visitantes do perfil

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/eu/visitantes` | — | 200 | {"items": [UserOut]} — mais recente primeiro |

- visita = GET /usuarios/{username} autenticado por OUTRO usuário
- últimos 10, sem duplicatas consecutivas (deque com maxlen em core/)

### Comunidades/grupos

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/grupos` | `{"nome": str, "descricao": str}` | 201 | {"id", "nome", "descricao", "membros": 1} (criador já entra) |
| GET | 🔒 `/grupos`<br>query: offset, limit | — | 200 | página de {id, nome, descricao, membros} |
| POST | 🔒 `/grupos/{id}/entrar` | — | 204 | — |
| DELETE | 🔒 `/grupos/{id}/entrar` | — | 204 | — |
| POST | 🔒 `/grupos/{id}/posts` | `{"texto": str}` | 201 | post criado |
| GET | 🔒 `/grupos/{id}/posts`<br>query: offset, limit | — | 200 | página cronológica do grupo |

- nome de grupo duplicado → 409; entrar é idempotente
- postar sem ser membro → 403; posts de grupo NÃO aparecem no feed pessoal
- core/: dict grupo→posts + sets de membros


## Engajamento e sistemas

### Notificações

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/notificacoes`<br>query: offset, limit | — | 200 | página de {"tipo", "de_username", "post_id" | null, "criada_em", "lida": bool} |
| GET | 🔒 `/notificacoes/nao-lidas` | — | 200 | {"contagem": int} |
| POST | 🔒 `/notificacoes/ler` | — | 204 | — |

- tipos: 'curtiu', 'comentou', 'seguiu' (+ 'mencionou' se a feature existir)
- ação própria não notifica; mais recente primeiro; POST /ler marca todas
- core/: fila de eventos + set de lidas

### Streak de atividade

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}` | — | 200 | o perfil ganha o campo "streak": int |

- streak = dias consecutivos com ≥1 post, terminando hoje (ou ontem, se hoje ainda não postou)
- core/: set de datas com checagem O(1) por dia

### Badges/conquistas

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}/badges` | — | 200 | {"items": [{"codigo", "nome", "conquistada_em"}]} |

- códigos mínimos do contrato: primeiro_post (1º post), post_popular (algum post com ≥5 curtidas), veterano (≥10 posts), social (segue ≥5 pessoas)
- concedidas automaticamente nos writes; sem duplicata (set em core/)

### Bookmarks (Salvos)

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts/{post_id}/salvar` | — | 204 | — |
| DELETE | 🔒 `/posts/{post_id}/salvar` | — | 204 | — |
| GET | 🔒 `/salvos`<br>query: offset, limit | — | 200 | página de posts salvos, salvo mais recente primeiro |

- salvar é idempotente; /salvos é privado (só o próprio usuário)

### Listas/coleções curadas

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/colecoes` | `{"nome": str}` | 201 | {"id", "nome", "qtd": 0} |
| POST | 🔒 `/colecoes/{id}/posts` | `{"post_id": int}` | 204 | — |
| DELETE | 🔒 `/colecoes/{id}/posts/{post_id}` | — | 204 | — |
| GET | 🔒 `/colecoes` | — | 200 | {"items": [{"id", "nome", "qtd"}]} — as minhas |
| GET | 🔒 `/colecoes/{id}` | — | 200 | {"nome", "items": [posts NA ORDEM DE INSERÇÃO]} |

- post duplicado na coleção não duplica (set) mas a ordem de inserção é preservada (lista)
- leitura pública; escrita só do dono → 403

### Heatmap de atividade 7×24

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}/atividade` | — | 200 | {"matriz": [[int × 24] × 7]} — matriz[0] = segunda-feira |

- contagem de posts por (dia da semana, hora) em UTC; matriz como lista de listas em core/

### Histórico de navegação com 'voltar'

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/historico` | `{"tipo": "perfil" | "post", "ref": str}` | 204 | — |
| POST | 🔒 `/historico/voltar` | — | 200 | {"tipo", "ref"} — o item desempilhado |
| GET | 🔒 `/historico` | — | 200 | {"items"} — topo da pilha primeiro |

- duplicata consecutiva não empilha; voltar com pilha vazia → 404
- pilha por usuário em core/

### Rate limit de posts

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts` | `(o mesmo do núcleo)` | 429 | {"detail": str} — quando estourar o limite |

- limite FIXO do contrato: máx 5 posts por 60 segundos por usuário (6º → 429)
- core/: deque de timestamps com janela deslizante (O(1) amortizado)

### Fila de moderação de denúncias

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts/{post_id}/denunciar` | `{"motivo": str}` | 201 | {"id"} |
| GET | 🔒 `/moderacao` | — | 200 | {"items": [{"id", "post_id", "motivo", "de_username", "criada_em"}]} — FIFO |
| POST | 🔒 `/moderacao/{denuncia_id}/resolver` | `{"acao": "remover" | "ignorar"}` | 204 | — |

- admin = o PRIMEIRO usuário registrado no banco (regra fixa do projeto)
- GET /moderacao e /resolver para não-admin → 403; 'remover' apaga o post
- sempre a denúncia mais antiga primeiro (fila em core/)

### Cache LRU de perfis

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/cache/stats` | — | 200 | {"hits": int, "misses": int, "tamanho": int, "capacidade": 50} |

- GET /usuarios/{username} passa a consultar um LRU de capacidade 50 em core/ (dict + deque implementados à mão — functools.lru_cache não pontua)
- PATCH /usuarios/eu invalida a entrada do cache
- 2 GETs seguidos do mesmo perfil → hits aumenta (observável em /cache/stats)


## Avançadas

### Graus de separação (BFS no grafo de follows)

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/usuarios/{username}/distancia` | — | 200 | {"graus": int | null, "caminho": [usernames de mim até o alvo]} |

- grafo NÃO-direcionado: follow em qualquer direção conecta
- BFS com deque + dict de predecessores (o caminho vem daí); sem conexão → graus null, caminho []
- eu → eu = 0 graus; bench: BFS vs varredura ingênua

### Top-K com heap

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/top/semana`<br>query: k (default 10, máx 50) | — | 200 | {"items": [posts]} — os k com mais curtidas em 7 dias |

- core/: heapq.nlargest (O(n log k)) — ordenar tudo é a versão ingênua do bench
- desempate: mais novo primeiro

### Comentários em árvore

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts/{id}/comentarios` | `{"texto": str, "parent_id": int | null}` | 201 | comentário criado (parent_id null = raiz) |
| GET | 🔒 `/posts/{id}/comentarios` | — | 200 | {"items": [comentário]} onde cada um tem "respostas": [filhos] (recursivo) |

- parent_id inexistente ou de outro post → 404
- raízes e filhos em ordem cronológica; serialização recursiva da árvore
- substitui o formato plano do núcleo (o teste do núcleo continua passando: raiz sem parent)

### Autocomplete com trie

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| GET | 🔒 `/autocomplete`<br>query: prefixo, tipo ('usuarios' | 'tags') | — | 200 | {"sugestoes": [str]} — máx 10, ordem alfabética |

- trie em core/ alimentada no registro/na extração de tags
- bench OBRIGATÓRIO: trie vs a busca por bisect (a comparação é o ouro da rubrica)

### DMs 1-para-1

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/dms/{username}` | `{"texto": str}` | 201 | {"id", "de_username", "texto", "em"} |
| GET | 🔒 `/dms` | — | 200 | {"items": [{"com": UserOut, "ultima_mensagem": str, "em": str}]} — conversa mais recente primeiro |
| GET | 🔒 `/dms/{username}`<br>query: offset, limit | — | 200 | página de mensagens da conversa, mais ANTIGA primeiro |

- DM para si mesmo → 422; para quem me bloqueou/eu bloqueei → 404
- core/: dict par-de-usuários→fila de mensagens; front atualiza por polling
- bench: dict de conversas vs varredura linear da tabela de mensagens

### Posts com imagem (upload)

| Método | Rota | Body | Status | Resposta |
|---|---|---|---|---|
| POST | 🔒 `/posts/{post_id}/imagem` | `multipart/form-data, campo "arquivo"` | 200 | {"imagem_url": str} |

- TECNOLOGIA EXTRA: isenta de core/ e de medição (RUBRICA item 4)
- só o autor do post → 403; jpg/png/webp; máx 2 MB → 413
- GET /posts/{id} ganha imagem_url (null sem imagem); arquivo servido como estático (guia 06)
