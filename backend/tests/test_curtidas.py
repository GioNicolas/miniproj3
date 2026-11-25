"""Casos de curtidas que o teste do núcleo não cobre (guia 09)."""


def test_eu_curti_e_de_quem_esta_vendo(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "treino feito"}, headers=bia).json()["id"]

    client.post(f"/posts/{post_id}/curtir", headers=ana)

    assert client.get(f"/posts/{post_id}", headers=ana).json()["eu_curti"] is True
    assert client.get(f"/posts/{post_id}", headers=bia).json()["eu_curti"] is False


def test_curtir_post_que_nao_existe_da_404(client, logar):
    ana = logar("ana")

    assert client.post("/posts/999/curtir", headers=ana).status_code == 404
    assert client.delete("/posts/999/curtir", headers=ana).status_code == 404


def test_descurtir_sem_ter_curtido_nao_e_erro(client, logar):
    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "oi"}, headers=ana).json()["id"]

    assert client.delete(f"/posts/{post_id}/curtir", headers=ana).status_code == 204
    assert client.get(f"/posts/{post_id}", headers=ana).json()["curtidas"] == 0


def test_autoral_post_novo_nao_herda_curtidas_de_post_apagado(client, logar):
    # O SQLite reaproveita o maior id apagado: sem limpar as curtidas, o post
    # novo nasceria com as curtidas do antigo.
    ana = logar("ana")
    bia = logar("bia")
    antigo = client.post("/posts", json={"texto": "antigo"}, headers=ana).json()["id"]
    client.post(f"/posts/{antigo}/curtir", headers=bia)
    client.delete(f"/posts/{antigo}", headers=ana)

    novo = client.post("/posts", json={"texto": "novo"}, headers=ana).json()

    assert novo["curtidas"] == 0


def test_clique_duplo_nao_vira_500(client, logar):
    """Duas requisições quase juntas: as duas passam pelo get antes de qualquer
    commit. A segunda bate na chave primária e precisa continuar idempotente."""
    from app.db import SessionLocal
    from app.models.curtida import Curtida
    from app.models.user import User
    from app.services import curtidas as service

    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "treino feito"}, headers=ana).json()["id"]

    with SessionLocal() as primeira, SessionLocal() as segunda:
        eu = segunda.query(User).filter_by(username="ana").one()
        primeira.add(Curtida(usuario_id=eu.id, post_id=post_id))
        primeira.flush()  # a primeira requisição já gravou, mas ainda não commitou
        original = segunda.get
        segunda.get = lambda modelo, chave, **kw: None if modelo is Curtida else original(modelo, chave, **kw)
        primeira.commit()

        service.curtir(segunda, post_id, eu)  # não levanta IntegrityError

    assert client.get(f"/posts/{post_id}", headers=ana).json()["curtidas"] == 1
