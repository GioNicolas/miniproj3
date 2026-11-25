# Decisões do time

**Time:** Nícolas ([@GioNicolas](https://github.com/GioNicolas)), Sofia
([@SofiaLimar](https://github.com/SofiaLimar)), Eduardo Travassos
([@EduardoSanturbano](https://github.com/EduardoSanturbano)) e Davi
([@davicgois](https://github.com/davicgois)).

## Produto

A **Frangaria** é uma rede social de calistenia para quem está começando.

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
| Perfil (núcleo) | @davicgois | A carteirinha do frango: nível, progressões dominadas e treinos. |
| Follow (núcleo) | @EduardoSanturbano | Quem você segue forma a sua Granja da Semana. |
| Curtidas (núcleo) | @EduardoSanturbano | O "tamo junto" que faz o iniciante voltar. |
| Comentários (núcleo) | @GioNicolas | Onde o iniciante pergunta como o outro fez a negativa. |
| Seed fake (núcleo) | @EduardoSanturbano | A banca precisa ver uma comunidade viva de calistenia, não Lorem ipsum. |
| Identidade visual e navegação | @SofiaLimar | O nicho precisa aparecer na interface. |
| Registro de treino | @GioNicolas | É o dado que mede a constância e alimenta o frango e a granja. |
| Chat (conversa direta e grupo) | @GioNicolas | O "bora na barra do CCEN às 17h?" acontece dentro da rede, sem perder a pessoa para o WhatsApp. |
| Árvore de progressões | @davicgois | Mostra a ordem certa das progressões e o próximo passo possível. |
| O Frango | @SofiaLimar | Dá motivo para voltar: o frango definha se você some. |
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

## Uso de IA

Ferramenta e para quê. Exemplo: "Claude para gerar o seed de 200 posts sobre
corrida; o resto foi escrito pelo time."
