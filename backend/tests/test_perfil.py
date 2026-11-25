def test_perfil_de_outra_pessoa_traz_contadores_e_eu_sigo(client, logar):
    ana, bia = logar("ana", "Ana"), logar("bia", "Bia")
    client.post("/usuarios/bia/follow", headers=ana)

    visto_pela_ana = client.get("/usuarios/bia", headers=ana).json()
    assert (visto_pela_ana["seguidores"], visto_pela_ana["seguindo"], visto_pela_ana["eu_sigo"]) == (1, 0, True)
    assert visto_pela_ana["frango"]["nivel"] == "Frango"  # quem nunca treinou começa no zero
    assert client.get("/usuarios/ana", headers=bia).json()["eu_sigo"] is False
    assert client.get("/usuarios/fantasma", headers=ana).status_code == 404
    assert client.get("/usuarios/bia").status_code == 401


def test_editar_perfil_muda_so_o_que_veio(client, logar):
    ana = logar("ana", "Ana Souza")
    r = client.patch("/usuarios/eu", json={"bio": "começando na barra"}, headers=ana)
    assert r.status_code == 200
    assert (r.json()["name"], r.json()["bio"]) == ("Ana Souza", "começando na barra")

    r = client.patch("/usuarios/eu", json={"name": "Ana S."}, headers=ana)
    assert (r.json()["name"], r.json()["bio"]) == ("Ana S.", "começando na barra")

    assert client.patch("/usuarios/eu", json={"name": ""}, headers=ana).status_code == 422
    assert client.patch("/usuarios/eu", json={"bio": "x" * 281}, headers=ana).status_code == 422


def test_posts_do_perfil_so_da_pessoa_e_mais_novo_primeiro(client, logar):
    ana, bia = logar("ana"), logar("bia")
    for texto in ("primeiro", "segundo"):
        client.post("/posts", json={"texto": texto}, headers=ana)
    client.post("/posts", json={"texto": "da bia"}, headers=bia)
    client.post(
        "/treinos",
        json={"texto": "treino", "exercicios": [{"progressao": "flexao", "series": 3, "reps": 10}]},
        headers=ana,
    )

    pagina = client.get("/usuarios/ana/posts", headers=bia).json()
    assert [p["texto"] for p in pagina["items"]] == ["treino", "segundo", "primeiro"]
    assert pagina["items"][0]["treino"]["exercicios"][0]["progressao"] == "flexao"
    assert (pagina["total"], pagina["offset"], pagina["limit"]) == (3, 0, 20)
    assert client.get("/usuarios/ana/posts?offset=2&limit=1", headers=bia).json()["items"][0]["texto"] == "primeiro"
    assert client.get("/usuarios/fantasma/posts", headers=bia).status_code == 404
