# 1 arquivo por model — evita conflito de merge quando o trio trabalha em paralelo.
from app.models.user import User  # noqa: F401
