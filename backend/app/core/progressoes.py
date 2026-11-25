"""Cat?logo de progress?es e opera??es sobre seu DAG, sem depend?ncias externas."""
from collections import deque

PROGRESSOES = {
    'pendurar_na_barra': {"nome": 'Pendurar na barra', "trilha": 'Puxar', "prerequisitos": [], "equipamento": ['barra_fixa']},
    'barra_australiana': {"nome": 'Barra australiana', "trilha": 'Puxar', "prerequisitos": ['pendurar_na_barra'], "equipamento": ['barra_fixa']},
    'barra_negativa': {"nome": 'Barra negativa', "trilha": 'Puxar', "prerequisitos": ['barra_australiana'], "equipamento": ['barra_fixa']},
    'barra_fixa': {"nome": 'Barra fixa', "trilha": 'Puxar', "prerequisitos": ['barra_negativa'], "equipamento": ['barra_fixa']},
    'muscle_up': {"nome": 'Muscle-up', "trilha": 'Puxar', "prerequisitos": ['barra_fixa'], "equipamento": ['barra_fixa']},
    'flexao_inclinada': {"nome": 'Flexão inclinada', "trilha": 'Empurrar', "prerequisitos": [], "equipamento": []},
    'flexao_joelhos': {"nome": 'Flexão com joelhos', "trilha": 'Empurrar', "prerequisitos": ['flexao_inclinada'], "equipamento": []},
    'flexao': {"nome": 'Flexão', "trilha": 'Empurrar', "prerequisitos": ['flexao_joelhos'], "equipamento": []},
    'paralela': {"nome": 'Paralela', "trilha": 'Empurrar', "prerequisitos": ['flexao'], "equipamento": ['paralelas']},
    'flexao_pike': {"nome": 'Flexão pike', "trilha": 'Empurrar', "prerequisitos": ['paralela'], "equipamento": []},
    'parada_de_maos_parede': {"nome": 'Parada de mãos na parede', "trilha": 'Empurrar', "prerequisitos": ['flexao_pike'], "equipamento": []},
    'agachamento': {"nome": 'Agachamento', "trilha": 'Pernas', "prerequisitos": [], "equipamento": []},
    'afundo': {"nome": 'Afundo', "trilha": 'Pernas', "prerequisitos": ['agachamento'], "equipamento": []},
    'agachamento_bulgaro': {"nome": 'Agachamento búlgaro', "trilha": 'Pernas', "prerequisitos": ['afundo'], "equipamento": []},
    'pistol_assistido': {"nome": 'Pistol assistido', "trilha": 'Pernas', "prerequisitos": ['agachamento_bulgaro'], "equipamento": []},
    'pistol': {"nome": 'Pistol', "trilha": 'Pernas', "prerequisitos": ['pistol_assistido'], "equipamento": []},
    'prancha': {"nome": 'Prancha', "trilha": 'Core', "prerequisitos": [], "equipamento": []},
    'canoa': {"nome": 'Canoa', "trilha": 'Core', "prerequisitos": ['prancha'], "equipamento": []},
    'elevacao_de_joelhos': {"nome": 'Elevação de joelhos', "trilha": 'Core', "prerequisitos": ['canoa'], "equipamento": ['barra_fixa']},
    'l_sit': {"nome": 'L-sit', "trilha": 'Core', "prerequisitos": ['elevacao_de_joelhos'], "equipamento": []},
}


def ordem_topologica(grafo=PROGRESSOES):
    """Ordena pr?-requisitos antes de dependentes; rejeita refer?ncias inv?lidas e ciclos."""
    graus = {codigo: len(dados["prerequisitos"]) for codigo, dados in grafo.items()}
    sucessores = {codigo: [] for codigo in grafo}
    for codigo, dados in grafo.items():
        for requisito in dados["prerequisitos"]:
            if requisito not in grafo:
                raise ValueError(f"Pr?-requisito desconhecido: {requisito}")
            sucessores[requisito].append(codigo)
    fila = deque(codigo for codigo, grau in graus.items() if grau == 0)
    ordem = []
    while fila:
        codigo = fila.popleft()
        ordem.append(codigo)
        for sucessor in sucessores[codigo]:
            graus[sucessor] -= 1
            if graus[sucessor] == 0:
                fila.append(sucessor)
    if len(ordem) != len(grafo):
        raise ValueError("O grafo de progress?es cont?m ciclo")
    return ordem


def disponiveis(dominadas, equipamentos):
    dominadas, equipamentos = set(dominadas), set(equipamentos)
    return [codigo for codigo in ordem_topologica()
            if codigo not in dominadas
            and set(PROGRESSOES[codigo]["prerequisitos"]) <= dominadas
            and set(PROGRESSOES[codigo]["equipamento"]) <= equipamentos]
