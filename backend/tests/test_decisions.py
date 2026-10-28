"""Valida o DECISIONS.md em todo `make test` — o corretor usa o MESMO parser.

Se passa aqui, o grader parseia por construção. Linha inválida numa feature de
menu = a feature reprova na checagem transversal e vale 0 (ver RUBRICA.md).

Regras: célula vazia ou "—" = trabalho em andamento, ignorada. Célula
preenchida tem que ser válida AGORA.
"""

import importlib
import re
from pathlib import Path

import pytest

DECISIONS = Path(__file__).resolve().parents[2] / "DECISIONS.md"

# nome (casefold) -> (camada, esforço P/M/G) — extraído do CATALOGO.md
CATALOGO_MENU = {
    "amigos em comum": ("intermediario", "P"),
    "autocomplete com trie": ("avancado", "G"),
    "badges/conquistas": ("intermediario", "M"),
    "bloquear usuário": ("intermediario", "M"),
    "bookmarks (salvos)": ("intermediario", "P"),
    "busca de posts por palavra": ("intermediario", "M"),
    "busca de usuários por prefixo (busca binária)": ("intermediario", "M"),
    "cache lru de perfis": ("intermediario", "M"),
    "comentários em árvore": ("avancado", "G"),
    "comunidades/grupos": ("intermediario", "G"),
    "conta privada + pedidos de follow": ("intermediario", "M"),
    "dms 1-para-1": ("avancado", "G"),
    "enquetes": ("intermediario", "M"),
    "feed 'explorar' com filtro": ("intermediario", "P"),
    "feed ranqueado 'em alta'": ("intermediario", "M"),
    "fila de moderação de denúncias": ("intermediario", "M"),
    "graus de separação (bfs no grafo de follows)": ("avancado", "M"),
    "hashtags com índice invertido": ("intermediario", "M"),
    "heatmap de atividade 7×24": ("intermediario", "M"),
    "histórico de navegação com 'voltar'": ("intermediario", "P"),
    "listas/coleções curadas": ("intermediario", "M"),
    "menções @username": ("intermediario", "M"),
    "nota/review com estrelas": ("intermediario", "M"),
    "notificações": ("intermediario", "M"),
    "posts com imagem (upload)": ("avancado", "M"),
    "rate limit de posts": ("intermediario", "P"),
    "stories do dia (posts efêmeros)": ("intermediario", "M"),
    "streak de atividade": ("intermediario", "P"),
    "sugestões de quem seguir": ("intermediario", "M"),
    "top-k com heap": ("avancado", "M"),
    "trending de hashtags": ("intermediario", "P"),
    "últimos n visitantes do perfil": ("intermediario", "P"),
}

VAZIO = {"", "—", "-"}


def _e_nucleo(nome_feature: str) -> bool:
    return "núcleo" in nome_feature.casefold() or "nucleo" in nome_feature.casefold()


def _linhas_da_tabela() -> list[list[str]]:
    texto = DECISIONS.read_text(encoding="utf-8")
    linhas = []
    dentro = False
    for linha in texto.splitlines():
        if linha.startswith("## Features"):
            dentro = True
            continue
        if dentro and linha.startswith("## "):
            break
        if dentro and linha.strip().startswith("|"):
            celulas = [c.strip() for c in linha.strip().strip("|").split("|")]
            if celulas and not set(celulas[0]) <= {"-", " ", ":"} and celulas[0] != "Feature":
                linhas.append(celulas)
    return linhas


def test_tabela_existe_e_parseia():
    assert DECISIONS.exists(), "DECISIONS.md sumiu — ele é o índice da correção"
    linhas = _linhas_da_tabela()
    assert len(linhas) >= 8, (
        "a tabela de Features precisa existir sob '## Features' "
        "(as 8 linhas do núcleo já vêm no template)"
    )
    for celulas in linhas:
        assert len(celulas) == 7, (
            f"linha '{celulas[0]}' tem {len(celulas)} colunas, esperava 7: "
            "Feature | Dono | Módulo em core/ | Endpoint | Big O | Por quê | Caso autoral"
        )


def test_linhas_de_menu_preenchidas_sao_validas():
    for celulas in _linhas_da_tabela():
        feature, modulo = celulas[0], celulas[2]
        if _e_nucleo(feature):
            continue  # núcleo: só Feature e Dono importam

        assert feature.casefold() in CATALOGO_MENU, (
            f"'{feature}' não está no catálogo — copie o nome exato do CATALOGO.md "
            "(feature fora do catálogo não pontua)"
        )

        if modulo not in VAZIO:
            assert re.fullmatch(r"app\.core\.[a-z_][a-z0-9_]*", modulo), (
                f"módulo '{modulo}' fora do formato app.core.<nome>"
            )
            try:
                importlib.import_module(modulo)
            except ImportError as e:
                raise AssertionError(
                    f"'{modulo}' declarado no DECISIONS.md mas não importa: {e} "
                    "(arquivo inexistente = feature reprova na transversal)"
                ) from e


@pytest.mark.skip(
    reason="Remova quando o time definir as features: cada membro precisa ser dono de ≥1 feature de MENU M ou G"
)
def test_piso_cada_membro_tem_feature_media_ou_grande():
    donos: dict[str, list[str]] = {}
    for celulas in _linhas_da_tabela():
        feature, dono = celulas[0], celulas[1]
        if dono in VAZIO or _e_nucleo(feature):
            continue
        donos.setdefault(dono.casefold(), []).append(feature.casefold())

    assert donos, "nenhuma feature de menu tem dono — preencha o DECISIONS.md"
    for dono, features in donos.items():
        esforcos = {CATALOGO_MENU[f][1] for f in features if f in CATALOGO_MENU}
        assert esforcos & {"M", "G"}, (
            f"{dono} só tem features fáceis (P) — o piso é ≥1 feature de menu M/G por membro"
        )
