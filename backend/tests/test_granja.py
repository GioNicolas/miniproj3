"""Testes da estrutura da Granja da Semana (core/granja.py), sem servidor."""

import random
from datetime import date

from app.core.granja import Colocado, GranjaDaSemana, segunda_da_semana, top_k

SEGUNDA = date(2026, 11, 23)
TERCA = date(2026, 11, 24)
QUARTA = date(2026, 11, 25)
DOMINGO = date(2026, 11, 29)
PROXIMA_SEGUNDA = date(2026, 11, 30)


def test_segunda_da_semana_vai_de_segunda_a_domingo():
    assert segunda_da_semana(SEGUNDA) == SEGUNDA
    assert segunda_da_semana(DOMINGO) == SEGUNDA
    assert segunda_da_semana(PROXIMA_SEGUNDA) == PROXIMA_SEGUNDA


def test_dois_treinos_no_mesmo_dia_contam_um_dia_so():
    granja = GranjaDaSemana()
    granja.registrar_treino(1, TERCA)
    granja.registrar_treino(1, TERCA)
    granja.registrar_treino(1, QUARTA)

    assert granja.dias_treinados(1, SEGUNDA) == 2


def test_a_granja_zera_toda_segunda():
    granja = GranjaDaSemana()
    granja.registrar_treino(1, DOMINGO)

    assert granja.dias_treinados(1, SEGUNDA) == 1
    assert granja.dias_treinados(1, PROXIMA_SEGUNDA) == 0


def test_ranking_mais_dias_primeiro_e_empate_alfabetico():
    granja = GranjaDaSemana()
    for dia in (SEGUNDA, TERCA, QUARTA):
        granja.registrar_treino(1, dia)  # caio: 3 dias
    for dia in (SEGUNDA, TERCA):
        granja.registrar_treino(2, dia)  # bia: 2 dias
        granja.registrar_treino(3, dia)  # ana: 2 dias

    ranking = granja.ranking({1: "caio", 2: "bia", 3: "ana", 4: "duda"}, SEGUNDA, k=10)

    assert [(c.username, c.dias_treinados) for c in ranking] == [
        ("caio", 3),
        ("ana", 2),
        ("bia", 2),
        ("duda", 0),
    ]


def test_ranking_corta_no_k_e_so_olha_os_participantes():
    granja = GranjaDaSemana()
    granja.registrar_treino(9, SEGUNDA)  # não participa (não é seguido)
    granja.registrar_treino(1, SEGUNDA)

    ranking = granja.ranking({1: "ana", 2: "bia"}, SEGUNDA, k=1)

    assert [c.username for c in ranking] == ["ana"]


def test_top_k_com_heap_da_o_mesmo_que_ordenar_tudo():
    sorteio = random.Random(42)
    candidatos = [
        Colocado(i, f"user{i:03d}", sorteio.randint(0, 7)) for i in range(300)
    ]
    ordenado = sorted(candidatos, key=lambda c: (-c.dias_treinados, c.username))

    for k in (0, 1, 10, 300, 500):
        assert top_k(candidatos, k) == ordenado[:k]


def test_reconstruir_apaga_o_estado_anterior():
    granja = GranjaDaSemana()
    granja.registrar_treino(1, SEGUNDA)

    granja.reconstruir([(2, TERCA)])

    assert granja.dias_treinados(1, SEGUNDA) == 0
    assert granja.dias_treinados(2, SEGUNDA) == 1
