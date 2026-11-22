from pydantic import BaseModel, Field, field_validator


def validar_limite_bcrypt(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("a senha deve ter no máximo 72 bytes em UTF-8")
    return password


class RegistroIn(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8)

    _validar_senha = field_validator("password")(validar_limite_bcrypt)


class LoginIn(BaseModel):
    username: str
    password: str

    _validar_senha = field_validator("password")(validar_limite_bcrypt)


class TokenOut(BaseModel):
    token: str
