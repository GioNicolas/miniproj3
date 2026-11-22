from datetime import date, datetime, timezone

import pytest

from app.core.datas import dia_em_recife
from app.deps import get_current_user
from app.main import app
from app.models.user import User


@pytest.fixture
def usuarios(client):
    ids = {}
    for nome in ("ana", "bia"):
        resposta = client.post("/usuarios", json={"username": nome, "name": nome.title()})
        assert resposta.status_code == 201
        ids[nome] = resposta.json()["id"]

    def autenticar(nome):
        app.dependency_overrides[get_current_user] = lambda: User(id=ids[nome])

    yield autenticar
    app.dependency_overrides.pop(get_current_user, None)


def hoje() -> str:
    return dia_em_recife(datetime.now(timezone.utc)).isoformat()


def test_treino_vira_post_no_feed_com_os_detalhes(client, usuarios):
    usuarios("ana")
    corpo = {"texto": "3x8 de australiana", "progressao": "australiana", "series": 3, "reps": 8}
    resposta = client.post("/treinos", json=corpo)
    assert resposta.status_code == 201
    post = resposta.json()
    assert post["texto"] == "3x8 de australiana"
    assert post["treino"] == {"progressao": "australiana", "series": 3, "reps": 8}

    assert client.get(f"/posts/{post['id']}").json()["treino"] == post["treino"]
    assert client.get("/usuarios/ana/treinos").json() == {"dias": [hoje()]}


def test_post_comum_nao_conta_como_treino(client, usuarios):
    usuarios("ana")
    post = client.post("/posts", json={"texto": "bom dia, granja"}).json()
    assert post["treino"] is None
    assert client.get("/usuarios/ana/treinos").json() == {"dias": []}


def test_autoral_dois_treinos_no_mesmo_dia_contam_um_dia(client, usuarios):
    # o frango e a granja contam dias distintos: treinar duas vezes não vale dobrado
    usuarios("ana")
    client.post("/treinos", json={"texto": "manhã: negativa"})
    client.post("/treinos", json={"texto": "noite: prancha"})

    resposta = client.get("/usuarios/ana/treinos?dias=28")

    assert resposta.status_code == 200
    assert resposta.json() == {"dias": [hoje()]}


def test_apagar_o_post_apaga_o_treino(client, usuarios):
    usuarios("ana")
    post_id = client.post("/treinos", json={"texto": "treino que não rolou"}).json()["id"]
    assert client.delete(f"/posts/{post_id}").status_code == 204
    assert client.get("/usuarios/ana/treinos").json() == {"dias": []}


def test_treinos_sao_de_cada_um(client, usuarios):
    usuarios("bia")
    client.post("/treinos", json={"texto": "treino da bia"})
    usuarios("ana")
    assert client.get("/usuarios/ana/treinos").json() == {"dias": []}
    assert client.get("/usuarios/bia/treinos").json() == {"dias": [hoje()]}
    assert client.get("/usuarios/ninguem/treinos").status_code == 404


@pytest.mark.parametrize(
    "extra",
    [{"progressao": "Barra Fixa!"}, {"series": 0}, {"reps": 0}, {"texto": "   "}],
)
def test_treino_invalido(client, usuarios, extra):
    usuarios("ana")
    assert client.post("/treinos", json={"texto": "treino", **extra}).status_code == 422


def test_autoral_treino_tarde_da_noite_conta_no_dia_de_recife():
    # 23h30 em Recife já é o dia seguinte em UTC; o treino tem que contar no dia certo
    assert dia_em_recife(datetime(2026, 11, 23, 2, 30, tzinfo=timezone.utc)) == date(2026, 11, 22)
    assert dia_em_recife(datetime(2026, 11, 23, 3, 0, tzinfo=timezone.utc)) == date(2026, 11, 23)
