"""Foto de perfil escolhida dos arquivos: sobe, aparece em todo lugar, troca e sai."""

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 2000
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 100


def _subir(client, dados, quem, nome="foto.jpg"):
    return client.post("/usuarios/eu/foto", files={"arquivo": (nome, dados, "image/jpeg")}, headers=quem)


def test_sobe_a_foto_e_ela_aparece_no_perfil_e_nos_posts(client, logar):
    ana = logar("ana")
    client.post("/posts", json={"texto": "barra hoje"}, headers=ana)

    r = _subir(client, JPEG, ana)
    assert r.status_code == 200
    url = r.json()["avatar_url"]
    assert url.startswith("/usuarios/ana/foto/")

    # a tag <img> não manda token: a foto abre sem login, pela chave
    foto = client.get(url)
    assert foto.status_code == 200
    assert foto.headers["content-type"] == "image/jpeg"
    assert foto.content == JPEG

    assert client.get("/usuarios/ana", headers=ana).json()["avatar_url"] == url
    assert client.get("/usuarios/ana/posts", headers=ana).json()["items"][0]["autor"]["avatar_url"] == url


def test_trocar_a_foto_muda_a_url_e_a_antiga_some(client, logar):
    ana = logar("ana")
    antiga = _subir(client, JPEG, ana).json()["avatar_url"]
    nova = _subir(client, PNG, ana, "foto.png").json()["avatar_url"]

    assert antiga != nova
    assert client.get(antiga).status_code == 404
    assert client.get(nova).headers["content-type"] == "image/png"


def test_remover_volta_para_as_iniciais(client, logar):
    ana = logar("ana")
    url = _subir(client, JPEG, ana).json()["avatar_url"]

    r = client.delete("/usuarios/eu/foto", headers=ana)

    assert r.status_code == 200
    assert r.json()["avatar_url"] == ""
    assert client.get(url).status_code == 404
    # remover sem ter foto não é erro
    assert client.delete("/usuarios/eu/foto", headers=ana).status_code == 200


def test_trocar_por_link_apaga_a_foto_guardada(client, logar):
    ana = logar("ana")
    url = _subir(client, JPEG, ana).json()["avatar_url"]

    r = client.patch("/usuarios/eu", json={"avatar_url": "https://exemplo.com/eu.png"}, headers=ana)

    assert r.json()["avatar_url"] == "https://exemplo.com/eu.png"
    assert client.get(url).status_code == 404


def test_editar_so_a_bio_nao_mexe_na_foto(client, logar):
    ana = logar("ana")
    url = _subir(client, JPEG, ana).json()["avatar_url"]

    client.patch("/usuarios/eu", json={"bio": "nova bio"}, headers=ana)

    assert client.get(url).status_code == 200


def test_foto_invalida_ou_grande_demais(client, logar):
    ana = logar("ana")

    assert _subir(client, b"isso nao e imagem", ana, "foto.jpg").status_code == 422
    assert _subir(client, b"\xff\xd8\xff" + b"0" * (2 * 1024 * 1024), ana).status_code == 413
    assert client.get("/usuarios/ana", headers=ana).json()["avatar_url"] == ""


def test_trocar_foto_pede_login_e_chave_errada_da_404(client, logar):
    ana = logar("ana")
    url = _subir(client, JPEG, ana).json()["avatar_url"]

    assert _subir(client, JPEG, {}).status_code == 401
    assert client.get(url[:-3] + "xyz").status_code == 404
    assert client.get("/usuarios/ninguem/foto/abc").status_code == 404
