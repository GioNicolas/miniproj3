# Rubrica

A nota vai de 0 a 100, mais bônus. São quatro blocos:

| Bloco | O que conta | Máximo |
|---|---|---|
| Núcleo | os testes de `backend/tests/test_nucleo.py` passando | 25 |
| Menu intermediário | features do [`CATALOGO.md`](CATALOGO.md): P = 3, M = 5, G = 7 | 40 |
| Menu avançado | features avançadas: M = 8, G = 10 | 25 |
| Produto | vídeo (7) e pitch ao vivo (3) | 10 |

Bônus: deploy público (+5), features além do limite (até +3) e melhor
`DECISIONS.md` da turma (+2).

## Núcleo

```text
nota do núcleo = 25 × testes do núcleo passando ÷ total de testes do núcleo
```

Teste `skipped` conta como não entregue.

## Features de menu

### Quando uma feature conta

Uma feature de menu só pontua se cumprir os quatro requisitos. Faltou um, vale 0.

1. O teste oculto passa. Ele segue método, rota, campos e status do
   [`CONTRATO.md`](CONTRATO.md).
2. A estrutura de dados está em `backend/app/core/`, em Python puro.
3. O endpoint importa e usa esse módulo. O corretor sabota o `core/` e o
   endpoint precisa quebrar junto.
4. A linha da feature no `DECISIONS.md` está preenchida e válida (`make test`
   confere o formato).

Upload é exceção: não precisa de `core/` nem de benchmark.

### Quanto ela vale

O valor da feature (3, 5, 7, 8 ou 10) é multiplicado por:

| Situação | Multiplicador |
|---|---|
| Sem teste autoral, ou o teste não falha quando a feature é sabotada | × 0,7 |
| Defesa: alterou e passou | × 1 |
| Defesa: achou e explicou, mas não terminou | × 0,5 |
| Defesa: não soube onde nem como alterar | × 0 |

O teste autoral fica em `test_autoral_<feature>.py` e testa algo que o
contrato não cobre.

### Limites

- Das features P, só as três de maior valor contam. Para chegar a 40 no
  intermediário, é preciso M ou G: 8 M, ou 1 G + 7 M.
- O intermediário para em 40 e o avançado em 25. Três avançadas M somam 24;
  para chegar a 25 é preciso uma G ou uma quarta feature.

### Benchmark das avançadas

Cada feature avançada precisa de:

- `scripts/bench_<feature>.py`, rodando por `make bench`;
- o resultado colado no `DECISIONS.md`;
- uma frase explicando o que os números mostram.

O corretor pode rodar a medição de novo. Se a versão simples ganhar com poucos
dados, o resultado é válido, desde que vocês expliquem por quê.

Avançada sem benchmark válido vira intermediária G: vale 7 e entra no limite
de 40.

## Exemplo de cálculo

Um trio fictício:

| Bloco | Situação | Pontos |
|---|---|---|
| Núcleo | 9 de 10 testes passando | 22,5 |
| Intermediário | Comunidades (G) | 7 |
| | Sugestões de quem seguir (M) | 5 |
| | Hashtags com índice invertido (M) | 5 |
| | Notificações (M), sem teste autoral: 5 × 0,7 | 3,5 |
| | Enquetes (M), defesa pela metade: 5 × 0,5 | 2,5 |
| | Trending, Bookmarks, Streak e Amigos em comum (P): só 3 contam | 9 |
| | Graus de separação, sem benchmark: vira G | 7 |
| | Total do intermediário | 39 |
| Avançado | Top-K (M) + Autocomplete (G) | 18 |
| Produto | vídeo com 5 de 6 itens + pitch completo | 9 |
| Bônus | deploy funcionando | +5 |
| **Total** | | **93,5** |

## Trabalho em trio

- Toda feature tem um dono no `DECISIONS.md`.
- Cada integrante é dono de pelo menos uma feature de menu M ou G.
- Toda feature que pontua tem uma issue, fechada pelo PR do dono com
  `Closes #N`.
- Cada integrante tem pelo menos 5 commits relevantes e 2 PRs aprovados por
  outro membro.

Issues, commits e reviews não mudam a nota diretamente. Eles servem para
escolher o que cada um vai defender.

## Defesa

Cada integrante altera ao vivo uma feature própria, sem IA. A feature é
sorteada, com prioridade para intermediárias e avançadas. Os tipos de
alteração estão em [`docs/defesa.md`](docs/defesa.md).

O integrante também explica o próprio teste autoral e sabota a feature para
mostrar o teste falhando. Em feature avançada, diz o que espera do benchmark
antes de rodar.

Quem tira 0 defende uma segunda feature. Se tirar 0 de novo, as duas features
sorteadas valem 0 e as outras features desse integrante caem para 50%.

Durante a defesa vale editor sem assistente de IA, autocomplete comum e LSP,
terminal limpo e navegador só em localhost, Swagger e documentação do projeto.

## Uso de IA

IA é permitida. Registrem no `DECISIONS.md` qual ferramenta usaram e para quê.
Código que ninguém do trio sabe explicar e alterar não pontua, pela regra da
defesa.

## Produto

### Vídeo (7 pontos)

Cerca de 4 minutos, mostrando:

1. cadastro;
2. login;
3. criação de post;
4. follow e feed;
5. até duas features fortes do trio;
6. uma decisão de produto do `DECISIONS.md`: o que vocês escolheram, o que
   cortaram e por quê.

```text
nota do vídeo = 7 × itens mostrados ÷ 6, arredondada para o múltiplo de 0,5 mais próximo
```

### Pitch ao vivo (3 pontos)

Três minutos, mais uma pergunta da banca. Um ponto para cada parte, todas
tiradas da seção Produto do `DECISIONS.md`:

- o problema;
- quem é o público;
- como a rede resolve.

## Bônus

- **Deploy público: +5.** Conferimos o fluxo cadastro → login → post →
  follow → feed.
- **Features além do limite: +1 cada, até +3.** Vale para M, G ou avançada
  que sobrou depois de o bloco atingir 40 ou 25.
- **Melhor `DECISIONS.md` da turma: +2.** Ganha o que deixa mais claro para
  quem é a rede, o que ficou de fora e por quê, e o que os números do
  benchmark mostraram.

## Datas

| Marco | Data |
|---|---|
| Início | **[DATA DE INÍCIO]** |
| Entrega final | **24/10/2026** |

Se o corretor discordar do `CONTRATO.md`, vale o contrato. Abram uma issue no
repositório da turma.
