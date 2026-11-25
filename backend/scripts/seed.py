"""Roda o seed na mão: make seed.

A API já roda o mesmo seed sozinha quando sobe com o banco vazio (app/seed.py).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import Base, SessionLocal, engine
from app.seed import semear_se_vazio


def main() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        criados = semear_se_vazio(db)
    if criados:
        print(f"seed ok: {criados} usuários criados")
    else:
        print("banco já tem dados — nada a fazer")


if __name__ == "__main__":
    main()
