"""Grafo de follows: quem segue quem, em memória.

Python puro: só ids (int), dicts e sets. O banco é a fonte da verdade; este
grafo é reconstruído dele no startup e atualizado a cada follow/unfollow.

É a base das features sociais que dependem de "quem eu sigo" (feed, ranking
semanal entre quem eu sigo, amigos em comum, sugestões de quem seguir).
"""


class GrafoFollows:
    """Grafo direcionado guardado nos dois sentidos.

    - _seguindo[a]   = set de ids que `a` segue
    - _seguidores[b] = set de ids que seguem `b`

    Guardar os dois sentidos custa o dobro de memória, mas deixa O(1) as duas
    perguntas que o perfil faz o tempo todo: "quantos me seguem?" e "quantos
    eu sigo?".

    - seguir / deixar de seguir: O(1)
    - contar seguidores / seguindo: O(1)
    - listar seguidores / seguindo: O(k), k = tamanho da lista
    - reconstruir do zero: O(n follows), só no startup
    """

    def __init__(self) -> None:
        self._seguindo: dict[int, set[int]] = {}
        self._seguidores: dict[int, set[int]] = {}

    def reconstruir(self, arestas: list[tuple[int, int]]) -> None:
        """Chamado no startup com todos os pares (seguidor_id, seguido_id)."""
        self._seguindo = {}
        self._seguidores = {}
        for seguidor_id, seguido_id in arestas:
            self.seguir(seguidor_id, seguido_id)

    def segue(self, seguidor_id: int, seguido_id: int) -> bool:
        return seguido_id in self._seguindo.get(seguidor_id, set())

    def seguir(self, seguidor_id: int, seguido_id: int) -> None:
        """O(1). Seguir de novo não muda nada (set não duplica)."""
        self._seguindo.setdefault(seguidor_id, set()).add(seguido_id)
        self._seguidores.setdefault(seguido_id, set()).add(seguidor_id)

    def deixar_de_seguir(self, seguidor_id: int, seguido_id: int) -> None:
        """O(1). Deixar de seguir quem eu não sigo não é erro."""
        self._seguindo.get(seguidor_id, set()).discard(seguido_id)
        self._seguidores.get(seguido_id, set()).discard(seguidor_id)

    def qtd_seguidores(self, user_id: int) -> int:
        return len(self._seguidores.get(user_id, set()))

    def qtd_seguindo(self, user_id: int) -> int:
        return len(self._seguindo.get(user_id, set()))

    def seguidores(self, user_id: int) -> set[int]:
        return set(self._seguidores.get(user_id, set()))

    def seguindo(self, user_id: int) -> set[int]:
        return set(self._seguindo.get(user_id, set()))


# O singleton que a API importa (ver app/services/follows.py e o lifespan em main.py).
grafo_follows = GrafoFollows()
