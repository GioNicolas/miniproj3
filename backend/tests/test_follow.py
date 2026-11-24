"""Testes do follow que não dependem da auth do time.

Enquanto o login não existe, o fixture `como` troca o get_current_user por um
que lê o header `X-Teste-Usuario`. Quando a auth sair, dá para migrar estes
testes para o fixture `logar` do conftest.
"""

import pytest
from fastapi import Header
from sqlalchemy import select

from app.db import SessionLocal
from app.deps import get_current_user
from app.main import app
from app.models.user import User


@pytest.fixture()
def como(client):
    def _usuario_do_header(x_teste_usuario: str = Header()):
        with SessionLocal() as db:
            return db.scalar(select(User).where(User.username == x_teste_usuario))

    app.dependency_overrides[get_current_user] = _usuario_do_header

    def _como(username: str) -> dict:
        client.post("/usuarios", json={"username": username, "name": username})
        return {"X-Teste-Usuario": username}

    yield _como
    app.dependency_overrides.clear()


def test_seguir_e_idempotente_e_aparece_nas_listas(client, como):
    ana = como("ana")
    como("bia")

    assert client.post("/usuarios/bia/follow", headers=ana).status_code == 204
    assert client.post("/usuarios/bia/follow", headers=ana).status_code == 204

    r = client.get("/usuarios/bia/seguidores", headers=ana)
    assert r.status_code == 200
    assert r.json()["total"] == 1
    assert [u["username"] for u in r.json()["items"]] == ["ana"]

    r = client.get("/usuarios/ana/seguindo", headers=ana)
    assert [u["username"] for u in r.json()["items"]] == ["bia"]


def test_deixar_de_seguir_esvazia_as_listas(client, como):
    ana = como("ana")
    como("bia")
    client.post("/usuarios/bia/follow", headers=ana)

    assert client.delete("/usuarios/bia/follow", headers=ana).status_code == 204
    assert client.get("/usuarios/bia/seguidores", headers=ana).json()["total"] == 0

    # deixar de seguir quem já não sigo não é erro
    assert client.delete("/usuarios/bia/follow", headers=ana).status_code == 204


def test_autoral_nao_da_para_seguir_a_si_mesmo(client, como):
    ana = como("ana")

    assert client.post("/usuarios/ana/follow", headers=ana).status_code == 422
    assert client.get("/usuarios/ana/seguidores", headers=ana).json()["total"] == 0


def test_seguir_usuario_inexistente_da_404(client, como):
    ana = como("ana")

    assert client.post("/usuarios/fantasma/follow", headers=ana).status_code == 404


def test_contadores_para_o_perfil(client, como):
    from app.services.follows import contadores

    ana = como("ana")
    bia = como("bia")
    como("caio")
    client.post("/usuarios/bia/follow", headers=ana)
    client.post("/usuarios/caio/follow", headers=ana)
    client.post("/usuarios/ana/follow", headers=bia)

    with SessionLocal() as db:
        ids = {username: id_ for username, id_ in db.execute(select(User.username, User.id))}

    assert contadores(ids["ana"], visitante_id=ids["bia"]) == {
        "seguidores": 1,
        "seguindo": 2,
        "eu_sigo": True,
    }
    assert contadores(ids["ana"], visitante_id=ids["caio"])["eu_sigo"] is False
