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
from pathlib import Path

import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.datas import FUSO_RECIFE, dia_em_recife
from app.models.comentario import Comentario
from app.models.conversa import Conversa, Participante
from app.models.curtida import Curtida
from app.models.equipamento_usuario import EquipamentoUsuario
from app.models.exercicio import Exercicio
from app.models.follow import Follow
from app.models.foto_de_perfil import FotoDePerfil
from app.models.mensagem import Mensagem
from app.models.post import Post
from app.models.progressao_dominada import ProgressaoDominada
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
#   folga 2         → ganha 5 a cada 3 dias        → Frango
#   comecando       → começou há 5 dias            → Pintinho / Frango
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

# Árvore (#10): o que cada nível já dominou e o equipamento que tem à mão.
# Cada lista inclui os pré-requisitos (tests/test_seed.py confere), então a
# árvore de cada um mostra o próximo passo certo.
DOMINADAS = {
    0: ["flexao_inclinada", "agachamento", "prancha", "pendurar_na_barra"],
    1: [
        "flexao_inclinada", "agachamento", "prancha", "pendurar_na_barra",
        "flexao_joelhos", "flexao", "afundo", "canoa", "barra_australiana",
    ],
    2: [
        "flexao_inclinada", "agachamento", "prancha", "pendurar_na_barra",
        "flexao_joelhos", "flexao", "afundo", "canoa", "barra_australiana",
        "barra_negativa", "barra_fixa", "paralela", "flexao_pike",
        "agachamento_bulgaro", "pistol_assistido", "elevacao_de_joelhos",
    ],
}
EQUIPAMENTOS = {0: ["barra_fixa"], 1: ["barra_fixa", "paralelas"], 2: ["barra_fixa", "elastico", "paralelas"]}

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

    # Árvore (#10): skills dominadas e equipamento de cada um, pelo nível.
    for pessoa in PESSOAS:
        dono = usuarios[pessoa.username].id
        db.add_all(ProgressaoDominada(user_id=dono, codigo=c) for c in DOMINADAS[pessoa.nivel])
        db.add_all(EquipamentoUsuario(user_id=dono, equipamento=e) for e in EQUIPAMENTOS[pessoa.nivel])

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

    _semear_conversas(db, usuarios)
    _semear_perfil_fixo(db, usuarios, hoje)
    db.commit()


# Chat (#21): conversas do frango_demo, para a banca abrir o Chat e ver a rede
# combinando treino. Cada conversa: (nome do grupo ou None, participantes além
# do demo, [(autor, minutos atrás, texto)], quantas das últimas o demo não leu).
CONVERSAS = [
    (
        "Treino de sábado em Tambaú",
        ["bia_paralela", "caio_barra", "carol_tambau", "matheus_def"],
        [
            ("bia_paralela", 300, "Galera, sábado 7h na barra da Praia de Tambaú. Quem vem?"),
            ("caio_barra", 290, "Tô dentro. Levo o elástico pra quem tá na negativa."),
            ("carol_tambau", 240, "Vou! Depois tem tapioca na orla, né?"),
            (USUARIO_DEMO, 200, "Posso ir mesmo sem fazer nenhuma barra fixa ainda?"),
            ("matheus_def", 190, "Pode e deve. A gente monta a progressão contigo lá."),
            ("bia_paralela", 45, "Confirmados até agora: 5. Ponto de encontro na barra perto do Busto de Tamandaré."),
            ("caio_barra", 12, "Previsão de sol. Levem água!"),
        ],
        2,
    ),
    (
        None,
        ["caio_barra"],
        [
            (USUARIO_DEMO, 600, "Caio, vi teu post da barra. Como tu começou na negativa?"),
            ("caio_barra", 580, "Sobe com um banquinho e desce contando 5 segundos. 3 séries de 3."),
            (USUARIO_DEMO, 570, "Só isso? Achei que era mais coisa."),
            ("caio_barra", 30, "Só isso, mas toda semana. Marca na árvore quando a australiana ficar fácil."),
        ],
        1,
    ),
    (
        None,
        ["duda_ccen"],
        [
            ("duda_ccen", 1500, "Bora na barra do CCEN às 17h amanhã?"),
            (USUARIO_DEMO, 1490, "Bora! Depois do RU?"),
            ("duda_ccen", 1485, "Isso. Te espero na pracinha."),
        ],
        0,
    ),
]


def _semear_conversas(db: Session, usuarios: dict[str, User]) -> None:
    agora = _agora()
    demo = usuarios[USUARIO_DEMO]
    for nome, outros, mensagens, nao_lidas in CONVERSAS:
        membros = [demo] + [usuarios[u] for u in outros]
        ids = sorted(u.id for u in membros)
        conversa = Conversa(
            nome=nome,
            chave_direta=f"{ids[0]}:{ids[1]}" if nome is None else None,
            created_at=agora - timedelta(minutes=mensagens[0][1] + 5),
            atualizada_em=agora - timedelta(minutes=mensagens[-1][1]),
        )
        db.add(conversa)
        db.flush()
        criadas = []
        for autor, minutos, texto in mensagens:
            mensagem = Mensagem(
                conversa_id=conversa.id,
                autor_id=usuarios[autor].id,
                texto=texto,
                created_at=agora - timedelta(minutes=minutos),
            )
            db.add(mensagem)
            criadas.append(mensagem)
        db.flush()
        lidas_pelo_demo = criadas[len(criadas) - nao_lidas - 1].id if nao_lidas < len(criadas) else 0
        for membro in membros:
            # quem não é o demo já leu tudo; o demo deixou as últimas `nao_lidas` para a banca ver o aviso
            lida = lidas_pelo_demo if membro is demo else criadas[-1].id
            db.add(Participante(conversa_id=conversa.id, user_id=membro.id, lida_ate_id=lida))


# Perfil de verdade de quem faz a rede, igual a cada subida (o disco do Render
# zera e a rede volta com o seed). Fica fora de PESSOAS: tem só o post que a
# pessoa escreveu, sem treinos sorteados no nome dela, e não mexe no sorteio
# dos outros. A foto de perfil mora em app/seed_fotos/.
PERFIL_FIXO = {
    "username": "edu",
    "name": "Eduardo",
    "bio": "",
    "nivel": 2,
    "foto_de_perfil": "edu_perfil.jpg",
    "post": {
        "texto": "Treinando barra graças a deus!!!",
        "exercicios": [("barra_fixa", 3, 8)],
    },
    "seguidores": [USUARIO_DEMO, "caio_barra", "bia_paralela", "matheus_def", "gabi_muscleup"],
    "segue": ["caio_barra", "bia_paralela", "matheus_def", "gabi_muscleup", "rafa_lsit"],
    "tamo_junto": [USUARIO_DEMO, "caio_barra", "bia_paralela", "matheus_def"],
    "comentarios": [("bia_paralela", "Boa demais, segue firme."), ("caio_barra", "Tamo junto!")],
}
FOTOS_DO_SEED = Path(__file__).parent / "seed_fotos"


def _semear_perfil_fixo(db: Session, usuarios: dict[str, User], hoje: date) -> None:
    perfil = PERFIL_FIXO
    hash_seed = usuarios[USUARIO_DEMO].password_hash
    eu = User(
        username=perfil["username"],
        name=perfil["name"],
        bio=perfil["bio"],
        password_hash=hash_seed,
        created_at=datetime.combine(hoje - timedelta(days=14), time(9), tzinfo=FUSO_RECIFE),
    )
    db.add(eu)
    db.flush()
    db.add_all(ProgressaoDominada(user_id=eu.id, codigo=c) for c in DOMINADAS[perfil["nivel"]])
    db.add_all(EquipamentoUsuario(user_id=eu.id, equipamento=e) for e in EQUIPAMENTOS[perfil["nivel"]])

    foto = FotoDePerfil(user_id=eu.id, tipo="image/jpeg", conteudo=(FOTOS_DO_SEED / perfil["foto_de_perfil"]).read_bytes())
    db.add(foto)
    db.flush()
    eu.avatar_url = f"/usuarios/{eu.username}/foto/{foto.chave}"

    # o post de hoje, uns minutos atrás (no máximo a 0h01 de hoje, para contar o dia certo)
    inicio_de_hoje = datetime.combine(hoje, time(0, 1), tzinfo=FUSO_RECIFE).astimezone(timezone.utc)
    momento = max(_agora() - timedelta(minutes=20), inicio_de_hoje)
    dados = perfil["post"]
    post = Post(
        autor_id=eu.id,
        texto=dados["texto"],
        created_at=momento,
        treino=Treino(
            autor_id=eu.id,
            dia=hoje,
            exercicios=[Exercicio(progressao=p, series=s, reps=r) for p, s, r in dados["exercicios"]],
        ),
    )
    db.add(post)
    db.flush()

    db.add_all(Follow(seguidor_id=usuarios[u].id, seguido_id=eu.id) for u in perfil["seguidores"])
    db.add_all(Follow(seguidor_id=eu.id, seguido_id=usuarios[u].id) for u in perfil["segue"])
    db.add_all(Curtida(usuario_id=usuarios[u].id, post_id=post.id) for u in perfil["tamo_junto"])
    for i, (autor, texto) in enumerate(perfil["comentarios"], 1):
        db.add(
            Comentario(
                post_id=post.id,
                autor_id=usuarios[autor].id,
                texto=texto,
                created_at=min(momento + timedelta(minutes=3 * i), _agora()),
            )
        )


def semear_se_vazio(db: Session) -> int:
    """Roda o seed_fake se o banco não tem nenhum usuário. Devolve quantos criou."""
    if db.scalar(select(User.id).limit(1)) is not None:
        return 0
    seed_fake(db)
    return len(PESSOAS) + 1  # + o PERFIL_FIXO
