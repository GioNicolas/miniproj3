"""Seed na subida da API: só roda com o banco vazio e não duplica."""

from fastapi.testclient import TestClient

from app.seed import SENHA_SEED, USUARIOS


def _subir(monkeypatch):
    from app.main import app

    monkeypatch.setenv("SEED_NO_STARTUP", "1")
    return TestClient(app)


def test_banco_vazio_sobe_com_o_seed(monkeypatch):
    from app.db import Base, engine

    Base.metadata.drop_all(engine)
    with _subir(monkeypatch) as c:
        username = USUARIOS[0][0]
        r = c.post("/auth/login", json={"username": username, "password": SENHA_SEED})
        assert r.status_code == 200


def test_seed_nao_duplica_nem_mexe_em_banco_com_gente(monkeypatch):
    from app.db import Base, SessionLocal, engine
    from app.models.user import User

    Base.metadata.drop_all(engine)
    with _subir(monkeypatch):
        pass
    with _subir(monkeypatch):
        pass
    with SessionLocal() as db:
        assert db.query(User).count() == len(USUARIOS)

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        db.add(User(username="so_eu", name="Só eu", password_hash="x"))
        db.commit()
    with _subir(monkeypatch):
        pass
    with SessionLocal() as db:
        assert [u.username for u in db.query(User)] == ["so_eu"]
