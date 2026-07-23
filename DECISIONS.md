# DECISIONS.md — o índice do seu projeto

> Este arquivo é validado pelo `tests/test_decisions.py` em todo `make test`
> (se passa aí, o corretor parseia por construção). Linha inválida numa feature
> de menu = a feature reprova na checagem transversal e vale 0. Ver RUBRICA.

**Nicho do trio:** _(preencha: para quem é essa rede? qual o problema?)_

**Trio:** _(nomes + @usernames do GitHub)_

## Features

Núcleo: preencha só Feature e Dono. Menu: todas as colunas.
No output do `make bench`, cole os números na coluna Big O ou na seção da feature.

| Feature | Dono | Módulo em core/ (app.core.<nome>) | Endpoint que usa | Big O da operação principal | Por quê essa estrutura (1 frase) | Caso autoral (1 frase) |
|---|---|---|---|---|---|---|
| Auth (núcleo) | | — | — | — | — | — |
| Posts (núcleo) | | — | — | — | — | — |
| Feed (núcleo) | | — | — | — | — | — |
| Perfil (núcleo) | | — | — | — | — | — |
| Follow (núcleo) | | — | — | — | — | — |
| Curtidas (núcleo) | | — | — | — | — | — |
| Comentários (núcleo) | | — | — | — | — | — |
| Seed fake (núcleo) | | — | — | — | — | — |

## Medições (features avançadas)

Cole aqui o output do `make bench` de cada avançada + 1 frase de interpretação
("a trie só ganha do bisect a partir de ~N porque...").

## Uso de IA

Onde e como o trio usou IA (ferramenta, para quê). IA é permitida — a
contrapartida é a defesa ao vivo. Ver RUBRICA.

## Congelamento (preencher na sexta do MVP)

O que cortamos da semana 2 e por quê (~5 linhas). Commit até a sexta, senão −2 de produto.
