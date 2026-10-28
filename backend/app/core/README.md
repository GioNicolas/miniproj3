# `core/` — as estruturas de dados do seu time

Aqui vivem as estruturas de dados das suas features, como **Python puro**: sem
SQLAlchemy, sem FastAPI, sem import de banco. Só dicts, sets, listas, deques,
heaps... e a lógica delas. É o que a rubrica pontua — e o que o teste-sabotagem
verifica que o endpoint realmente usa.

## O padrão (veja `contadores.py`, o exemplo canônico)

1. A estrutura é uma classe/módulo puro, testável sem servidor.
2. Existe **um singleton de módulo** (uma instância global) que a API usa.
3. No **startup** (lifespan, em `main.py`), o singleton é **reconstruído a
   partir do banco** — memória zera a cada restart, o banco não.
4. Todo **write** relevante da API atualiza o singleton (O(1)), em vez de
   reconstruir tudo (O(n)).
5. O endpoint **importa e usa** o singleton (`from app.core...`).

## Avisos

- `uvicorn --reload` reinicia o processo a cada save → o singleton zera e é
  reconstruído no startup. Se os números "somem", é isso (ver guia 04).
- Honestidade: em produção isso seria um índice/consulta no banco. Aqui o
  objetivo é VOCÊ implementar e medir a estrutura — por isso ela vive em
  memória, reconstruída do banco.
- Reconstruir a estrutura **a cada request** só é aceitável se o Big O
  declarado no DECISIONS.md refletir isso (aí a operação não é O(1), é O(n)).
