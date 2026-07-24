# Tries (árvore de prefixos)

## A ideia em 1 parágrafo

Trie é um dict de dicts onde cada nível guarda **uma letra** — uma palavra é o
caminho da raiz até um marcador de fim. A graça: palavras com o mesmo começo
**compartilham** o caminho, então responder "quais palavras começam com
`ca`?" é só descer duas letras e colher o que estiver pendurado ali — sem
varrer a lista inteira, e custando O(len(prefixo)) para achar o ponto de
partida, independente de quantas palavras existam.

Exemplo deste guia (de propósito, fora do catálogo): **dicionário de palavras
do português**.

```
palavras: casa, caso, cama, moto

raiz ── c ── a ── s ── a ✓
        │         └── o ✓
        └────── m ── a ✓          ← "ca" compartilhado por 3 palavras
     └─ m ── o ── t ── o ✓
```

## A estrutura em Python puro

```python
class DicionarioPorPrefixo:
    """Trie: dicts aninhados letra a letra, com marcador de fim de palavra.

    - inserir palavra: O(len(palavra))
    - buscar palavra exata: O(len(palavra))
    - listar por prefixo: O(len(prefixo) + tamanho do resultado)
    (nenhuma operação depende do TOTAL de palavras — essa é a venda da trie)
    """

    FIM = "$"   # marca "aqui termina uma palavra" ("cas" não é palavra, "casa" é)

    def __init__(self) -> None:
        self._raiz: dict = {}

    def reconstruir(self, palavras: list[str]) -> None:
        self._raiz = {}
        for p in palavras:
            self.inserir(p)

    def inserir(self, palavra: str) -> None:
        """Desce letra a letra criando os níveis que faltarem. O(len)."""
        no = self._raiz
        for letra in palavra.lower():
            no = no.setdefault(letra, {})
        no[self.FIM] = True

    def contem(self, palavra: str) -> bool:
        """Palavra exata (não prefixo). O(len)."""
        no = self._descer(palavra)
        return no is not None and self.FIM in no

    def com_prefixo(self, prefixo: str, limite: int = 10) -> list[str]:
        """Todas as palavras que começam com o prefixo (até `limite`)."""
        no = self._descer(prefixo)
        if no is None:
            return []
        resultado: list[str] = []
        self._colher(no, prefixo.lower(), resultado, limite)
        return resultado

    def _descer(self, texto: str) -> dict | None:
        no = self._raiz
        for letra in texto.lower():
            if letra not in no:
                return None
            no = no[letra]
        return no

    def _colher(self, no: dict, atual: str, resultado: list[str], limite: int) -> None:
        """Recursão (ver arvores.md): visita a subárvore juntando as letras."""
        if len(resultado) >= limite:
            return
        if self.FIM in no:
            resultado.append(atual)
        for letra, filho in no.items():
            if letra != self.FIM:
                self._colher(filho, atual + letra, resultado, limite)
```

## Big O honesto

A comparação justa da trie NÃO é com a varredura burra — é com a **lista
ordenada + `bisect`** que você já viu na busca binária:

| Operação | Trie | Lista ordenada + bisect | Varredura (`startswith` em tudo) |
|---|---|---|---|
| inserir | O(len) | O(n) — insort desloca a lista | O(1) append |
| prefixo | O(len + resultado) | O(log n + resultado) | O(n · len) |
| memória | ALTA — um dict por letra | baixa | baixa |

Leia a tabela com honestidade: o bisect é O(log n), e log de 1 milhão é ~20 —
na prática a trie e o bisect **empatam na consulta** para qualquer N deste
projeto, e a trie perde feio em memória. Onde a trie ganha: inserções
frequentes no meio (o insort desloca a lista inteira) e recursos extras
(contar por prefixo, autocorreção). Medir trie vs bisect e explicar o
resultado é exatamente a discussão que a rubrica quer.

## Como medir (10 linhas)

```python
import bisect
import random
import string
import timeit

for n in (1_000, 10_000, 100_000):
    palavras = ["".join(random.choices(string.ascii_lowercase, k=8)) for _ in range(n)]
    trie = DicionarioPorPrefixo(); trie.reconstruir(palavras)   # FORA do timer
    ordenada = sorted(palavras)

    def com_trie():
        trie.com_prefixo("ca")

    def com_bisect():
        i = bisect.bisect_left(ordenada, "ca")
        [p for p in ordenada[i:i + 50] if p.startswith("ca")][:10]

    print(n,
          "trie:", min(timeit.repeat(com_trie, number=100, repeat=5)) / 100,
          "bisect:", min(timeit.repeat(com_bisect, number=100, repeat=5)) / 100)
```

Cole os números no `DECISIONS.md` + 1 frase de interpretação. Aqui é COMUM a
versão "ingênua" (bisect) empatar ou ganhar — resultado válido que vale ponto
se você explicar o porquê (log n minúsculo + dicts aninhados têm overhead).

## Onde isso aparece no mundo real

Autocomplete de buscadores e teclados de celular, corretor ortográfico,
roteamento de IP (prefixos binários), sugestão de hashtags/domínios.
