"""Granja da Semana: quem treinou em mais dias distintos nesta semana.

Python puro: só ids, usernames e `date`. Quem converte o horário do check-in
para o dia no fuso America/Recife é o service; aqui chega o dia pronto.

A semana vai de segunda a domingo e zera toda segunda: cada semana tem a sua
própria contagem, então ninguém carrega vantagem da semana passada.
"""

import heapq
from collections import Counter
from dataclasses import dataclass
from datetime import date, timedelta


def segunda_da_semana(dia: date) -> date:
    """A segunda-feira que abre a semana de `dia`. O(1)."""
    return dia - timedelta(days=dia.weekday())


@dataclass(frozen=True)
class Colocado:
    usuario_id: int
    username: str
    dias_treinados: int


class _PiorPrimeiro:
    """Ordem do heap de top-K: o colocado mais fraco fica na raiz.

    Mais fraco = menos dias; no empate, o username que vem DEPOIS no
    alfabeto (a granja desempata em ordem alfabética, então ele perde).
    """

    __slots__ = ("colocado",)

    def __init__(self, colocado: Colocado) -> None:
        self.colocado = colocado

    def __lt__(self, outro: "_PiorPrimeiro") -> bool:
        a, b = self.colocado, outro.colocado
        if a.dias_treinados != b.dias_treinados:
            return a.dias_treinados < b.dias_treinados
        return a.username > b.username


def top_k(candidatos: list[Colocado], k: int) -> list[Colocado]:
    """Os k melhores, do 1º ao k-ésimo. O(n log k) com um heap de tamanho k.

    O heap guarda só os k melhores vistos até agora, com o pior deles na raiz.
    Cada candidato novo só entra se for melhor que essa raiz, e aí a expulsa.
    """
    if k <= 0:
        return []
    heap: list[_PiorPrimeiro] = []
    for colocado in candidatos:
        item = _PiorPrimeiro(colocado)
        if len(heap) < k:
            heapq.heappush(heap, item)
        elif heap[0] < item:
            heapq.heapreplace(heap, item)
    # Esvaziar o heap devolve do pior para o melhor; invertemos no fim. O(k log k).
    return [heapq.heappop(heap).colocado for _ in range(len(heap))][::-1]


class GranjaDaSemana:
    """Dias distintos com treino, por semana e por usuário.

    - _dias[segunda][usuario_id] = Counter {dia: check-ins naquele dia}
      (os dias treinados são as chaves; a contagem existe para que apagar um
      de dois treinos do mesmo dia não tire o dia)

    - registrar ou remover um treino: O(1) (dois lookups em dict + Counter)
    - dias treinados de alguém na semana: O(1)
    - ranking de n participantes: O(n log k), via top_k
    - reconstruir do zero: O(t check-ins), só no startup
    """

    def __init__(self) -> None:
        self._dias: dict[date, dict[int, Counter[date]]] = {}

    def reconstruir(self, treinos: list[tuple[int, date]]) -> None:
        """Chamado no startup com todos os pares (usuario_id, dia do treino)."""
        self._dias = {}
        for usuario_id, dia in treinos:
            self.registrar_treino(usuario_id, dia)

    def registrar_treino(self, usuario_id: int, dia: date) -> None:
        """O(1). Dois treinos no mesmo dia contam como um dia só."""
        semana = self._dias.setdefault(segunda_da_semana(dia), {})
        semana.setdefault(usuario_id, Counter())[dia] += 1

    def remover_treino(self, usuario_id: int, dia: date) -> None:
        """O(1). Desfaz um registrar_treino (o post do treino foi apagado).

        O dia só sai da conta quando não sobra nenhum treino nele.
        """
        dias = self._dias.get(segunda_da_semana(dia), {}).get(usuario_id)
        if not dias or dias[dia] == 0:
            return
        dias[dia] -= 1
        if dias[dia] == 0:
            del dias[dia]

    def dias_treinados(self, usuario_id: int, segunda: date) -> int:
        return len(self._dias.get(segunda, {}).get(usuario_id, ()))

    def dias_da_semana(self, usuario_id: int, segunda: date) -> set[date]:
        """Os dias com treino de alguém na semana (cópia)."""
        return set(self._dias.get(segunda, {}).get(usuario_id, ()))

    def ranking(
        self, participantes: dict[int, str], segunda: date, k: int
    ) -> list[Colocado]:
        """Top k entre `participantes` (usuario_id -> username) na semana."""
        candidatos = [
            Colocado(usuario_id, username, self.dias_treinados(usuario_id, segunda))
            for usuario_id, username in participantes.items()
        ]
        return top_k(candidatos, k)


# O singleton que a API vai importar (service da granja e lifespan em main.py).
granja = GranjaDaSemana()
