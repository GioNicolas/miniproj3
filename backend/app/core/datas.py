"""Datas no fuso da rede, em Python puro.

O "dia do treino" é o dia em Recife, não em UTC: quem treina às 22h conta o
treino no mesmo dia, e não no seguinte. Frango (#11) e Granja (#12) contam
dias distintos com esta mesma regra.
"""

from datetime import date, datetime, timedelta, timezone

# Recife não tem horário de verão, então o fuso é fixo em UTC−3 e não depende
# da base de fusos do sistema (que não vem instalada no Windows).
FUSO_RECIFE = timezone(timedelta(hours=-3), "America/Recife")


def dia_em_recife(momento: datetime) -> date:
    return momento.astimezone(FUSO_RECIFE).date()
