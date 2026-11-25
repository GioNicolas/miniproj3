"""O Frango: o avatar que fica forte com a constância e definha quando você some.

Python puro: recebe os dias com treino (já no fuso America/Recife, quem converte
é o service) e o dia de hoje, e devolve o estado do frango. Sem banco, sem cache:
a força é uma função só do histórico, então o mesmo histórico dá sempre o mesmo frango.

A regra (issue #11):
- cada dia com treino soma GANHO_POR_TREINO de força, até FORCA_MAXIMA;
- um dia de folga não pune. A partir do 2º dia seguido sem treinar, perde
  PERDA_POR_DIA por dia, até 0.
Ele perde força aos poucos em vez de zerar como um streak: castiga sem
destruir, e quem falta três dias não perde tudo o que construiu.

Custo: O(D + T), D = dias entre o primeiro treino e hoje, T = dias treinados.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, timedelta

GANHO_POR_TREINO = 10
PERDA_POR_DIA = 5
FORCA_MAXIMA = 100
FOLGA_SEM_PUNICAO = 1  # dias seguidos sem treinar que ainda não tiram força

# (força mínima, nome), do mais forte para o mais fraco
NIVEIS = (
    (75, "Monstro"),
    (50, "Galo"),
    (25, "Frango de granja"),
    (0, "Frango"),
)


@dataclass(frozen=True)
class EstadoFrango:
    forca: int
    nivel: str
    dias_sem_treinar: int | None  # None: ainda não treinou nenhuma vez
    definhando: bool
    proximo_nivel: str | None  # None: já é Monstro
    falta_para_proximo: int  # força que falta para o próximo nível (0 se já é Monstro)


def nivel_da_forca(forca: int) -> str:
    for minimo, nome in NIVEIS:
        if forca >= minimo:
            return nome
    return NIVEIS[-1][1]


def _proximo(forca: int) -> tuple[str | None, int]:
    for minimo, nome in reversed(NIVEIS):
        if minimo > forca:
            return nome, minimo - forca
    return None, 0


def calcular_frango(dias_treinados: Iterable[date], hoje: date) -> EstadoFrango:
    """Estado do frango em `hoje`. Dias depois de hoje são ignorados."""
    dias = {dia for dia in dias_treinados if dia <= hoje}
    if not dias:
        proximo, falta = _proximo(0)
        return EstadoFrango(0, nivel_da_forca(0), None, False, proximo, falta)

    forca = 0
    folga = 0  # dias seguidos sem treinar até o dia corrente
    dia = min(dias)
    while dia <= hoje:
        if dia in dias:
            forca = min(FORCA_MAXIMA, forca + GANHO_POR_TREINO)
            folga = 0
        else:
            folga += 1
            if folga > FOLGA_SEM_PUNICAO:
                forca = max(0, forca - PERDA_POR_DIA)
        dia += timedelta(days=1)

    dias_sem_treinar = (hoje - max(dias)).days
    proximo, falta = _proximo(forca)
    return EstadoFrango(
        forca=forca,
        nivel=nivel_da_forca(forca),
        dias_sem_treinar=dias_sem_treinar,
        definhando=dias_sem_treinar > FOLGA_SEM_PUNICAO,
        proximo_nivel=proximo,
        falta_para_proximo=falta,
    )
