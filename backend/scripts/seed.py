"""Roda o seed na mão: make seed.

O seed de verdade fica em app/seed.py (seed_fake). Com SEED_ON_BOOT=true, a API
roda o mesmo seed ao subir com o banco vazio. Rodou com a API no ar? Reinicie a
API para ela recarregar follows e granja da memória.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import Base, SessionLocal, engine
from app.seed import SENHA_SEED, USUARIO_DEMO, seed_fake, semear_se_vazio

__all__ = ["seed_fake"]  # o test_nucleo importa seed_fake daqui


def main() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        criados = semear_se_vazio(db)
    if criados:
        print(f"seed ok: {criados} usuários criados. Entre como {USUARIO_DEMO} / {SENHA_SEED}")
    else:
        print("banco já tem dados — nada a fazer (apague backend/app.db para recriar)")


if __name__ == "__main__":
    main()
