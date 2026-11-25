"""GET /granja: ranking da semana entre eu e quem eu sigo."""

from datetime import date, datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.core.datas import dia_em_recife
from app.core.granja import segunda_da_semana
from app.db import SessionLocal
from app.models.post import Post
from app.models.treino import Treino
from app.models.user import User
from app.services.granja import reconstruir

HOJE = dia_em_recife(datetime.now(timezone.utc))
SEGUNDA = segunda_da_semana(HOJE)


def _treinos(username: str, *dias: date) -> None:
    """Grava check-ins direto no banco (com dia escolhido) e recarrega a granja."""
    with SessionLocal() as db:
        autor = db.query(User).filter_by(username=username).one()
        for dia in dias:
            db.add(Post(autor_id=autor.id, texto="treino", treino=Treino(autor_id=autor.id, dia=dia)))
        db.commit()
        reconstruir(db)


def _dia(n: int) -> date:
    return SEGUNDA + timedelta(days=n)


def _resumo(corpo: dict) -> list[tuple[int, str, int]]:
    return [(c["posicao"], c["usuario"]["username"], c["dias_treinados"]) for c in corpo["items"]]


def test_ranking_entre_eu_e_quem_eu_sigo(client, logar):
    eu = logar("edu")
    for nome in ("ana", "bia", "caio", "estranho"):
        logar(nome)
    for nome in ("ana", "bia", "caio"):
        client.post(f"/usuarios/{nome}/follow", headers=eu)
    _treinos("caio", _dia(0), _dia(1), _dia(2))
    _treinos("bia", _dia(0), _dia(1))
    _treinos("ana", _dia(0), _dia(1), _dia(1))  # dois no mesmo dia: 2 dias
    _treinos("edu", _dia(0))
    _treinos("estranho", *(_dia(n) for n in range(7)))  # não sigo: fica de fora

    r = client.get("/granja", headers=eu)

    assert r.status_code == 200
    corpo = r.json()
    assert corpo["semana_inicio"] == SEGUNDA.isoformat()
    assert _resumo(corpo) == [(1, "caio", 3), (2, "ana", 2), (3, "bia", 2), (4, "edu", 1)]
    assert set(corpo["items"][0]["usuario"]) == {"username", "name", "avatar_url"}
    assert corpo["eu"]["posicao"] == 4
    # logo acima de mim está a bia, com 2 dias: empatar não basta ("bia" < "edu")
    assert corpo["alvo"]["usuario"]["username"] == "bia"
    assert corpo["alvo"]["faltam_dias"] == 2


def test_minha_linha_vem_mesmo_fora_do_top_k(client, logar):
    eu = logar("zeca")
    logar("ana")
    logar("bia")
    client.post("/usuarios/ana/follow", headers=eu)
    client.post("/usuarios/bia/follow", headers=eu)
    _treinos("ana", _dia(0), _dia(1))
    _treinos("bia", _dia(0))

    corpo = client.get("/granja?k=1", headers=eu).json()

    assert _resumo(corpo) == [(1, "ana", 2)]
    assert (corpo["eu"]["posicao"], corpo["eu"]["dias_treinados"]) == (3, 0)
    assert corpo["alvo"]["usuario"]["username"] == "bia"
    assert corpo["alvo"]["faltam_dias"] == 2


def test_empatar_basta_quando_venho_antes_no_alfabeto(client, logar):
    eu = logar("ana")
    logar("bia")
    client.post("/usuarios/bia/follow", headers=eu)
    _treinos("bia", _dia(0), _dia(1))
    _treinos("ana", _dia(0))

    alvo = client.get("/granja", headers=eu).json()["alvo"]

    assert (alvo["usuario"]["username"], alvo["faltam_dias"]) == ("bia", 1)


def test_quem_esta_em_primeiro_nao_tem_alvo(client, logar):
    eu = logar("ana")

    corpo = client.get("/granja", headers=eu).json()

    assert _resumo(corpo) == [(1, "ana", 0)]
    assert corpo["alvo"] is None
    assert corpo["dias_que_ainda_contam"] == 7 - HOJE.weekday()


def test_semana_passada_nao_conta(client, logar):
    eu = logar("ana")
    _treinos("ana", SEGUNDA - timedelta(days=1))

    assert client.get("/granja", headers=eu).json()["eu"]["dias_treinados"] == 0


def test_startup_reconstroi_a_granja_dos_check_ins(client, logar):
    from app.main import app

    eu = logar("ana")
    r = client.post("/treinos", json={"texto": "barra", "exercicios": []}, headers=eu)
    assert r.status_code == 201

    with TestClient(app) as reiniciado:  # o lifespan roda de novo
        corpo = reiniciado.get("/granja", headers=eu).json()

    assert corpo["eu"]["dias_treinados"] == 1
    assert corpo["dias_que_ainda_contam"] == 7 - HOJE.weekday() - 1  # hoje já contou


def test_granja_pede_login(client):
    assert client.get("/granja").status_code == 401
