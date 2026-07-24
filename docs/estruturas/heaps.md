# Heaps (com `heapq`)

## A ideia em 1 parágrafo

Heap é uma lista organizada de um jeito esperto onde **o menor item está sempre
na posição 0** — e manter essa promessa custa só O(log n) por inserção/remoção,
em vez de reordenar tudo (O(n log n)). É a estrutura de quem vive perguntando
"**quem é o próximo?**" ou "**quais são os top K?**" sem precisar da lista
inteira ordenada. Python já traz pronta: módulo `heapq` da stdlib, funcionando
em cima de uma `list` comum.

Exemplo deste guia (de propósito, fora do catálogo): **fila de atendimento de
um hospital por gravidade**.

```
chegada:  (3, "dor de cabeça") (1, "infarto") (2, "braço quebrado")

heap:            (1, "infarto")          ← heap[0] é SEMPRE o menor
                /               \
      (3, "dor de cabeça")   (2, "braço quebrado")   ← o resto, "meio ordenado"
```

## A estrutura em Python puro

```python
import heapq


class FilaDeAtendimento:
    """Fila de prioridade: sempre atende o caso mais grave primeiro.

    - chegar paciente: O(log n)
    - atender o mais grave: O(log n)
    - espiar o próximo sem atender: O(1)
    - top K mais graves: O(n log k) via heapq.nsmallest
    """

    def __init__(self) -> None:
        self._fila: list[tuple[int, int, str]] = []   # (gravidade, ordem, nome)
        self._ordem = 0                               # desempate: quem chegou antes

    def chegar(self, gravidade: int, nome: str) -> None:
        """O(log n). gravidade 1 = mais urgente (heapq é de MÍNIMO)."""
        # a tupla compara elemento a elemento: gravidade, depois ordem de chegada.
        # sem o desempate, dois pacientes de gravidade igual = comparar strings.
        heapq.heappush(self._fila, (gravidade, self._ordem, nome))
        self._ordem += 1

    def atender(self) -> str:
        """Remove e devolve o mais grave. O(log n)."""
        _, _, nome = heapq.heappop(self._fila)
        return nome

    def proximo(self) -> str | None:
        """Espia sem remover. O(1) — o menor está sempre em self._fila[0]."""
        return self._fila[0][2] if self._fila else None

    def mais_graves(self, k: int) -> list[str]:
        """Top K sem ordenar a fila inteira: O(n log k), não O(n log n)."""
        return [nome for _, _, nome in heapq.nsmallest(k, self._fila)]
```

Duas pegadinhas do `heapq`: (1) ele é de **mínimo** — para "maior primeiro",
guarde a chave negada (`-pontos`); (2) só a posição 0 é garantida — o resto da
lista NÃO está ordenado, não itere achando que está.

## Big O honesto

| Operação | Heap | Ingênua (ordenar a lista toda) |
|---|---|---|
| inserir | O(log n) | O(1) append… |
| pegar o próximo | O(log n) | …mas O(n log n) no sort na hora de ler |
| top K | O(n log k) | O(n log n) ordena tudo e fatia `[:k]` |
| ler TUDO em ordem | O(n log n) — empata | O(n log n) |

Se você lê a lista inteira ordenada uma vez por dia, `sorted()` empata e é
mais simples — o heap paga quando as perguntas "próximo?"/"top K?" são
frequentes e intercaladas com inserções. Com n = 100, tanto faz; meça.

## Como medir (10 linhas)

```python
import heapq
import random
import timeit

for n in (1_000, 10_000, 100_000):
    gravidades = [random.randint(1, 10_000) for _ in range(n)]   # FORA do timer

    def com_heap():
        heapq.nsmallest(10, gravidades)          # top 10: O(n log k)

    def ingenua():
        sorted(gravidades)[:10]                  # ordena tudo: O(n log n)

    print(n,
          "heap:", min(timeit.repeat(com_heap, number=20, repeat=5)) / 20,
          "sort:", min(timeit.repeat(ingenua, number=20, repeat=5)) / 20)
```

Cole os números no `DECISIONS.md` + 1 frase de interpretação ("o heap só
descola a partir de ~N porque..."). Se o `sorted()` ganhar em N pequeno,
resultado válido — o Timsort do Python é brutalmente otimizado, e ESSA
observação vale ponto.

## Onde isso aparece no mundo real

Escalonador de processos do sistema operacional, Dijkstra no GPS, merge de
arquivos gigantes, "top 10" de qualquer ranking que atualiza o tempo todo.
