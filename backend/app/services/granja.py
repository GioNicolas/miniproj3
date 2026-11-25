"""Granja da Semana: ranking de constância entre eu e quem eu sigo.

A contagem de dias fica em memória no core/granja.py, reconstruída do banco no
startup (main.py). Para ela andar sem restart, o check-in e o apagar post
chamam granja.registrar_treino / granja.remover_treino nos services de treinos
e posts (ganchos combinados com o dono desses services no #37).
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.datas import dia_em_recife
from app.core.granja import Colocado, granja, segunda_da_semana
from app.core.grafo_follows import grafo_follows
from app.models.treino import Treino
from app.models.user import User
from app.schemas.granja import AlvoOut, ColocadoOut, GranjaOut, UsuarioNaGranja
from app.services import frango


def reconstruir(db: Session) -> None:
    """Startup: cada linha de treinos é um check-in (autor, dia em Recife)."""
    granja.reconstruir(list(db.execute(select(Treino.autor_id, Treino.dia)).tuples()))


def _na_frente(a: Colocado, b: Colocado) -> bool:
    """a fica acima de b: mais dias; no empate, username antes no alfabeto."""
    if a.dias_treinados != b.dias_treinados:
        return a.dias_treinados > b.dias_treinados
    return a.username < b.username


def ranking(db: Session, eu: User, k: int) -> GranjaOut:
    hoje = dia_em_recife(datetime.now(timezone.utc))
    segunda = segunda_da_semana(hoje)

    ids = grafo_follows.seguindo(eu.id) | {eu.id}
    usuarios = {u.id: u for u in db.scalars(select(User).where(User.id.in_(ids)))}
    participantes = {uid: u.username for uid, u in usuarios.items()}
    # patente de cada um com uma query só (mesma conta dos posts)
    niveis = frango.niveis(db, set(usuarios))

    def usuario_out(uid: int) -> UsuarioNaGranja:
        return UsuarioNaGranja.model_validate(usuarios[uid]).model_copy(update={"nivel": niveis.get(uid)})

    def colocado_out(posicao: int, c: Colocado) -> ColocadoOut:
        return ColocadoOut(
            posicao=posicao, usuario=usuario_out(c.usuario_id), dias_treinados=c.dias_treinados
        )

    # Top-K pelo heap do core: O(n log k).
    items = [colocado_out(i, c) for i, c in enumerate(granja.ranking(participantes, segunda, k), 1)]

    # A minha posição e quem está logo acima de mim, numa passada só: O(n).
    meu = Colocado(eu.id, eu.username, granja.dias_treinados(eu.id, segunda))
    na_minha_frente = [
        c
        for uid, username in participantes.items()
        if uid != eu.id
        and _na_frente(c := Colocado(uid, username, granja.dias_treinados(uid, segunda)), meu)
    ]
    alvo = None
    if na_minha_frente:
        # o mais fraco de quem está na minha frente é o que está logo acima
        logo_acima = na_minha_frente[0]
        for c in na_minha_frente[1:]:
            if _na_frente(logo_acima, c):
                logo_acima = c
        # empatar só basta se eu venho antes no alfabeto
        faltam = logo_acima.dias_treinados - meu.dias_treinados
        if logo_acima.username < meu.username:
            faltam += 1
        alvo = AlvoOut(
            usuario=usuario_out(logo_acima.usuario_id),
            dias_treinados=logo_acima.dias_treinados,
            faltam_dias=faltam,
        )

    treinei_hoje = hoje in granja.dias_da_semana(eu.id, segunda)
    dias_ate_domingo = 7 - hoje.weekday()  # contando hoje
    return GranjaOut(
        semana_inicio=segunda,
        items=items,
        eu=colocado_out(len(na_minha_frente) + 1, meu),
        alvo=alvo,
        dias_que_ainda_contam=dias_ate_domingo - (1 if treinei_hoje else 0),
    )
