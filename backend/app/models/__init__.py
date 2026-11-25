# 1 arquivo por model — evita conflito de merge quando o time trabalha em paralelo.
from app.models.comentario import Comentario  # noqa: F401
from app.models.conversa import Conversa, Participante  # noqa: F401
from app.models.curtida import Curtida  # noqa: F401
from app.models.exercicio import Exercicio  # noqa: F401
from app.models.follow import Follow  # noqa: F401
from app.models.mensagem import Mensagem  # noqa: F401
from app.models.post import Post  # noqa: F401
from app.models.treino import Treino  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.sessao import Sessao  # noqa: F401
