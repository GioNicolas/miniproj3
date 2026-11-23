import pytest


@pytest.mark.parametrize("senha", ["a" * 73, "é" * 37])
def test_registro_rejeita_senha_acima_do_limite_em_bytes(client, senha):
    resposta = client.post(
        "/auth/registro", json={"username": "ana", "name": "Ana", "password": senha}
    )
    assert resposta.status_code == 422


@pytest.mark.parametrize("senha", ["a" * 72, "é" * 36])
def test_login_rejeita_senha_que_ultrapassa_limite(client, senha):
    resposta = client.post(
        "/auth/registro", json={"username": "ana", "name": "Ana", "password": senha}
    )
    assert resposta.status_code == 201
    assert client.post("/auth/login", json={"username": "ana", "password": senha}).status_code == 200
    assert client.post("/auth/login", json={"username": "ana", "password": senha + "x"}).status_code == 422
