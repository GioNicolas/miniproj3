# Rubrica

Versão 4.2. Total: 100 pontos, mais bônus.

O núcleo é definido pelos testes `@skip`. As features de menu estão no
[`CATALOGO.md`](CATALOGO.md) e seguem o [`CONTRATO.md`](CONTRATO.md).

## Pontuação

| Bloco | Regra | Máximo |
|---|---|---|
| Núcleo | 8 features obrigatórias | 25 |
| Menu intermediário | P = 3, M = 5, G = 7; só 3 features P pontuam | 40 |
| Menu avançado | M = 8, G = 10 | 25 |
| Produto | vídeo = 7; demo ao vivo = 3 | 10 |
| Bônus | deploy +5; excedente +3; melhor `DECISIONS.md` +2 | acima de 100 |

Para fechar o bloco intermediário, exemplos válidos são 8 M ou 1 G + 7 M.
Três P + cinco M somam apenas 34. No avançado, três M somam 24; é preciso uma
G ou uma quarta feature.

## Cálculo da nota

Para cada feature de menu:

1. teste oculto falhou → 0;
2. `core/` não existe, não é usado ou a linha do `DECISIONS.md` é inválida → 0;
3. avançada sem benchmark reproduzível e interpretação vira intermediária G,
   vale 7 e entra no limite de 40;
4. teste autoral ausente ou inválido → valor × 0,7;
5. defesa → valor × 1, × 0,5 ou × 0;
6. apenas as três maiores features P pontuam;
7. aplicam-se os limites de 40 e 25.

O núcleo vale:

```text
25 × (testes do núcleo passando ÷ total de testes do núcleo)
```

`skipped` significa feature não entregue.

## Gates das features de menu

- O endpoint deve seguir método, rota, campos e status do `CONTRATO.md`.
- A estrutura fica em `backend/app/core/` como Python puro.
- O endpoint deve importar e usar o módulo declarado no `DECISIONS.md`.
- Cada feature precisa de dono e teste `test_autoral_<feature>.py`.
- O teste autoral cobre algo fora do contrato e precisa falhar quando a
  feature é sabotada.

Upload é tecnologia extra e não exige `core/` nem benchmark.

Avançadas exigem `scripts/bench_<feature>.py`, execução por `make bench`,
resultado no `DECISIONS.md` e uma frase interpretando os números. O corretor
pode repetir a medição. A alternativa simples vencer com poucos dados é um
resultado válido.

## Trabalho em trio

- Toda feature tem um dono no `DECISIONS.md`.
- Cada integrante é dono de pelo menos uma feature de menu M ou G.
- Toda feature pontuada tem uma issue fechada pelo PR do dono com `Closes #N`.
- Cada integrante deve ter pelo menos 5 commits relevantes e 2 PRs aprovados
  por outro membro.

Issues, commits e reviews não alteram a nota automaticamente. Eles ajudam a
escolher o que será pedido na defesa.

## Defesa

Cada integrante modifica ao vivo uma feature própria, sem IA. O sorteio
prioriza features intermediárias e avançadas e usa os arquétipos de
[`docs/defesa.md`](docs/defesa.md).

| Resultado | Multiplicador |
|---|---|
| Alterou e a verificação passou | 100% |
| Localizou e explicou corretamente, mas não terminou | 50% |
| Não soube onde ou como alterar | 0% |

Quem recebe 0 defende uma segunda feature. Dois resultados 0 zeram as duas
features sorteadas e reduzem as outras features desse integrante para 50%.

O integrante também explica e sabota o teste autoral. Em feature avançada,
prevê o resultado do benchmark antes de executá-lo.

Durante a defesa:

- editor sem assistentes de IA;
- terminal limpo;
- navegador apenas em localhost, Swagger e documentação do projeto;
- autocomplete comum e LSP são permitidos.

## Uso de IA

IA é permitida e deve ser registrada no `DECISIONS.md`. Cada integrante precisa
explicar, localizar e modificar o código entregue. Código que ninguém domina
não pontua.

## Produto

### Vídeo: 7 pontos

Vídeo de aproximadamente 4 minutos. O checklist tem seis itens:

1. cadastro;
2. login;
3. criação de post;
4. follow e feed;
5. até duas features fortes do trio;
6. uma decisão registrada no `DECISIONS.md`.

A nota é `7 × itens concluídos ÷ 6`, arredondada para o múltiplo de 0,5 mais
próximo.

### Demo ao vivo: 3 pontos

Pitch de 3 minutos: problema, público e solução, seguido de uma pergunta.
Cada parte vale 1 ponto.

### Bônus

- Deploy público funcionando: +5.
- Cada feature M, G ou avançada acima do limite do bloco: +1, máximo +3.
- Melhor `DECISIONS.md` da turma: +2.

O deploy é verificado pelo fluxo cadastro → login → post → follow → feed.

## Datas

| Marco | Data |
|---|---|
| Início | **[DATA DE INÍCIO]** |
| Entrega final | **24/10/2026** |

Se o grader divergir deste contrato, vale o `CONTRATO.md`. Abram uma issue no
repositório da turma.
