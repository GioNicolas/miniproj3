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

### 2. O frango perde força aos poucos, em vez de zerar a sequência

- **Contexto:** o streak, como o do Duolingo, motiva enquanto dura, mas, quando
  quebra, a pessoa perde tudo de uma vez e costuma largar o hábito junto.
- **Opções:** streak que zera ao faltar um dia, ou uma força que sobe com os
  treinos e desce aos poucos com as faltas.
- **Escolha:** cada dia com treino dá força ao frango. Um dia de descanso não
  pune. A partir do segundo dia seguido sem treino, o frango perde um pouco de
  força por dia e aparece **definhando**. Os níveis são Frango, Frango de
  granja, Galo e Monstro.
- **O que cortamos e por quê:** a sequência que zera. Ela castiga quem falta
  três dias como se tivesse largado tudo, e esse é o momento em que o iniciante
  mais precisa de um motivo para voltar.

### 3. Registro de treino sem prova obrigatória

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

### 4. Feed cronológico; o Explorar só aparece para quem acabou de chegar

- **Contexto:** quem abre a rede quer saber quem da sua granja já treinou hoje.
  Quem acabou de criar a conta não segue ninguém e veria uma tela vazia.
- **Opções:** feed ranqueado por engajamento, ou feed cronológico de quem você
  segue com o Explorar como porta de entrada.
- **Escolha:** feed cronológico, mais novo primeiro, só com quem você segue.
  Quem ainda não segue ninguém vê o Explorar, com os posts da rede toda e o
  aviso "Você ainda não segue nenhum frango: olha o que a galera tá treinando".
- **O que cortamos e por quê:** o "Em alta" no feed principal. O post mais
  curtido costuma ser o de quem já é forte, e o feed tem que mostrar o treino de
  hoje dos amigos, por menor que seja.

### 5. A árvore mostra o próximo passo, não uma planilha de treino

- **Contexto:** o iniciante se machuca ou desiste quando pula etapa, por
  exemplo ao tentar a barra fixa sem ter feito a negativa e a australiana.
- **Opções:** planilha de treino completa, catálogo solto de exercícios, ou uma
  árvore de progressões com pré-requisitos.
- **Escolha:** uma árvore com trilhas (puxar, empurrar, pernas, core). Cada
  skill só libera quando os pré-requisitos estão dominados, e a rede destaca o
  próximo passo possível com o equipamento que a pessoa tem.
- **O que cortamos e por quê:** a planilha de treino completa e a dieta. As duas
  viram outro app, e o iniciante não precisa de um plano perfeito: precisa
  saber o próximo passo e voltar amanhã.

## O que ficou de fora e por quê

- **Chat em grupo, integração com relógio e pontuação configurável:** os apps
  de desafio têm isso, mas são métricas e canais para quem já treina. O
  iniciante precisa voltar amanhã, não de mais números.
- **Nutrição e dieta:** é outro problema, com outro público e outra
  responsabilidade.
- **Fila "se sobrar tempo"** (batalha de frangos, conta privada, chat direto,
  grupos de treino, IA que monta o treino e validação por vídeo): _fechamos esta
  lista em 26/11 com o que não entrar e o motivo de cada corte._

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
