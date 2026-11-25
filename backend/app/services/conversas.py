from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.conversa import Conversa, Participante
from app.models.mensagem import Mensagem
from app.models.user import User
from app.schemas.conversa import ConversaCreate, ConversaOut, MensagemCreate, MensagemOut
from app.schemas.post import AutorOut

NAO_ENCONTRADA = "conversa não encontrada"


def _participacao(db: Session, conversa_id: int, eu: User) -> Participante:
    """Quem não participa recebe 404, igual a uma conversa que não existe."""
    participacao = db.get(Participante, (conversa_id, eu.id))
    if participacao is None:
        raise HTTPException(status_code=404, detail=NAO_ENCONTRADA)
    return participacao


def _direta(db: Session, chave: str) -> Conversa | None:
    return db.scalar(select(Conversa).where(Conversa.chave_direta == chave))


def criar(db: Session, eu: User, dados: ConversaCreate) -> tuple[Conversa, bool]:
    """Devolve (conversa, criada). Conversa direta que já existe volta com criada=False."""
    nomes = list(dict.fromkeys(dados.participantes))  # tira repetidos, mantém a ordem
    outros = list(db.scalars(select(User).where(User.username.in_(nomes))))
    faltando = set(nomes) - {u.username for u in outros}
    if faltando:
        raise HTTPException(status_code=404, detail=f"usuário {sorted(faltando)[0]} não encontrado")
    if any(u.id == eu.id for u in outros):
        raise HTTPException(status_code=422, detail="você já entra na conversa; não se coloque na lista")

    if len(outros) == 1:
        menor, maior = sorted((eu.id, outros[0].id))
        chave, nome = f"{menor}:{maior}", None
        existente = _direta(db, chave)
        if existente is not None:
            return existente, False
    else:
        chave, nome = None, dados.nome or None

    conversa = Conversa(nome=nome, chave_direta=chave)
    db.add(conversa)
    try:
        db.flush()
        db.add_all(Participante(conversa_id=conversa.id, user_id=u.id) for u in [eu, *outros])
        db.commit()
    except IntegrityError:
        # Dois pedidos da mesma conversa direta ao mesmo tempo: o segundo bate no
        # unique da chave e devolve a que o primeiro criou.
        db.rollback()
        existente = _direta(db, chave) if chave else None
        if existente is None:
            raise
        return existente, False
    db.refresh(conversa)
    return conversa, True


def montar(db: Session, conversas: list[Conversa], eu: User) -> list[ConversaOut]:
    """Última mensagem e não lidas de uma página inteira em 2 consultas, não 2 por conversa."""
    ids = [c.id for c in conversas]
    ultimas_ids = (
        select(func.max(Mensagem.id)).where(Mensagem.conversa_id.in_(ids)).group_by(Mensagem.conversa_id)
    )
    ultimas = {m.conversa_id: m for m in db.scalars(select(Mensagem).where(Mensagem.id.in_(ultimas_ids)))}
    minha_participacao = and_(
        Participante.conversa_id == Mensagem.conversa_id, Participante.user_id == eu.id
    )
    nao_lidas = dict(
        db.execute(
            select(Mensagem.conversa_id, func.count())
            .join(Participante, minha_participacao)
            .where(
                Mensagem.conversa_id.in_(ids),
                Mensagem.id > Participante.lida_ate_id,
                Mensagem.autor_id != eu.id,
            )
            .group_by(Mensagem.conversa_id)
        ).all()  # .all(): dict() de um Result tentaria usar o .keys() dele
    )
    return [
        ConversaOut(
            id=c.id,
            nome=c.nome,
            direta=c.chave_direta is not None,
            participantes=[AutorOut.model_validate(u) for u in c.membros],
            ultima_mensagem=MensagemOut.model_validate(ultimas[c.id]) if c.id in ultimas else None,
            nao_lidas=nao_lidas.get(c.id, 0),
            atualizada_em=c.atualizada_em,
        )
        for c in conversas
    ]


def listar(db: Session, eu: User, offset: int, limit: int) -> tuple[list[ConversaOut], int]:
    """Conversa com a mensagem mais recente primeiro."""
    minhas = select(Participante.conversa_id).where(Participante.user_id == eu.id)
    total = db.scalar(select(func.count()).select_from(minhas.subquery())) or 0
    conversas = db.scalars(
        select(Conversa)
        .where(Conversa.id.in_(minhas))
        .order_by(Conversa.atualizada_em.desc(), Conversa.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return montar(db, list(conversas), eu), total


def buscar(db: Session, conversa_id: int, eu: User) -> ConversaOut:
    _participacao(db, conversa_id, eu)
    return montar(db, [db.get(Conversa, conversa_id)], eu)[0]


def total_nao_lidas(db: Session, eu: User) -> int:
    """Para o aviso na aba Chat: soma das não lidas de todas as minhas conversas."""
    minha_participacao = and_(
        Participante.conversa_id == Mensagem.conversa_id, Participante.user_id == eu.id
    )
    return (
        db.scalar(
            select(func.count())
            .select_from(Mensagem)
            .join(Participante, minha_participacao)
            .where(Mensagem.id > Participante.lida_ate_id, Mensagem.autor_id != eu.id)
        )
        or 0
    )


def mensagens(
    db: Session, conversa_id: int, eu: User, offset: int, limit: int
) -> tuple[list[Mensagem], int]:
    """Mais antiga primeiro, como se lê um chat. Abrir a conversa marca tudo como lido."""
    participacao = _participacao(db, conversa_id, eu)
    total = db.scalar(select(func.count()).where(Mensagem.conversa_id == conversa_id)) or 0
    items = list(
        db.scalars(
            select(Mensagem)
            .where(Mensagem.conversa_id == conversa_id)
            .order_by(Mensagem.id)
            .offset(offset)
            .limit(limit)
        )
    )
    ultima = db.scalar(select(func.max(Mensagem.id)).where(Mensagem.conversa_id == conversa_id))
    if ultima is not None and ultima > participacao.lida_ate_id:
        participacao.lida_ate_id = ultima
        db.commit()
    return items, total


def enviar(db: Session, conversa_id: int, eu: User, dados: MensagemCreate) -> Mensagem:
    participacao = _participacao(db, conversa_id, eu)
    agora = datetime.now(timezone.utc)
    mensagem = Mensagem(conversa_id=conversa_id, autor_id=eu.id, texto=dados.texto, created_at=agora)
    db.add(mensagem)
    db.flush()
    db.get(Conversa, conversa_id).atualizada_em = agora
    participacao.lida_ate_id = mensagem.id  # o que eu mesmo mando já está lido
    db.commit()
    db.refresh(mensagem)
    return mensagem
