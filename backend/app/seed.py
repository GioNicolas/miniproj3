"""Seed com cara de calistenia (#13): a Frangaria abre com uma comunidade viva.

Iniciantes de calistenia da UFPB e de João Pessoa, treinando nas últimas 3
semanas, seguindo uns aos outros, dando "tamo junto" e tirando dúvida nos
comentários. Os textos são escritos à mão (nada de faker.text()).

- Determinístico: tudo sai de random.Random(42). As datas são relativas a hoje
  (no fuso de Recife), então a demo está sempre "fresca" e sempre igual.
- Roda na subida da API com SEED_ON_BOOT=true quando o banco não tem nenhum
  usuário (lifespan em main.py) e por `make seed`. Num banco com gente, não faz
  nada.
- Para a banca: entre como `frango_demo` (senha abaixo). Ele já segue gente,
  então o feed e a Granja da Semana aparecem cheios.
"""

import random
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone

import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.datas import FUSO_RECIFE, dia_em_recife
from app.models.comentario import Comentario
from app.models.curtida import Curtida
from app.models.exercicio import Exercicio
from app.models.follow import Follow
from app.models.post import Post
from app.models.treino import Treino
from app.models.user import User

# A mesma senha para todo usuário do seed, para dar para logar na demo.
SENHA_SEED = "senha-forte-123"
USUARIO_DEMO = "frango_demo"
SEMANAS = 3

# Como cada um treina nas últimas 3 semanas: quantos dias de folga entre um
# treino e o próximo (sorteado da lista). Pela regra do frango da #11 (+10 por
# dia de treino; −5 por dia a partir do 2º dia seguido sem treino), a folga
# decide o nível:
#   folga 0 ou 1    → nunca perde força            → Monstro
#   folga 1, 2 ou 2 → ganha uns 7 a cada 2,7 dias  → Galo
#   folga 2         → ganha 5 a cada 3 dias        → Frango de granja
#   comecando       → começou há 5 dias            → Frango / Frango de granja
#   sumiu           → treinava e parou há 6 dias   → definhando
PADROES = {
    "monstro": {"folgas": (0, 1), "parou_ha": 0},
    "galo": {"folgas": (1, 2, 2), "parou_ha": 0},
    "regular": {"folgas": (2,), "parou_ha": 0},
    "comecando": {"folgas": (0, 1), "parou_ha": 0, "comecou_ha": 4},
    "sumiu": {"folgas": (1, 2), "parou_ha": 6},
}


@dataclass(frozen=True)
class Pessoa:
    username: str
    name: str
    bio: str
    padrao: str
    nivel: int  # 0 = começando, 1 = básico, 2 = já tem barra fixa


PESSOAS = [
    Pessoa(USUARIO_DEMO, "Frango Demo", "Conta de demonstração. Entrei agora e já tô seguindo a galera.", "comecando", 0),
    Pessoa("caio_barra", "Caio Medeiros", "Engenharia Civil. Barra todo dia na pracinha do CCEN, chova ou faça sol.", "monstro", 2),
    Pessoa("bia_paralela", "Bia Nóbrega", "Ed. Física UFPB. Monitora informal do treino de sábado em Tambaú.", "monstro", 2),
    Pessoa("rafa_lsit", "Rafael Dantas", "Atrás do L-sit desde agosto. Um dia sai.", "galo", 2),
    Pessoa("juju_treina", "Júlia Ramalho", "Computação. Treino entre uma aula e outra no CI.", "galo", 1),
    Pessoa("pedro_pistol", "Pedro Henrique", "Pernas não são opcionais. Pistol assistido e contando.", "galo", 1),
    Pessoa("lari_flexao", "Larissa Freire", "Saí da flexão inclinada pra flexão no chão em 1 mês.", "regular", 1),
    Pessoa("thiago_core", "Thiago Mendes", "Prancha é meditação com sofrimento.", "regular", 1),
    Pessoa("duda_ccen", "Maria Eduarda", "Matemática. Treino na pracinha do CCEN depois do RU.", "regular", 0),
    Pessoa("gabi_muscleup", "Gabriela Toscano", "Meta do semestre: o primeiro muscle-up.", "monstro", 2),
    Pessoa("leo_bancarios", "Leonardo Vieira", "Treino na Praça da Paz, nos Bancários. Chega junto.", "galo", 1),
    Pessoa("nanda_negativa", "Fernanda Brito", "Fase das negativas. A barra fixa vem.", "regular", 0),
    Pessoa("joao_lagoa", "João Victor", "Corrida na Lagoa + barra no Parque Solon de Lucena.", "regular", 1),
    Pessoa("mari_cabobranco", "Mariana Lins", "Treino na orla do Cabo Branco no fim de tarde.", "galo", 1),
    Pessoa("vini_australiana", "Vinícius Rocha", "Barra australiana até a barra fixa sair.", "comecando", 0),
    Pessoa("ana_agachamento", "Ana Clara", "Medicina. 15 minutos de treino é melhor que zero.", "comecando", 0),
    Pessoa("igor_paralelas", "Igor Cavalcanti", "Paralelas na pracinha e café no Centro de Vivência.", "sumiu", 1),
    Pessoa("bruna_prancha", "Bruna Guedes", "Voltando depois das provas. Paciência comigo.", "sumiu", 0),
    Pessoa("matheus_def", "Matheus Araújo", "DEF/UFPB. Pergunta que eu respondo.", "monstro", 2),
    Pessoa("carol_tambau", "Carolina Soares", "Treino de sábado na barra da Praia de Tambaú.", "regular", 1),
    Pessoa("davi_pike", "Davi Albuquerque", "Treinando pike pra um dia virar parada de mão.", "galo", 1),
    Pessoa("sofia_canoa", "Sofia Montenegro", "Core forte, coluna feliz.", "sumiu", 1),
]

# Progressões do registro de treino (os mesmos códigos da tela de /treinos,
# até o catálogo da árvore #10 entrar). Por nível de quem treina.
PROGRESSOES = {
    0: ["pendurar_na_barra", "barra_australiana", "flexao_inclinada", "flexao_joelhos", "agachamento", "prancha"],
    1: ["barra_australiana", "barra_negativa", "flexao", "paralela", "afundo", "agachamento_bulgaro", "canoa", "elevacao_de_joelhos", "flexao_pike"],
    2: ["barra_fixa", "muscle_up", "paralela", "flexao_pike", "parada_de_maos_parede", "pistol_assistido", "pistol", "l_sit"],
}

TEXTOS_DE_TREINO = [
    "Treino feito na pracinha do CCEN. Sol de rachar, mas foi.",
    "Fim de tarde na barra da Praia de Tambaú. Melhor academia de João Pessoa.",
    "Saiu! Dei mais reps que semana passada.",
    "Treino curto antes da aula das 7h. Contou.",
    "Hoje doeu, mas o frango agradece.",
    "Treino na Praça da Paz com a galera dos Bancários.",
    "Fui só pra não quebrar a semana. Feito é melhor que perfeito.",
    "Choveu e treinei no corredor do CCHLA mesmo.",
    "Mais uma série do que eu achava que aguentava. Tamo junto, galera.",
    "Depois do RU, barra. Digestão que lute.",
    "Treino de sábado em Tambaú. Valeu quem colou!",
    "Treino rápido no intervalo do estágio.",
    "Primeira vez que segurei a posição sem tremer.",
    "Voltei! Uma semana parado e o corpo sentiu.",
    "Fiz o treino da semana inteira hoje? Não. Fiz o de hoje.",
    "Barra lotada na pracinha, revezei com a galera da Física.",
    "Treino das 6h na orla. Tambaú vazia é outra coisa.",
    "Bati a meta de séries da semana.",
    "Treino leve, só pra manter a constância.",
]

# Textos que falam de um exercício: o treino registrado tem que bater com eles.
TEXTOS_COM_EXERCICIO = {
    "Paralelas no Parque Solon de Lucena e depois uma volta na Lagoa.": ("paralela",),
    "Orla do Cabo Branco, pôr do sol e negativa. Não tem como errar.": ("barra_negativa",),
    "Hoje a negativa veio lenta e controlada, 5 segundos descendo.": ("barra_negativa",),
    "Hoje foi só core. Prancha parecia que não acabava.": ("prancha", "canoa", "elevacao_de_joelhos"),
    "Hoje foi só core, e o L-sit segurou uns segundos a mais.": ("l_sit", "elevacao_de_joelhos"),
    "Pernas hoje. Amanhã descer a escada do CT vai ser um evento.": ("agachamento", "afundo", "agachamento_bulgaro"),
    "Pistol assistido saindo mais firme. Perna esquerda ainda treme.": ("pistol_assistido",),
    "Primeira barra fixa limpa sem pular! Tô sem acreditar.": ("barra_fixa",),
    "Muscle-up feio, mas saiu. Conta!": ("muscle_up",),
    "Australiana com o pé mais à frente hoje. Sentiu nas costas.": ("barra_australiana",),
    "Flexão inclinada no banco da pracinha. Semana que vem vou pro chão.": ("flexao_inclinada",),
}

POSTS_DE_CONVERSA = [
    "Alguém treina na pracinha do CCEN amanhã de manhã? Tô precisando de parceiro pra barra.",
    "Dúvida sincera: negativa todo dia ou dia sim dia não?",
    "Sábado tem treino coletivo na barra de Tambaú às 7h. Quem vai?",
    "Qual a progressão de vocês pra sair da barra australiana pra barra fixa?",
    "Dica que mudou meu treino: anotar as reps. Dá pra ver a evolução de verdade.",
    "Minha mão tá cheia de calo da barra. Normal ou tô pegando errado?",
    "Quanto tempo vocês levaram pra fazer a primeira barra fixa?",
    "Alguém sabe se a barra do Parque Solon de Lucena voltou a funcionar?",
    "Treinar em jejum de manhã: sim ou não?",
    "Galera da Praça da Paz, a barra baixa foi consertada!",
    "Prova de Cálculo amanhã. O treino de hoje foi a única coisa que deu certo.",
    "Pergunta de iniciante: flexão com joelho conta ou é vergonha?",
    "Quem quiser entrar no grupo do treino de sábado, comenta aqui.",
    "Postura na paralela: cotovelo aberto ou fechado?",
    "Sugestão: alguém monta um treino de 15 minutos pra quem só tem o intervalo do RU?",
]

COMENTARIOS = [
    "Tamo junto!",
    "Boa demais, segue firme.",
    "Eu vou! Que horas?",
    "Dia sim dia não. O músculo precisa descansar.",
    "Conta sim! Todo mundo começa de algum lugar.",
    "Calo é normal, mas lixa de unha ajuda a não abrir.",
    "Levei uns 3 meses. Paciência que vem.",
    "Cotovelo junto do corpo, sempre.",
    "Esse treino de Tambaú é o melhor da semana.",
    "Eu colo na pracinha amanhã às 7h.",
    "Anota as reps mesmo, faz diferença.",
    "Aquele pôr do sol no Cabo Branco é treino extra.",
    "Que evolução!",
    "Me chama pro próximo.",
    "Negativa bem lenta, 5 segundos descendo.",
    "Australiana com o pé mais à frente fica mais difícil, testa.",
    "A barra do Solon de Lucena tá ok sim, treinei lá ontem.",
    "Constância vence força.",
    "Bora, frango!",
    "Faz prancha no fim do treino que ajuda no L-sit.",
    "Respeita o descanso, senão o ombro reclama.",
    "Feito é melhor que perfeito, isso aí.",
    "Primeira barra fixa vem quando você menos espera.",
    "Eu faço 15 minutos entre aulas, dá certo.",
]


def _hoje() -> date:
    return dia_em_recife(datetime.now(timezone.utc))


def _momento(dia: date, rng: random.Random) -> datetime:
    """Um horário plausível de treino (6h às 21h em Recife), em UTC, nunca no futuro."""
    hora = time(rng.randint(6, 21), rng.choice((0, 10, 20, 30, 40, 50)))
    momento = datetime.combine(dia, hora, tzinfo=FUSO_RECIFE).astimezone(timezone.utc)
    return min(momento, _agora() - timedelta(minutes=rng.randint(5, 90)))


def _agora() -> datetime:
    return datetime.now(timezone.utc)


def dias_de_treino(padrao: str, hoje: date, rng: random.Random) -> list[date]:
    """Os dias em que alguém com esse padrão treinou nas últimas 3 semanas."""
    regra = PADROES[padrao]
    dia = hoje - timedelta(days=regra.get("comecou_ha", 7 * SEMANAS - 1 - rng.randint(0, 1)))
    ultimo = hoje - timedelta(days=regra["parou_ha"])
    dias = []
    while dia <= ultimo:
        dias.append(dia)
        dia += timedelta(days=1 + rng.choice(regra["folgas"]))
    if dias and dias[-1] != ultimo and padrao in ("monstro", "galo", "comecando", "sumiu"):
        # quem treina firme já treinou hoje; quem sumiu treinou no último dia antes de sumir
        dias.append(ultimo)
    return dias


def _texto_e_exercicios(pessoa: Pessoa, rng: random.Random) -> tuple[str, list[Exercicio]]:
    """O texto do check-in e os exercícios, que batem quando o texto cita um."""
    possiveis = PROGRESSOES[pessoa.nivel]
    especificos = [
        (texto, [p for p in progressoes if p in possiveis])
        for texto, progressoes in TEXTOS_COM_EXERCICIO.items()
        if any(p in possiveis for p in progressoes)
    ]
    if especificos and rng.random() < 0.35:
        texto, escolhidos = rng.choice(especificos)
    else:
        texto = rng.choice(TEXTOS_DE_TREINO)
        escolhidos = rng.sample(possiveis, k=rng.randint(1, 3))
    exercicios = [
        Exercicio(progressao=p, series=rng.randint(2, 5), reps=rng.randint(3, 15))
        for p in escolhidos
    ]
    return texto, exercicios


def seed_fake(db: Session) -> None:
    """Popula a rede. Chamar com o banco vazio (semear_se_vazio cuida disso)."""
    rng = random.Random(42)
    hoje = _hoje()
    hash_seed = bcrypt.hashpw(SENHA_SEED.encode(), bcrypt.gensalt()).decode()

    usuarios = {
        p.username: User(
            username=p.username,
            name=p.name,
            bio=p.bio,
            password_hash=hash_seed,
            created_at=_momento(hoje - timedelta(days=7 * SEMANAS + rng.randint(1, 10)), rng),
        )
        for p in PESSOAS
    }
    db.add_all(usuarios.values())
    db.flush()

    # Check-ins: um post de treino por dia treinado.
    posts: list[Post] = []
    for pessoa in PESSOAS:
        for dia in dias_de_treino(pessoa.padrao, hoje, rng):
            autor = usuarios[pessoa.username]
            texto, exercicios = _texto_e_exercicios(pessoa, rng)
            posts.append(
                Post(
                    autor_id=autor.id,
                    texto=texto,
                    created_at=_momento(dia, rng),
                    treino=Treino(autor_id=autor.id, dia=dia, exercicios=exercicios),
                )
            )
    # Conversa: dúvidas, combinados e resenha, sem treino.
    for texto in POSTS_DE_CONVERSA:
        autor = usuarios[rng.choice(PESSOAS).username]
        dia = hoje - timedelta(days=rng.randint(0, 7 * SEMANAS - 1))
        posts.append(Post(autor_id=autor.id, texto=texto, created_at=_momento(dia, rng)))
    db.add_all(posts)
    db.flush()

    # Follows: o demo segue metade da rede; cada um segue de 3 a 7 pessoas.
    follows: set[tuple[int, int]] = set()
    demo = usuarios[USUARIO_DEMO]
    outros = [u for u in usuarios.values() if u is not demo]
    for seguido in rng.sample(outros, k=len(outros) // 2):
        follows.add((demo.id, seguido.id))
    for seguidor in outros:
        for seguido in rng.sample(outros, k=rng.randint(3, 7)):
            if seguido is not seguidor:
                follows.add((seguidor.id, seguido.id))
    db.add_all(Follow(seguidor_id=a, seguido_id=b) for a, b in sorted(follows))

    # Tamo junto: cada post recebe de 0 a 6, de quem não é o autor.
    curtidas: set[tuple[int, int]] = set()
    for post in posts:
        quem = [u for u in outros if u.id != post.autor_id]
        for usuario in rng.sample(quem, k=rng.randint(0, 6)):
            curtidas.add((usuario.id, post.id))
    db.add_all(Curtida(usuario_id=u, post_id=p) for u, p in sorted(curtidas))

    # Comentários: mais nos posts de conversa, alguns nos de treino.
    for post in posts:
        quantos = rng.randint(1, 4) if post.treino is None else rng.choice((0, 0, 0, 1, 2))
        for _ in range(quantos):
            autor = rng.choice([u for u in outros if u.id != post.autor_id])
            db.add(
                Comentario(
                    post_id=post.id,
                    autor_id=autor.id,
                    texto=rng.choice(COMENTARIOS),
                    created_at=min(
                        post.created_at + timedelta(minutes=rng.randint(5, 600)), _agora()
                    ),
                )
            )
    db.commit()


def semear_se_vazio(db: Session) -> int:
    """Roda o seed_fake se o banco não tem nenhum usuário. Devolve quantos criou."""
    if db.scalar(select(User.id).limit(1)) is not None:
        return 0
    seed_fake(db)
    return len(PESSOAS)
