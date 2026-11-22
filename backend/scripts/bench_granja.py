"""Benchmark da Granja: top-K com heap (core/granja.py) contra ordenar todo mundo.

Rode com: make bench  (ou: cd backend && uv run python scripts/bench_granja.py)
"""

import random
import sys
import timeit
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.granja import Colocado, top_k

K = 10


def ordenar_tudo(candidatos: list[Colocado], k: int) -> list[Colocado]:
    """A versão simples: ordena os n participantes e fatia os k primeiros. O(n log n)."""
    return sorted(candidatos, key=lambda c: (-c.dias_treinados, c.username))[:k]


def main() -> None:
    sorteio = random.Random(42)
    print(f"Granja da Semana: top {K} (tempo médio por ranking)")
    print(f"{'participantes':>13} | {'heap (top_k)':>12} | {'sorted()[:k]':>12}")
    for n in (100, 1_000, 10_000, 100_000):
        candidatos = [
            Colocado(i, f"user{i:06d}", sorteio.randint(0, 7)) for i in range(n)
        ]
        assert top_k(candidatos, K) == ordenar_tudo(candidatos, K)

        vezes = max(1, 200_000 // n)
        heap = min(timeit.repeat(lambda: top_k(candidatos, K), number=vezes, repeat=5))
        sort = min(
            timeit.repeat(lambda: ordenar_tudo(candidatos, K), number=vezes, repeat=5)
        )
        print(f"{n:>13} | {heap / vezes * 1000:>9.3f} ms | {sort / vezes * 1000:>9.3f} ms")


if __name__ == "__main__":
    main()
