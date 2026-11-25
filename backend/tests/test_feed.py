"""Feed dos seguidos (#5): o caminho feliz está em test_nucleo.py; aqui ficam as bordas."""


def _textos(resposta) -> list[str]:
    return [p["texto"] for p in resposta.json()["items"]]


def test_autoral_meus_posts_entram_no_meu_feed(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    client.post("/usuarios/bia/follow", headers=ana)

    client.post("/posts", json={"texto": "da bia"}, headers=bia)
    client.post("/posts", json={"texto": "da ana"}, headers=ana)

    assert _textos(client.get("/feed", headers=ana)) == ["da ana", "da bia"]


def test_quem_nao_segue_ninguem_ve_so_os_proprios_posts(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    client.post("/posts", json={"texto": "da bia"}, headers=bia)
    client.post("/posts", json={"texto": "da ana"}, headers=ana)

    r = client.get("/feed", headers=ana)
    assert r.json()["total"] == 1
    assert _textos(r) == ["da ana"]


def test_deixar_de_seguir_tira_os_posts_do_feed(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    client.post("/posts", json={"texto": "da bia"}, headers=bia)
    client.post("/usuarios/bia/follow", headers=ana)
    assert client.get("/feed", headers=ana).json()["total"] == 1

    client.delete("/usuarios/bia/follow", headers=ana)
    assert client.get("/feed", headers=ana).json()["total"] == 0


def test_feed_traz_treino_e_contagem_de_comentarios(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    client.post("/usuarios/bia/follow", headers=ana)
    treino = client.post(
        "/treinos",
        json={"texto": "treino", "exercicios": [{"progressao": "prancha", "series": 2, "reps": None}]},
        headers=bia,
    ).json()
    client.post(f"/posts/{treino['id']}/comentarios", json={"texto": "boa"}, headers=ana)

    [post] = client.get("/feed", headers=ana).json()["items"]
    assert post["treino"]["exercicios"][0]["progressao"] == "prancha"
    assert post["comentarios"] == 1


def test_feed_exige_login(client):
    assert client.get("/feed").status_code == 401
