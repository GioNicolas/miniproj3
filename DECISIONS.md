# Decisões do time

**Time:** Nícolas ([@GioNicolas](https://github.com/GioNicolas)), Sofia
([@SofiaLimar](https://github.com/SofiaLimar)), Eduardo Travassos
([@EduardoSanturbano](https://github.com/EduardoSanturbano)) e Davi
([@davicgois](https://github.com/davicgois)).

**No ar:** https://miniproj3-six.vercel.app (API em
https://rede-trilha-api.onrender.com). Para ver a rede cheia, entrem como
`frango_demo`, senha `senha-forte-123`.

## Produto

O **Frangym** é uma rede social de calistenia para quem está começando.

- **Público:** estudantes da UFPB nos primeiros meses de calistenia, que treinam
  sozinhos e sem treinador na barra da praça, do campus ou em casa.
- **Problema:** o iniciante não sabe a ordem certa das progressões (tenta a
  barra fixa antes da australiana e não sai do lugar) e desiste nas primeiras
  semanas por falta de constância. As soluções de hoje falham com ele: o
  Instagram só mostra quem já é monstro, o grupo de WhatsApp não acompanha a
  evolução de ninguém, e os apps de desafio de treino são genéricos, exigem
  foto como prova e premiam quem já treina muito.
- **Como a rede resolve:** transforma a constância em jogo. Cada treino
  registrado alimenta um frango que evolui e definha se você some. A Granja da
  Semana compara quem não faltou entre as pessoas que você segue, e a árvore de
  progressões mostra o próximo passo possível com o equipamento que você tem.
  Tudo é pensado para o celular, porque o treino é registrado na praça, logo
  depois da última série.
- **Como saberíamos que funcionou:** a pessoa registra treino em pelo menos 3
  dias por semana durante 4 semanas seguidas, e o frango dela chega a Galo.

## Decisões de produto

### 1. Competir por constância, só entre quem você segue

- **Contexto:** competição motiva, mas o iniciante é justamente quem perde
  qualquer ranking de força. Se ele aparece em último lugar, desiste.
- **Opções:** ranking por carga ou repetições, ranking global de dias
  treinados, ou ranking de dias treinados só entre quem você segue.
- **Escolha:** a Granja da Semana conta **dias distintos com treino** (vários
  treinos no mesmo dia contam um só), só entre **você e quem você segue**, e
  **zera toda segunda**. Quem começou ontem pode ganhar a semana.
- **O que cortamos e por quê:** o ranking por carga e o ranking global. Os dois
  colocariam o iniciante para competir com o monstro da praça, e a rede existe
  para o iniciante.

### 2. Registro de treino sem prova obrigatória

- **Contexto:** os apps de desafio de treino pedem selfie ou vídeo em todo
  check-in, para ninguém trapacear no placar.
- **Opções:** foto obrigatória, vídeo obrigatório, ou registro livre com texto
  e a progressão que a pessoa treinou.
- **Escolha:** o registro é livre e vira um post destacado no feed, com a
  progressão treinada. Os amigos veem e comentam, e é essa pressão social que
  mantém a honestidade.
- **O que cortamos e por quê:** a prova obrigatória. O iniciante tem vergonha
  do próprio corpo e do próprio treino, e essa vergonha faz parte do problema
  que queremos resolver. Trapacear no ranking de quem você segue não rende
  nada para ninguém.
- **Depois:** a foto voltou como **opcional**, no mesmo lugar onde se escreve o
  post. Muita gente gosta de mostrar o treino, e quem tem vergonha continua
  registrando sem foto. Ela nunca vale como prova nem muda o placar. O celular
  reduz a foto para cerca de 1080 px antes de enviar, e a API guarda os bytes no
  próprio banco, numa tabela separada (`post_imagens`): o disco do Render free
  zera a cada deploy, então uma pasta de uploads perderia as fotos, e assim a
  foto dura o mesmo que o post. O tipo é conferido pelos primeiros bytes do
  arquivo, não pelo nome, e a URL leva uma chave aleatória, para ninguém achar
  a foto de um post chutando o número.

### 3. Feed cronológico; quem acabou de chegar começa pelo Explorar

- **Contexto:** quem abre a rede quer saber quem da sua granja já treinou hoje.
  Quem acabou de criar a conta não segue ninguém e veria uma tela vazia.
- **Opções:** feed ranqueado por engajamento, ou feed cronológico de quem você
  segue com o Explorar como porta de entrada.
- **Escolha:** a home tem duas abas. **Seguindo** é cronológico, mais novo
  primeiro, com os posts de quem você segue e os seus. Quem ainda não segue
  ninguém abre direto no **Explorar**, com os posts da rede toda e o aviso
  "Você ainda não segue nenhum frango: olha o que a galera tá treinando".
- **O que cortamos e por quê:** o "Em alta" no feed principal. O post mais
  curtido costuma ser o de quem já é forte, e o feed tem que mostrar o treino de
  hoje dos amigos, por menor que seja.

### 4. Follow instantâneo em vez de pedido de amizade

- **Contexto:** é uma rede de calistenia que encoraja interagir e mostrar o
  progresso. Na reunião surgiu a ideia de um sistema de amizade com envio e
  aceite de pedidos.
- **Opções:** follow simples e instantâneo, ou pedido de amizade que o outro
  precisa aceitar.
- **Escolha:** follow simples e instantâneo. Se o usuário posta um treino ou
  participa da plataforma, ele ganha seguidores e faz amizades.
- **O que cortamos e por quê:** o pedido de amizade, por enquanto. Mais tarde
  pode voltar junto com a opção de perfil privado, para quem quiser menos
  exposição.

## O que ficou de fora e por quê

- **Integração com relógio e pontuação configurável:** os apps de desafio têm
  isso, mas são métricas para quem já treina. O
  iniciante precisa voltar amanhã, não de mais números.
- **Nutrição e dieta:** é outro problema, com outro público e outra
  responsabilidade.
- **Validação por vídeo:** contradiz a decisão 2. A prova obrigatória afasta
  justamente quem tem vergonha do próprio treino.
- **Batalha de frangos:** um contra um volta a colocar o iniciante frente a
  frente com quem é mais forte, o que a decisão 1 evita.
- **Conta privada:** só faz sentido junto com o pedido de amizade, que ficou de
  fora na decisão 4.
- **Grupos de treino abertos, como comunidade:** a turma que treina junto já
  tem o grupo do chat. Uma comunidade aberta pediria moderação, e a dúvida
  sobre um exercício fica nos comentários do post, onde outros iniciantes
  também aprendem.
- **IA que monta o treino:** vira uma planilha de treino, que é outro app, e
  montar treino para quem nunca treinou, sem ninguém acompanhar, é arriscado.

## Features

Listem as features que o time vai construir, quem é o dono de cada uma e por
que ela entra no produto. A lista muda junto com o projeto: acrescentem e
tirem linhas quando mudarem de ideia.

| Feature | Dono | Por quê (1 frase) |
|---|---|---|
| Auth (núcleo) | @SofiaLimar | Sem conta não existe frango, treino nem granja. |
| Posts (núcleo) | @GioNicolas | É onde o frango conta o treino do dia e tira dúvida. |
| Feed + Explorar (núcleo) | @GioNicolas | Ver quem da granja já treinou hoje; quem chegou agora não vê tela vazia. |
| Perfil (núcleo) | @davicgois, @GioNicolas | A carteirinha do frango: nível, progressões dominadas e treinos. |
| Follow (núcleo) | @EduardoSanturbano | Quem você segue forma a sua Granja da Semana. |
| Curtidas (núcleo) | @EduardoSanturbano | O "tamo junto" que faz o iniciante voltar. |
| Comentários (núcleo) | @GioNicolas | Onde o iniciante pergunta como o outro fez a negativa. |
| Seed fake (núcleo) | @EduardoSanturbano | A banca precisa ver uma comunidade viva de calistenia, não Lorem ipsum. |
| Identidade visual e navegação | @SofiaLimar | O nicho precisa aparecer na interface. |
| Registro de treino | @GioNicolas | É o dado que mede a constância e alimenta o frango e a granja. |
| Foto opcional no post | @GioNicolas | Mostrar o treino é parte do hábito de quem posta, mas nunca vira prova obrigatória (decisão 2). |
| Chat (conversa direta e grupo) | @GioNicolas | O "bora na barra do CCEN às 17h?" acontece dentro da rede, sem perder a pessoa para o WhatsApp. |
| Árvore de progressões | @davicgois, @GioNicolas | Mostra a ordem certa das progressões e o próximo passo possível. |
| O Frango | @SofiaLimar, @GioNicolas | Dá motivo para voltar: o frango definha se você some. |
| Granja da Semana | @EduardoSanturbano | Competição por constância, que zera toda segunda. |
| Deploy público | @davicgois | A banca usa a rede de verdade, numa URL. |

## Uma escolha técnica

### Contar comentários de uma página inteira numa query só

Feed, Explorar e perfil devolvem páginas de posts, e cada post mostra quantos
comentários tem. O caminho ingênuo é contar post por post: uma query para a
página e mais uma por post, o problema clássico do N+1.

- **Escolha:** `services/posts.py::montar_posts` é o único lugar que transforma
  `Post` em `PostOut`, e ele recebe a página inteira. Os comentários de todos os
  posts da página são contados numa única query com `GROUP BY post_id`, que usa
  o índice de `comentarios.post_id`.
- **Big O:** uma página de `k` posts custa **2 queries** em vez de `k + 1`. Com
  a página padrão de 20 posts, são 2 idas ao banco em vez de 21.
- **Com 100 vezes mais usuários:** o número de queries por página não muda,
  porque a página tem tamanho fixo. O que cresce é a tabela, e o índice mantém a
  contagem proporcional aos comentários dos `k` posts da página, não à tabela
  inteira. As curtidas (#6) entram na mesma query agrupada.

### A árvore de progressões é um grafo, ordenado por Kahn

Progressão de calistenia não é uma fila única: o muscle-up pede barra fixa
**e** paralela, e a elevação de joelhos pede canoa **e** saber pendurar na
barra. Por isso o catálogo (`core/progressoes.py`) é um DAG: cada skill aponta
para os seus pré-requisitos.

- **Escolha:** a ordenação topológica de Kahn roda uma vez, quando a API sobe.
  Ela recusa código desconhecido e ciclo, então um catálogo quebrado derruba a
  subida e nunca chega à demo. A mesma passada dá o nível de cada skill
  (1 + o maior nível dos pré-requisitos), que a tela usa para desenhar a árvore
  em camadas. O catálogo fica em código, e não no banco, para os códigos serem
  estáveis: o registro de treino só aceita progressão que existe na árvore.
- **Big O:** com `V` skills e `E` pré-requisitos, a ordenação e os níveis custam
  O(V + E), uma vez só. Montar a árvore de alguém (`disponiveis`) também custa
  O(V + E), com as skills dominadas num `set`. Hoje são 20 skills e 18 arestas.
- **Com 100 vezes mais skills:** 2.000 skills ainda cabem em memória, e a ordem
  e os níveis continuam calculados uma vez. O que pesaria é devolver a árvore
  inteira a cada request; aí a tela passaria a pedir uma trilha por vez, e o
  catálogo iria para uma tabela versionada, para mudar sem deploy.

### Granja da Semana: contagem em memória e top-K por heap

A Granja é aberta toda vez que alguém entra no app, então montar o ranking não
pode custar uma varredura nos posts.

- **Escolha:** `core/granja.py` guarda, por semana e por pessoa, os dias com
  treino num `dict` de `Counter`. A estrutura é reconstruída uma vez quando a API
  sobe e atualizada a cada treino registrado ou apagado. O pódio sai de um heap
  de tamanho `k`, com o pior colocado na raiz; o desempate é pelo username.
- **Big O:** registrar ou apagar um treino custa O(1). O ranking de `n`
  participantes custa O(n log k) em vez do O(n log n) de ordenar todo mundo. A
  reconstrução custa O(t) no número de treinos, só na subida.
- **Medido** (`make bench`, top 10, tempo médio por ranking):

  | participantes | heap (`top_k`) | `sorted()[:k]` |
  |---:|---:|---:|
  | 100 | 0,075 ms | 0,031 ms |
  | 1.000 | 0,49 ms | 0,39 ms |
  | 10.000 | 4,7 ms | 5,2 ms |
  | 100.000 | 47 ms | 71 ms |

  Até mil participantes o `sorted()` do Python ganha, porque ele roda em C e o
  heap paga uma comparação em Python por candidato. O heap só passa na frente a
  partir de uns 10 mil. Hoje a Granja de cada um tem só quem a pessoa segue,
  algumas dezenas de pessoas, então a escolha não acelera nada agora.
- **Com 100 vezes mais usuários:** o heap passa a valer quando a Granja ganha um
  ranking geral da rede, com dezenas de milhares de pessoas. Já a contagem em
  memória deixa de caber num processo só quando a API roda em mais de uma
  máquina: aí ela iria para um sorted set no Redis, com a mesma conta por dia
  distinto.

## Uso de IA

- **@GioNicolas:** Claude Code para implementar comigo as features de que eu era
  dono (posts, feed, comentários, registro de treino, chat, árvore e foto no
  post) e para revisar a escrita deste arquivo. Eu revisava cada diff, rodava os
  testes e conferia as telas no navegador antes de abrir o PR. Codex para revisar
  PRs antes do merge.
- **@SofiaLimar:** Gemini para gerar as artes das 4 patentes do frango
  (Pintinho, Frango, Galo e Monstro). Claude (canvas de design no claude.ai)
  para desenhar as telas e testar paleta e tipografia da identidade visual.
  Claude Code para levar o canvas para o front e para as revisões de design do
  app no ar: crítica das telas com a skill Impeccable (heurísticas, contraste,
  celular e computador) e os ajustes que saíram dela, como a tela de treino
  registrado, as metas de reps, a prévia da Granja e o layout no computador. Eu
  decidia o que mudar, conferia cada tela no celular e no computador e testava
  os fluxos com contas minhas antes do merge.
- **@EduardoSanturbano:** Claude Code para implementar comigo as features de
  que eu era dono (follow, curtidas, Granja da Semana e seed fake) e a foto de
  perfil escolhida dos arquivos: o grafo de follow e o top-K por heap em
  `core/`, o benchmark da Granja, os textos do seed com cara de calistenia e os
  merges da main nas minhas branches. Também para escrever comigo a decisão 4.
  Eu revisava cada diff, rodava os testes e o `make bench` e conferia as telas
  no navegador antes de abrir o PR.
- **Do time, sem IA:** o nicho e o público, as decisões de produto e o que ficou
  de fora.
