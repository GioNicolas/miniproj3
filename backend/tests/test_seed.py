"""Seed com cara de calistenia (#13): subida da API, demo pronta e frangos variados."""

from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.seed import PESSOAS, SENHA_SEED, USUARIO_DEMO, _hoje, seed_fake


def _subir(monkeypatch):
    from app.main import app

    monkeypatch.setenv("SEED_ON_BOOT", "true")
    return TestClient(app)


def _banco_vazio():
    from app.db import Base, engine

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)


def test_banco_vazio_sobe_com_o_seed_e_o_demo_ja_ve_o_feed(monkeypatch):
    from app.db import Base, engine

    Base.metadata.drop_all(engine)
    with _subir(monkeypatch) as c:
        r = c.post("/auth/login", json={"username": USUARIO_DEMO, "password": SENHA_SEED})
        assert r.status_code == 200
        demo = {"Authorization": f"Bearer {r.json()['token']}"}

        seguindo = c.get(f"/usuarios/{USUARIO_DEMO}/seguindo", headers=demo).json()
        feed = c.get("/feed", headers=demo).json()

    assert seguindo["total"] >= 8
    assert feed["total"] >= 20
    assert any(post["treino"] for post in feed["items"])


def test_seed_nao_duplica_nem_mexe_em_banco_com_gente(monkeypatch):
    from app.db import Base, SessionLocal, engine
    from app.models.user import User

    Base.metadata.drop_all(engine)
    with _subir(monkeypatch):
        pass
    with _subir(monkeypatch):
        pass
    with SessionLocal() as db:
        assert db.query(User).count() == len(PESSOAS)

    _banco_vazio()
    with SessionLocal() as db:
        db.add(User(username="so_eu", name="Só eu", password_hash="x"))
        db.commit()
    with _subir(monkeypatch):
        pass
    with SessionLocal() as db:
        assert [u.username for u in db.query(User)] == ["so_eu"]


def test_seed_e_deterministico():
    from app.db import SessionLocal
    from app.models.treino import Treino
    from app.models.user import User

    def retrato():
        _banco_vazio()
        with SessionLocal() as db:
            seed_fake(db)
            return list(
                db.execute(
                    select(User.username, Treino.dia)
                    .join(Treino, Treino.autor_id == User.id)
                    .order_by(User.username, Treino.dia)
                ).tuples()
            )

    assert retrato() == retrato()


def _frango(dias: set[date], hoje: date, inicio: date) -> tuple[int, int]:
    """A regra inicial da #11: +10 por dia de treino (máx. 100); a partir do 2º
    dia seguido sem treino, −5 por dia (mín. 0). Devolve (força, dias sem treinar).
    Fica aqui só para conferir o seed; a regra de verdade é o core/frango.py da #11.
    """
    forca, sem_treinar = 0, 0
    dia = inicio
    while dia <= hoje:
        if dia in dias:
            forca, sem_treinar = min(100, forca + 10), 0
        else:
            sem_treinar += 1
            if sem_treinar >= 2:
                forca = max(0, forca - 5)
        dia += timedelta(days=1)
    return forca, sem_treinar


def test_seed_tem_monstro_galo_e_frango_definhando():
    from app.db import SessionLocal
    from app.models.treino import Treino
    from app.models.user import User

    _banco_vazio()
    with SessionLocal() as db:
        seed_fake(db)
        hoje = _hoje()
        inicio = db.scalar(select(func.min(Treino.dia)))
        dias: dict[str, set[date]] = {}
        for username, dia in db.execute(
            select(User.username, Treino.dia).join(Treino, Treino.autor_id == User.id)
        ).tuples():
            dias.setdefault(username, set()).add(dia)

    estados = {u: _frango(d, hoje, inicio) for u, d in dias.items()}
    forcas = [forca for forca, _ in estados.values()]
    assert any(forca >= 75 for forca in forcas), "falta um Monstro"
    assert any(50 <= forca < 75 for forca in forcas), "falta um Galo"
    assert any(sem >= 2 for _, sem in estados.values()), "falta um frango definhando"


def test_seed_preenche_a_arvore_sem_pular_pre_requisito():
    from app.core.progressoes import PROGRESSOES, disponiveis, respeita_prerequisitos
    from app.seed import DOMINADAS, EQUIPAMENTOS

    for nivel, dominadas in DOMINADAS.items():
        assert set(dominadas) <= set(PROGRESSOES)
        assert respeita_prerequisitos(dominadas), nivel
        # todo mundo tem pelo menos um próximo passo na árvore
        assert disponiveis(dominadas, EQUIPAMENTOS[nivel]), nivel
        for codigo in dominadas:
            assert set(PROGRESSOES[codigo]["equipamento"]) <= set(EQUIPAMENTOS[nivel]), (nivel, codigo)


def test_demo_abre_o_chat_com_conversas_e_aviso_de_nao_lidas(monkeypatch):
    from app.seed import CONVERSAS

    _banco_vazio()
    with _subir(monkeypatch) as client:
        token = client.post("/auth/login", json={"username": USUARIO_DEMO, "password": SENHA_SEED}).json()["token"]
        eu = {"Authorization": f"Bearer {token}"}
        conversas = client.get("/conversas", headers=eu).json()["items"]
        assert len(conversas) == len(CONVERSAS)
        assert conversas[0]["nome"] == "Treino de sábado em Tambaú"  # a mais recente vem primeiro
        assert client.get("/conversas/nao-lidas", headers=eu).json()["total"] == sum(c[3] for c in CONVERSAS)
        direta = next(c for c in conversas if c["direta"] and c["nao_lidas"] == 1)
        mensagens = client.get(f"/conversas/{direta['id']}/mensagens", headers=eu).json()["items"]
        assert mensagens[-1]["autor"]["username"] == "caio_barra"
