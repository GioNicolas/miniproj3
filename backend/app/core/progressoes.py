"""Árvore de progressões (#10): o catálogo de skills e o DAG de pré-requisitos.

Python puro. O catálogo fica em código, e não no banco, para os códigos serem
estáveis: o registro de treino (#9), o seed e a tela de /treinos usam os mesmos.
O banco guarda só o que é de cada pessoa (skills dominadas e equipamentos).

Cada aresta liga um pré-requisito à skill que ele libera. A ordenação topológica
de Kahn valida o grafo (código desconhecido ou ciclo derruba a API na subida,
não em produção no meio da demo) e dá o nível de cada skill para desenhar a árvore.

Custos, com V skills e E arestas (pré-requisitos):
- ordem_topologica e niveis: O(V + E), calculados uma vez ao importar o módulo
- disponiveis(dominadas, equipamentos): O(V + E)
- liberadas_por / dependentes: O(V + E)
"""

from collections import deque
from collections.abc import Iterable

EQUIPAMENTOS = ("barra_fixa", "paralelas", "elastico")

PROGRESSOES: dict[str, dict] = {
    # Puxar
    "pendurar_na_barra": {"nome": "Pendurar na barra", "trilha": "Puxar", "prerequisitos": [], "equipamento": ["barra_fixa"]},
    "barra_australiana": {"nome": "Barra australiana", "trilha": "Puxar", "prerequisitos": ["pendurar_na_barra"], "equipamento": ["barra_fixa"]},
    "barra_negativa": {"nome": "Barra negativa", "trilha": "Puxar", "prerequisitos": ["barra_australiana"], "equipamento": ["barra_fixa"]},
    "barra_fixa": {"nome": "Barra fixa", "trilha": "Puxar", "prerequisitos": ["barra_negativa"], "equipamento": ["barra_fixa"]},
    "muscle_up": {"nome": "Muscle-up", "trilha": "Puxar", "prerequisitos": ["barra_fixa", "paralela"], "equipamento": ["barra_fixa"]},
    # Empurrar
    "flexao_inclinada": {"nome": "Flexão inclinada", "trilha": "Empurrar", "prerequisitos": [], "equipamento": []},
    "flexao_joelhos": {"nome": "Flexão com joelhos", "trilha": "Empurrar", "prerequisitos": ["flexao_inclinada"], "equipamento": []},
    "flexao": {"nome": "Flexão", "trilha": "Empurrar", "prerequisitos": ["flexao_joelhos"], "equipamento": []},
    "paralela": {"nome": "Paralela", "trilha": "Empurrar", "prerequisitos": ["flexao"], "equipamento": ["paralelas"]},
    "flexao_pike": {"nome": "Flexão pike", "trilha": "Empurrar", "prerequisitos": ["flexao"], "equipamento": []},
    "parada_de_maos_parede": {"nome": "Parada de mãos na parede", "trilha": "Empurrar", "prerequisitos": ["flexao_pike"], "equipamento": []},
    # Pernas
    "agachamento": {"nome": "Agachamento", "trilha": "Pernas", "prerequisitos": [], "equipamento": []},
    "afundo": {"nome": "Afundo", "trilha": "Pernas", "prerequisitos": ["agachamento"], "equipamento": []},
    "agachamento_bulgaro": {"nome": "Agachamento búlgaro", "trilha": "Pernas", "prerequisitos": ["afundo"], "equipamento": []},
    "pistol_assistido": {"nome": "Pistol assistido", "trilha": "Pernas", "prerequisitos": ["agachamento_bulgaro"], "equipamento": []},
    "pistol": {"nome": "Pistol", "trilha": "Pernas", "prerequisitos": ["pistol_assistido"], "equipamento": []},
    # Core
    "prancha": {"nome": "Prancha", "trilha": "Core", "prerequisitos": [], "equipamento": []},
    "canoa": {"nome": "Canoa", "trilha": "Core", "prerequisitos": ["prancha"], "equipamento": []},
    "elevacao_de_joelhos": {"nome": "Elevação de joelhos", "trilha": "Core", "prerequisitos": ["canoa", "pendurar_na_barra"], "equipamento": ["barra_fixa"]},
    "l_sit": {"nome": "L-sit", "trilha": "Core", "prerequisitos": ["elevacao_de_joelhos"], "equipamento": []},
}


def ordem_topologica(grafo: dict[str, dict] = PROGRESSOES) -> list[str]:
    """Kahn: pré-requisitos antes de quem depende deles. Rejeita código desconhecido e ciclo."""
    faltando = {codigo: len(dados["prerequisitos"]) for codigo, dados in grafo.items()}
    sucessores: dict[str, list[str]] = {codigo: [] for codigo in grafo}
    for codigo, dados in grafo.items():
        for requisito in dados["prerequisitos"]:
            if requisito not in grafo:
                raise ValueError(f"pré-requisito desconhecido em {codigo}: {requisito}")
            sucessores[requisito].append(codigo)

    fila = deque(codigo for codigo, n in faltando.items() if n == 0)
    ordem = []
    while fila:
        codigo = fila.popleft()
        ordem.append(codigo)
        for sucessor in sucessores[codigo]:
            faltando[sucessor] -= 1
            if faltando[sucessor] == 0:
                fila.append(sucessor)
    if len(ordem) != len(grafo):
        presos = sorted(set(grafo) - set(ordem))
        raise ValueError(f"o grafo de progressões tem ciclo entre: {', '.join(presos)}")
    return ordem


def calcular_niveis(grafo: dict[str, dict] = PROGRESSOES) -> dict[str, int]:
    """Nível 1 = sem pré-requisito; os outros, 1 + o maior nível dos pré-requisitos."""
    niveis: dict[str, int] = {}
    for codigo in ordem_topologica(grafo):
        niveis[codigo] = 1 + max((niveis[p] for p in grafo[codigo]["prerequisitos"]), default=0)
    return niveis


# Validado e calculado uma vez, ao importar: um catálogo quebrado não sobe.
ORDEM = ordem_topologica()
NIVEIS = calcular_niveis()


def disponiveis(dominadas: Iterable[str], equipamentos: Iterable[str]) -> list[str]:
    """O próximo passo: ainda não dominadas, com os pré-requisitos dominados e o equipamento à mão."""
    dominadas, equipamentos = set(dominadas), set(equipamentos)
    return [
        codigo
        for codigo in ORDEM
        if codigo not in dominadas
        and set(PROGRESSOES[codigo]["prerequisitos"]) <= dominadas
        and set(PROGRESSOES[codigo]["equipamento"]) <= equipamentos
    ]


def dependentes_dominadas(codigo: str, dominadas: Iterable[str]) -> list[str]:
    """Skills dominadas que têm `codigo` como pré-requisito direto (impedem desfazê-la)."""
    dominadas = set(dominadas)
    return [outro for outro in ORDEM if outro in dominadas and codigo in PROGRESSOES[outro]["prerequisitos"]]


def respeita_prerequisitos(dominadas: Iterable[str]) -> bool:
    """Toda skill dominada tem os pré-requisitos dominados (o seed usa para se checar)."""
    dominadas = set(dominadas)
    return all(set(PROGRESSOES[codigo]["prerequisitos"]) <= dominadas for codigo in dominadas)
