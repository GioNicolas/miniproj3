import pytest

from app.core.progressoes import (
    NIVEIS,
    PROGRESSOES,
    calcular_niveis,
    disponiveis,
    ordem_topologica,
    respeita_prerequisitos,
)


def test_catalogo_e_um_dag_e_a_ordem_poe_pre_requisito_antes():
    ordem = ordem_topologica()
    assert set(ordem) == set(PROGRESSOES)
    posicao = {codigo: i for i, codigo in enumerate(ordem)}
    for codigo, dados in PROGRESSOES.items():
        assert all(posicao[p] < posicao[codigo] for p in dados["prerequisitos"])


def test_ciclo_e_codigo_desconhecido_sao_recusados():
    ciclo = {
        "a": {"prerequisitos": ["b"]},
        "b": {"prerequisitos": ["a"]},
    }
    with pytest.raises(ValueError, match="ciclo"):
        ordem_topologica(ciclo)
    with pytest.raises(ValueError, match="desconhecido"):
        ordem_topologica({"a": {"prerequisitos": ["fantasma"]}})


def test_niveis_seguem_o_pre_requisito_mais_fundo():
    assert NIVEIS["pendurar_na_barra"] == NIVEIS["prancha"] == 1
    assert NIVEIS["barra_fixa"] == 4
    # muscle-up pede barra fixa (nível 4) e paralela (nível 4): fica no 5
    assert NIVEIS["muscle_up"] == 5
    assert calcular_niveis({"x": {"prerequisitos": []}, "y": {"prerequisitos": ["x"]}}) == {"x": 1, "y": 2}


def test_disponiveis_pede_pre_requisitos_e_equipamento():
    assert "pendurar_na_barra" not in disponiveis(set(), set())
    assert "pendurar_na_barra" in disponiveis(set(), {"barra_fixa"})
    assert "pendurar_na_barra" not in disponiveis({"pendurar_na_barra"}, {"barra_fixa"})
    # sem equipamento nenhum, quem começa ainda tem flexão, agachamento e prancha
    assert {"flexao_inclinada", "agachamento", "prancha"} <= set(disponiveis(set(), set()))
    assert respeita_prerequisitos({"prancha", "canoa"})
    assert not respeita_prerequisitos({"canoa"})


def test_dominar_respeita_a_arvore_e_desfazer_tambem(client, logar):
    eu = logar("ana")
    r = client.post("/progressoes/barra_australiana/dominar", headers=eu)
    assert r.status_code == 409 and "Pendurar na barra" in r.json()["detail"]
    r = client.post("/progressoes/pendurar_na_barra/dominar", headers=eu)
    assert r.status_code == 409 and "barra_fixa" in r.json()["detail"]

    # equipamento entra pelo PATCH /usuarios/eu, como diz o contrato da #10
    r = client.patch("/usuarios/eu", json={"equipamentos": ["barra_fixa"], "bio": "começando"}, headers=eu)
    assert r.status_code == 200 and r.json()["bio"] == "começando"
    assert client.patch("/usuarios/eu", json={"equipamentos": ["halter"]}, headers=eu).status_code == 422

    assert client.post("/progressoes/pendurar_na_barra/dominar", headers=eu).status_code == 204
    assert client.post("/progressoes/pendurar_na_barra/dominar", headers=eu).status_code == 204  # idempotente
    assert client.post("/progressoes/barra_australiana/dominar", headers=eu).status_code == 204
    r = client.delete("/progressoes/pendurar_na_barra/dominar", headers=eu)
    assert r.status_code == 409 and "Barra australiana" in r.json()["detail"]
    assert client.post("/progressoes/nao_existe/dominar", headers=eu).status_code == 404

    arvore = client.get("/progressoes", headers=eu).json()
    assert arvore["equipamentos"] == ["barra_fixa"]
    estado = {p["codigo"]: p["estado"] for p in arvore["progressoes"]}
    assert (estado["barra_australiana"], estado["barra_negativa"], estado["barra_fixa"]) == (
        "dominada", "disponivel", "bloqueada",
    )
    assert estado["paralela"] == "bloqueada"  # sem paralelas e sem flexão

    bia = logar("bia")
    perfil = client.get("/usuarios/ana/progressoes", headers=bia).json()
    assert [p["codigo"] for p in perfil] == ["pendurar_na_barra", "barra_australiana"]
    assert perfil[0]["nome"] == "Pendurar na barra"
    assert client.get("/usuarios/fantasma/progressoes", headers=bia).status_code == 404

    assert client.delete("/progressoes/barra_australiana/dominar", headers=eu).status_code == 204
    arvore = client.get("/progressoes", headers=eu).json()
    assert next(p for p in arvore["progressoes"] if p["codigo"] == "barra_australiana")["estado"] == "disponivel"


def test_treino_so_aceita_progressao_do_catalogo(client, logar):
    eu = logar("ana")
    treino = {"texto": "treino", "exercicios": [{"progressao": "supino", "series": 3, "reps": 10}]}
    assert client.post("/treinos", json=treino, headers=eu).status_code == 422
    treino["exercicios"][0]["progressao"] = "barra_negativa"
    assert client.post("/treinos", json=treino, headers=eu).status_code == 201
