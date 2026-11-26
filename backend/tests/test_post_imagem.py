"""Foto opcional do post: só o autor sobe, o tipo vem dos bytes, e o feed mostra a URL."""

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 2000
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 100


def _subir(client, post_id, dados, quem, nome="foto.jpg"):
    return client.post(f"/posts/{post_id}/imagem", files={"arquivo": (nome, dados, "image/jpeg")}, headers=quem)


def test_autor_sobe_foto_e_o_feed_mostra(client, logar):
    ana = logar("ana")
    post = client.post("/posts", json={"texto": "barra hoje"}, headers=ana).json()
    assert post["imagem_url"] is None

    r = _subir(client, post["id"], JPEG, ana)
    assert r.status_code == 200
    url = r.json()["imagem_url"]
    assert url.startswith(f"/posts/{post['id']}/imagem/")

    # a tag <img> não manda token: a foto abre sem login, pela chave
    foto = client.get(url)
    assert foto.status_code == 200
    assert foto.headers["content-type"] == "image/jpeg"
    assert foto.content == JPEG

    feed = client.get("/usuarios/ana/posts", headers=ana).json()
    assert feed["items"][0]["imagem_url"] == url


def test_trocar_a_foto_muda_a_url(client, logar):
    ana = logar("ana")
    post = client.post("/posts", json={"texto": "x"}, headers=ana).json()
    antiga = _subir(client, post["id"], JPEG, ana).json()["imagem_url"]
    nova = _subir(client, post["id"], PNG, ana, "foto.png").json()["imagem_url"]
    assert antiga != nova
    assert client.get(antiga).status_code == 404
    assert client.get(nova).headers["content-type"] == "image/png"


def test_so_o_autor_sobe(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post = client.post("/posts", json={"texto": "x"}, headers=ana).json()
    assert _subir(client, post["id"], JPEG, bia).status_code == 403
    assert _subir(client, 9999, JPEG, ana).status_code == 404


def test_recusa_o_que_nao_e_foto_e_o_que_passa_de_2mb(client, logar):
    ana = logar("ana")
    post = client.post("/posts", json={"texto": "x"}, headers=ana).json()
    # o nome diz .jpg, mas os bytes não são de imagem
    assert _subir(client, post["id"], b"<script>alert(1)</script>", ana).status_code == 422
    assert _subir(client, post["id"], JPEG[:4] + b"0" * (2 * 1024 * 1024), ana).status_code == 413


def test_chave_errada_da_404(client, logar):
    ana = logar("ana")
    post = client.post("/posts", json={"texto": "x"}, headers=ana).json()
    _subir(client, post["id"], JPEG, ana)
    assert client.get(f"/posts/{post['id']}/imagem/chute").status_code == 404


def test_apagar_o_post_apaga_a_foto(client, logar):
    ana = logar("ana")
    post = client.post("/posts", json={"texto": "x"}, headers=ana).json()
    url = _subir(client, post["id"], JPEG, ana).json()["imagem_url"]
    assert client.delete(f"/posts/{post['id']}", headers=ana).status_code == 204
    assert client.get(url).status_code == 404


def test_post_de_treino_tambem_aceita_foto(client, logar):
    ana = logar("ana")
    treino = client.post(
        "/treinos", json={"texto": "negativa", "exercicios": [{"progressao": "barra_negativa"}]}, headers=ana
    ).json()
    assert _subir(client, treino["id"], JPEG, ana).status_code == 200
    assert client.get(f"/posts/{treino['id']}", headers=ana).json()["imagem_url"]
