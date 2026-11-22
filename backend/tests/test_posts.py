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


def test_crud_e_permissoes(client, usuarios):
    usuarios("ana")
    resposta = client.post("/posts", json={"texto": "  primeiro post  "})
    assert resposta.status_code == 201
    post = resposta.json()
    assert post["texto"] == "primeiro post"
    assert post["autor"]["username"] == "ana"
    assert (post["curtidas"], post["comentarios"], post["eu_curti"]) == (0, 0, False)
    assert post["created_at"].endswith("Z")
    url = f"/posts/{post['id']}"

    usuarios("bia")
    assert client.get(url).status_code == 200
    assert client.patch(url, json={"texto": "outro"}).status_code == 403
    assert client.delete(url).status_code == 403

    usuarios("ana")
    resposta = client.patch(url, json={"texto": "editado"})
    assert resposta.status_code == 200
    assert resposta.json()["texto"] == "editado"
    assert client.delete(url).status_code == 204
    assert client.get(url).status_code == 404


@pytest.mark.parametrize("texto", ["", "   ", "a" * 501])
def test_texto_invalido(client, usuarios, texto):
    usuarios("ana")
    assert client.post("/posts", json={"texto": texto}).status_code == 422
