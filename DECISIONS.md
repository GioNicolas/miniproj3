# Decisões do time

**Time:** Nícolas ([@GioNicolas](https://github.com/GioNicolas)), Sofia
([@SofiaLimar](https://github.com/SofiaLimar)), Eduardo Travassos
([@EduardoSanturbano](https://github.com/EduardoSanturbano)) e Davi
([@davicgois](https://github.com/davicgois)).

Este arquivo acompanha o projeto. Comecem com o que já sabem e atualizem quando
as decisões mudarem.

## Produto

Respondam antes de escolher features. O pitch sai daqui.

> Rascunho tirado da reunião do time. A versão final sai na issue #15.

- **Público:** estudantes da UFPB que estão começando na calistenia e treinam
  na barra da praça, do campus ou em casa.
- **Problema:** o iniciante treina sozinho, não sabe a ordem certa das
  progressões (tenta a barra fixa antes da australiana e não sai do lugar) e
  desiste nas primeiras semanas por falta de constância. O Instagram só mostra
  quem já é monstro, e o grupo de WhatsApp não acompanha a evolução de ninguém.
- **Como a rede resolve:** transforma a constância em jogo. Cada treino
  registrado alimenta um frango que evolui e definha se você some, a Granja da
  Semana compara quem não faltou entre as pessoas que você segue, e a árvore de
  progressões mostra o próximo passo possível com o equipamento que você tem.
- **Como saberíamos que funcionou:** a pessoa registra treino em pelo menos 3
  dias por semana durante 4 semanas seguidas, e o frango dela chega a Galo.

## Decisões de produto

Registrem de 3 a 5 escolhas que mudaram o que a rede é. Boas candidatas: por
que essas features e não outras, o que ficou de fora, como o seed e a interface
refletem o nicho. Uma delas vai para o vídeo.

### 1. Follow instantâneo em vez de pedido de amizade (Eduardo)

- **Contexto:** é uma rede de calistenia que encoraja interagir e mostrar o
  progresso. Na reunião surgiu a ideia de um sistema de amizade com envio e
  aceite de pedidos.
- **Opções:** follow simples e instantâneo, ou pedido de amizade que o outro
  precisa aceitar.
- **Escolha:** inicialmente, follow simples e instantâneo. Se o usuário posta
  uma foto ou participa da plataforma, ele ganha seguidores e faz amizades.
- **O que cortamos e por quê:** o pedido de amizade, por enquanto.
  Posteriormente pode ser considerado, junto com a opção de tornar o perfil
  privado, para permitir menor exposição.

### 2. _(título curto)_

- **Contexto:** _(o que estava em jogo)_
- **Opções:** _(o que vocês consideraram)_
- **Escolha:** _(o que fizeram)_
- **O que cortamos e por quê:** _(o custo da escolha)_

Exemplo:

> **Feed cronológico em vez de "Em alta"**
>
> - **Contexto:** a comunidade é de corredores que treinam juntos.
> - **Opções:** feed ranqueado por engajamento ou feed cronológico.
> - **Escolha:** cronológico, com stories do dia.
> - **O que cortamos e por quê:** o "Em alta". Quem abre o app quer ver o
>   treino de hoje dos amigos, não o post mais curtido da semana.

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

Contem uma escolha técnica que o time fez e por quê. Por exemplo, por que usou
uma estrutura de dados no `core/`, qual o Big O da operação principal, ou o
que mudaria se a rede crescesse 100 vezes. Se mediram com `make bench`, colem a
saída e uma frase dizendo o que os números mostram.

## Uso de IA

Ferramenta e para quê. Exemplo: "Claude para gerar o seed de 200 posts sobre
corrida; o resto foi escrito pelo time."

### ?rvore de progress?es

As progress?es formam um DAG: cada aresta liga um pr?-requisito ? habilidade
que ele libera. A ordena??o topol?gica de Kahn detecta ciclos e garante que
os n?veis venham depois dos pr?-requisitos. Com V habilidades e E arestas,
a ordena??o custa O(V + E) em tempo e espa?o; a disponibilidade tamb?m percorre
os requisitos e equipamentos. As conquistas e equipamentos ficam no SQLite,
mas o cat?logo permanece em c?digo para manter os c?digos de treino est?veis.
Com 100 vezes mais habilidades, seria necess?rio medir o custo por requisi??o,
pr?-calcular a ordem e os n?veis e considerar pagina??o ou carregar trilhas
sob demanda; mudan?as no cat?logo tamb?m precisariam de uma gest?o versionada.
