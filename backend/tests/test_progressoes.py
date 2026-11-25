from app.core.progressoes import PROGRESSOES, disponiveis, ordem_topologica


def test_grafo_e_ordem_topologica():
    ordem = ordem_topologica()
    assert set(ordem) == set(PROGRESSOES)
    posicao = {codigo: i for i, codigo in enumerate(ordem)}
    for codigo, dados in PROGRESSOES.items():
        assert all(posicao[p] < posicao[codigo] for p in dados["prerequisitos"])


def test_disponiveis_respeita_equipamento():
    assert "pendurar_na_barra" not in disponiveis(set(), set())
    assert "pendurar_na_barra" in disponiveis(set(), {"barra_fixa"})
    assert "pendurar_na_barra" not in disponiveis({"pendurar_na_barra"}, {"barra_fixa"})


def test_dominar_pre_requisito_e_desfazer(client, logar):
    headers = logar("arvore")
    assert client.post("/progressoes/barra_australiana/dominar", headers=headers).status_code == 409
    assert client.post("/progressoes/pendurar_na_barra/dominar", headers=headers).status_code == 409
    assert client.patch("/usuarios/eu", json={"equipamentos": ["barra_fixa"]}, headers=headers).status_code == 200
    assert client.post("/progressoes/pendurar_na_barra/dominar", headers=headers).status_code == 204
    assert client.post("/progressoes/barra_australiana/dominar", headers=headers).status_code == 204
    assert client.delete("/progressoes/pendurar_na_barra/dominar", headers=headers).status_code == 409
    perfil = client.get("/usuarios/arvore/progressoes", headers=headers).json()
    assert {p["codigo"] for p in perfil} == {"pendurar_na_barra", "barra_australiana"}
    assert client.delete("/progressoes/barra_australiana/dominar", headers=headers).status_code == 204
    arvore = client.get("/progressoes", headers=headers).json()
    assert next(p for p in arvore["progressoes"] if p["codigo"] == "barra_australiana")["estado"] == "disponivel"
    outro = logar("outra")
    assert client.get("/usuarios/outra/progressoes", headers=outro).json() == []
