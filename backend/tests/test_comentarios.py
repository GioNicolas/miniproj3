import pytest

from app.deps import get_current_user
from app.main import app
from app.models.user import User


@pytest.fixture
def usuarios(client):
    ids = {}
    for nome in ("ana", "bia", "caio"):
        resposta = client.post("/usuarios", json={"username": nome, "name": nome.title()})
        assert resposta.status_code == 201
        ids[nome] = resposta.json()["id"]

    def autenticar(nome):
        app.dependency_overrides[get_current_user] = lambda: User(id=ids[nome])

    yield autenticar
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def post_da_ana(client, usuarios):
    usuarios("ana")
    return client.post("/posts", json={"texto": "como vocês fazem a negativa?"}).json()["id"]


def test_comentarios_em_ordem_cronologica_e_contados_no_post(client, usuarios, post_da_ana):
    url = f"/posts/{post_da_ana}/comentarios"
    usuarios("bia")
    resposta = client.post(url, json={"texto": "  desce em 5 segundos  "})
    assert resposta.status_code == 201
    comentario = resposta.json()
    assert comentario["texto"] == "desce em 5 segundos"
    assert comentario["autor"]["username"] == "bia"
    assert comentario["created_at"].endswith("Z")
    usuarios("ana")
    client.post(url, json={"texto": "valeu!"})

    pagina = client.get(url).json()
    assert [c["texto"] for c in pagina["items"]] == ["desce em 5 segundos", "valeu!"]
    assert (pagina["total"], pagina["offset"], pagina["limit"]) == (2, 0, 50)
    assert client.get(f"{url}?offset=1&limit=1").json()["items"][0]["texto"] == "valeu!"
    assert client.get(f"/posts/{post_da_ana}").json()["comentarios"] == 2


def test_post_inexistente_da_404(client, usuarios):
    usuarios("ana")
    assert client.post("/posts/999/comentarios", json={"texto": "oi"}).status_code == 404
    assert client.get("/posts/999/comentarios").status_code == 404


@pytest.mark.parametrize("texto", ["", "   ", "a" * 501])
def test_texto_invalido(client, usuarios, post_da_ana, texto):
    resposta = client.post(f"/posts/{post_da_ana}/comentarios", json={"texto": texto})
    assert resposta.status_code == 422


def test_autoral_quem_pode_apagar_comentario(client, usuarios, post_da_ana):
    # o contrato não diz: decidimos que apaga quem escreveu ou o dono do post
    url = f"/posts/{post_da_ana}/comentarios"
    usuarios("bia")
    do_bia = client.post(url, json={"texto": "primeiro!"}).json()["id"]
    outro_da_bia = client.post(url, json={"texto": "segundo"}).json()["id"]

    usuarios("caio")
    assert client.delete(f"{url}/{do_bia}").status_code == 403

    usuarios("bia")
    assert client.delete(f"{url}/{do_bia}").status_code == 204
    usuarios("ana")
    assert client.delete(f"{url}/{outro_da_bia}").status_code == 204
    assert client.delete(f"{url}/{outro_da_bia}").status_code == 404
    assert client.get(url).json()["total"] == 0


def test_comentario_de_outro_post_nao_se_apaga_pela_url_errada(client, usuarios, post_da_ana):
    usuarios("bia")
    outro_post = client.post("/posts", json={"texto": "post da bia"}).json()["id"]
    comentario = client.post(f"/posts/{outro_post}/comentarios", json={"texto": "oi"}).json()["id"]
    assert client.delete(f"/posts/{post_da_ana}/comentarios/{comentario}").status_code == 404


def test_apagar_o_post_apaga_os_comentarios(client, usuarios, post_da_ana):
    usuarios("bia")
    client.post(f"/posts/{post_da_ana}/comentarios", json={"texto": "vai sumir"})
    usuarios("ana")
    assert client.delete(f"/posts/{post_da_ana}").status_code == 204

    from sqlalchemy import func, select

    from app.db import SessionLocal
    from app.models.comentario import Comentario

    with SessionLocal() as db:
        assert db.scalar(select(func.count()).select_from(Comentario)) == 0
