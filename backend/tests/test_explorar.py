import pytest

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


def test_explorar_mostra_a_rede_toda_mais_novo_primeiro(client, usuarios):
    usuarios("ana")
    client.post("/posts", json={"texto": "post da ana"})
    usuarios("bia")
    client.post("/treinos", json={"texto": "treino da bia"})
    client.post("/posts", json={"texto": "outro da bia"})

    usuarios("ana")
    pagina = client.get("/explorar").json()
    assert [p["texto"] for p in pagina["items"]] == ["outro da bia", "treino da bia", "post da ana"]
    assert (pagina["total"], pagina["offset"], pagina["limit"]) == (3, 0, 20)
    assert pagina["items"][1]["treino"] is not None

    # "carregar mais"
    assert [p["texto"] for p in client.get("/explorar?offset=2&limit=1").json()["items"]] == ["post da ana"]


def test_autoral_explorar_vazio_e_alem_do_fim(client, usuarios):
    # quem chega numa rede sem posts recebe página vazia, não erro
    usuarios("ana")
    assert client.get("/explorar").json() == {"items": [], "total": 0, "offset": 0, "limit": 20}
    client.post("/posts", json={"texto": "único"})
    pagina = client.get("/explorar?offset=5").json()
    assert (pagina["items"], pagina["total"]) == ([], 1)


@pytest.mark.parametrize("query", ["offset=-1", "limit=0", "limit=101"])
def test_paginacao_invalida(client, usuarios, query):
    usuarios("ana")
    assert client.get(f"/explorar?{query}").status_code == 422
