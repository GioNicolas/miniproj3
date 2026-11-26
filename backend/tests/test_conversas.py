import pytest


@pytest.fixture
def gente(logar):
    return {nome: logar(nome, nome.title()) for nome in ("ana", "bia", "caio", "duda")}


def _conversa(client, quem, participantes, nome=None):
    return client.post("/conversas", json={"participantes": participantes, "nome": nome}, headers=quem)


def _enviar(client, quem, conversa_id, texto):
    resposta = client.post(f"/conversas/{conversa_id}/mensagens", json={"texto": texto}, headers=quem)
    assert resposta.status_code == 201, resposta.text
    return resposta.json()


def test_conversa_direta_nao_duplica(client, gente):
    criada = _conversa(client, gente["ana"], ["bia"])
    assert criada.status_code == 201
    conversa = criada.json()
    assert conversa["direta"] is True
    assert [p["username"] for p in conversa["participantes"]] == ["ana", "bia"]
    assert (conversa["ultima_mensagem"], conversa["nao_lidas"]) == (None, 0)

    # De novo, ou pelo outro lado, ou com nome repetido na lista: a mesma conversa.
    for quem, lista in (("ana", ["bia"]), ("bia", ["ana"]), ("ana", ["bia", "bia"])):
        de_novo = _conversa(client, gente[quem], lista)
        assert de_novo.status_code == 200
        assert de_novo.json()["id"] == conversa["id"]
    assert client.get("/conversas", headers=gente["ana"]).json()["total"] == 1


def test_grupo_tem_nome_e_nao_e_reaproveitado(client, gente):
    grupo = _conversa(client, gente["ana"], ["bia", "caio"], "  Barra do CCEN às 17h  ")
    assert grupo.status_code == 201
    assert grupo.json()["nome"] == "Barra do CCEN às 17h"
    assert grupo.json()["direta"] is False
    assert len(grupo.json()["participantes"]) == 3

    outro = _conversa(client, gente["ana"], ["bia", "caio"])
    assert outro.status_code == 201
    assert outro.json()["id"] != grupo.json()["id"]
    assert outro.json()["nome"] is None


def test_validacao_dos_participantes(client, gente, logar):
    ana = gente["ana"]
    assert _conversa(client, ana, []).status_code == 422
    assert _conversa(client, ana, ["ana"]).status_code == 422
    assert _conversa(client, ana, ["bia", "ana"]).status_code == 422
    assert _conversa(client, ana, ["fantasma"]).status_code == 404
    muitos = [f"pessoa{i}" for i in range(10)]
    for nome in muitos:
        logar(nome)
    assert _conversa(client, ana, muitos).status_code == 422
    assert _conversa(client, ana, muitos[:9]).status_code == 201  # 10 pessoas no total
    assert client.post("/conversas", json={"participantes": ["bia"]}).status_code == 401


def test_mensagens_mais_antiga_primeiro_e_paginadas(client, gente):
    conversa_id = _conversa(client, gente["ana"], ["bia"]).json()["id"]
    primeira = _enviar(client, gente["ana"], conversa_id, "  bora na barra do CCEN às 17h?  ")
    assert primeira["texto"] == "bora na barra do CCEN às 17h?"
    assert primeira["autor"]["username"] == "ana"
    assert primeira["created_at"].endswith("Z")
    _enviar(client, gente["bia"], conversa_id, "bora!")
    _enviar(client, gente["ana"], conversa_id, "leva o elástico")

    url = f"/conversas/{conversa_id}/mensagens"
    pagina = client.get(url, headers=gente["bia"]).json()
    assert [m["texto"] for m in pagina["items"]] == ["bora na barra do CCEN às 17h?", "bora!", "leva o elástico"]
    assert (pagina["total"], pagina["offset"], pagina["limit"]) == (3, 0, 50)
    # O polling do front pede só o que veio depois do que ele já tem.
    novas = client.get(f"{url}?offset=2&limit=50", headers=gente["bia"]).json()
    assert [m["texto"] for m in novas["items"]] == ["leva o elástico"]

    for texto in ("", "   ", "x" * 501):
        assert client.post(url, json={"texto": texto}, headers=gente["ana"]).status_code == 422


def test_quem_nao_participa_recebe_404(client, gente):
    conversa_id = _conversa(client, gente["ana"], ["bia"]).json()["id"]
    _enviar(client, gente["ana"], conversa_id, "segredo do treino")
    caio = gente["caio"]
    assert client.get(f"/conversas/{conversa_id}", headers=caio).status_code == 404
    assert client.get(f"/conversas/{conversa_id}/mensagens", headers=caio).status_code == 404
    resposta = client.post(f"/conversas/{conversa_id}/mensagens", json={"texto": "oi"}, headers=caio)
    assert resposta.status_code == 404
    # Mesma resposta de uma conversa que não existe: não revela que ela existe.
    assert client.get("/conversas/999", headers=caio).json() == resposta.json()
    assert client.get("/conversas", headers=caio).json()["total"] == 0


def test_lista_pela_ultima_mensagem_e_conta_nao_lidas(client, gente):
    ana, bia = gente["ana"], gente["bia"]
    com_bia = _conversa(client, ana, ["bia"]).json()["id"]
    grupo = _conversa(client, ana, ["bia", "caio"], "Treino de sábado").json()["id"]
    _enviar(client, bia, com_bia, "oi ana")
    _enviar(client, bia, com_bia, "vai treinar hoje?")
    _enviar(client, gente["caio"], grupo, "sábado 8h")

    lista = client.get("/conversas", headers=ana).json()
    assert [c["id"] for c in lista["items"]] == [grupo, com_bia]  # a mais recente em cima
    assert [c["nao_lidas"] for c in lista["items"]] == [1, 2]
    assert lista["items"][1]["ultima_mensagem"]["texto"] == "vai treinar hoje?"
    assert client.get("/conversas/nao-lidas", headers=ana).json() == {"total": 3}

    # Abrir a conversa marca como lida; o que eu mesmo mando nunca conta.
    client.get(f"/conversas/{com_bia}/mensagens", headers=ana)
    _enviar(client, ana, grupo, "fechado")
    assert client.get("/conversas/nao-lidas", headers=ana).json() == {"total": 0}
    assert client.get("/conversas/nao-lidas", headers=bia).json() == {"total": 2}
    assert client.get(f"/conversas/{grupo}", headers=bia).json()["nao_lidas"] == 2
