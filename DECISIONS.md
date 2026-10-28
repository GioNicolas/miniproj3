# Decisões do time

**Time:** _(nomes e usernames do GitHub)_

## Produto

Respondam antes de escolher features. O pitch sai daqui.

- **Público:** _(quem usa a rede, o mais específico possível: "corredores
  iniciantes da UFPB", não "pessoas que gostam de esporte")_
- **Problema:** _(o que essa pessoa tenta fazer hoje e onde isso falha)_
- **Como a rede resolve:** _(uma ou duas frases)_
- **Como saberíamos que funcionou:** _(um sinal observável: "a pessoa volta
  no dia seguinte para ver o treino dos amigos")_

## Decisões de produto

Registrem de 3 a 5 escolhas que mudaram o que a rede é. Boas candidatas: por
que essas features e não outras, o que ficou de fora, como o seed e a interface
refletem o nicho. Uma delas vai para o vídeo.

### 1. _(título curto)_

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

No núcleo, preencham Feature e Dono. Nas features de menu, preencham todas as
colunas. `make test` valida o formato, e o corretor usa o mesmo parser: não
mudem o número de colunas.

| Feature | Dono | Módulo em core/ (app.core.<nome>) | Endpoint que usa | Big O da operação principal | Por quê essa estrutura (1 frase) | Caso autoral (1 frase) |
|---|---|---|---|---|---|---|
| Auth (núcleo) | | - | - | - | - | - |
| Posts (núcleo) | | - | - | - | - | - |
| Feed (núcleo) | | - | - | - | - | - |
| Perfil (núcleo) | | - | - | - | - | - |
| Follow (núcleo) | | - | - | - | - | - |
| Curtidas (núcleo) | | - | - | - | - | - |
| Comentários (núcleo) | | - | - | - | - | - |
| Seed fake (núcleo) | | - | - | - | - | - |

## Medições

Para cada feature avançada, colem a saída do `make bench` e uma frase dizendo
o que os números mostram. Se a versão simples ganhou, digam até que tamanho de
dado isso vale.

## Uso de IA

Ferramenta e para quê. Exemplo: "Claude para gerar o seed de 200 posts sobre
corrida; o resto foi escrito pelo time."
