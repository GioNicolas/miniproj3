from datetime import date, timedelta

from app.core.frango import calcular_frango, nivel_da_forca

HOJE = date(2026, 11, 25)


def dias_seguidos(n: int, ate: date = HOJE) -> set[date]:
    return {ate - timedelta(days=i) for i in range(n)}


def test_quem_nunca_treinou_e_frango_sem_definhar():
    estado = calcular_frango(set(), HOJE)
    assert (estado.forca, estado.nivel, estado.dias_sem_treinar, estado.definhando) == (0, "Pintinho", None, False)
    assert (estado.proximo_nivel, estado.falta_para_proximo) == ("Frango", 25)


def test_cada_dia_de_treino_soma_dez_e_o_teto_e_cem():
    assert calcular_frango(dias_seguidos(3), HOJE).forca == 30
    estado = calcular_frango(dias_seguidos(15), HOJE)
    assert (estado.forca, estado.nivel, estado.proximo_nivel, estado.falta_para_proximo) == (100, "Monstro", None, 0)


def test_dois_treinos_no_mesmo_dia_contam_um_so():
    assert calcular_frango([HOJE, HOJE], HOJE).forca == 10


def test_um_dia_de_folga_nao_pune():
    estado = calcular_frango(dias_seguidos(5, ate=HOJE - timedelta(days=1)), HOJE)
    assert (estado.forca, estado.dias_sem_treinar, estado.definhando) == (50, 1, False)


def test_a_partir_do_segundo_dia_sem_treino_perde_cinco_por_dia():
    ultimo = HOJE - timedelta(days=4)
    estado = calcular_frango(dias_seguidos(6, ate=ultimo), HOJE)
    # 60 de força; 4 dias sem treinar: o 1º não pune, os outros 3 tiram 15
    assert (estado.forca, estado.dias_sem_treinar, estado.definhando) == (45, 4, True)
    assert estado.nivel == "Frango"


def test_a_forca_nao_fica_negativa_e_volta_a_crescer():
    longe = date(2026, 1, 1)
    sumido = calcular_frango({longe}, HOJE)
    assert (sumido.forca, sumido.definhando) == (0, True)
    voltou = calcular_frango({longe, HOJE}, HOJE)
    assert (voltou.forca, voltou.dias_sem_treinar, voltou.definhando) == (10, 0, False)


def test_dias_no_futuro_sao_ignorados():
    assert calcular_frango({HOJE + timedelta(days=1)}, HOJE).forca == 0


def test_limites_dos_niveis():
    assert [nivel_da_forca(f) for f in (0, 24, 25, 49, 50, 74, 75, 100)] == [
        "Pintinho", "Pintinho", "Frango", "Frango", "Galo", "Galo", "Monstro", "Monstro",
    ]


def test_frango_no_perfil_e_nivel_no_autor_do_post(client, logar):
    ana, bia = logar("ana"), logar("bia")
    treino = {"texto": "treino", "exercicios": [{"progressao": "flexao", "series": 3, "reps": 10}]}
    client.post("/treinos", json=treino, headers=ana)
    client.post("/posts", json={"texto": "sem treino"}, headers=bia)

    frango = client.get("/usuarios/ana", headers=bia).json()["frango"]
    assert frango == {
        "nivel": "Pintinho", "forca": 10, "dias_sem_treinar": 0, "definhando": False,
        "proximo_nivel": "Frango", "falta_para_proximo": 15,
    }
    autores = {p["autor"]["username"]: p["autor"]["nivel"] for p in client.get("/explorar", headers=ana).json()["items"]}
    assert autores == {"ana": "Pintinho", "bia": "Pintinho"}
