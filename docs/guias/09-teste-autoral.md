# Guia 09 — Escrevendo seu teste autoral

Cada feature de menu exige ≥1 teste escrito pelo trio (`test_autoral_<feature>.py`),
cobrindo um caso que o `CONTRATO.md` **não** especifica. Sem ele, a feature
pontua ×0,7 (ver `RUBRICA.md`). Você nunca escreveu um teste? Este guia resolve.

## A anatomia: arrange → act → assert

Todo teste tem 3 momentos. Disseque o modelo que já vem no repo,
`tests/test_autoral_exemplo.py`:

```python
def test_autoral_offset_alem_do_total_devolve_vazio_e_nao_erro(client):
    # ARRANGE: monte o cenário (pela API, nunca direto no banco)
    client.post("/usuarios", json={"username": "ana", "name": "Ana"})

    # ACT: a UMA ação que está sendo testada
    r = client.get("/usuarios?offset=50&limit=10")

    # ASSERT: o que TEM que ser verdade
    assert r.status_code == 200
    assert r.json()["items"] == []
    assert r.json()["total"] == 1
```

Repare no que ele testa: paginar **além do fim** da lista. O contrato do slice
diz o que `GET /usuarios` devolve — mas não diz o que acontece com
`offset=50` quando só existe 1 usuário. *Isso* é um caso autoral: a borda que
o contrato deixou em aberto, e que você decidiu que não pode explodir.

## A receita das 3 perguntas

Olhe para a sua feature e pergunte:

1. **E se vier duplicado ou vazio?** (segunda curtida no mesmo post, hashtag
   repetida no mesmo texto, texto de 0 caracteres...)
2. **E sem permissão?** (marcar como lida a notificação de OUTRO usuário?
   votar duas vezes na enquete? ver bookmark alheio?)
3. **E além do limite?** (11º item do "últimos 10 visitantes", post nº N+1 do
   rate limit, offset além do total...)

Qualquer uma das três rende um teste autoral honesto. Escolha a mais provável
de quebrar de verdade.

## As fixtures que você já tem

O `tests/conftest.py` te dá tudo:

- **`client`** — API com banco zerado por teste. Peça como argumento e use.
- **`logar`** — fábrica de usuário logado (depende da sua auth do guia 01):

```python
def test_autoral_nao_marco_notificacao_dos_outros(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    # ... ana tenta mexer no que é da bia; espere 403/404
```

Rode só o seu: `uv run pytest -q -k autoral`.

## O critério de validade (a rubrica confere ISTO)

> O teste deve ficar **vermelho se a feature for sabotada**.

Verifique você mesmo, agora:

1. Quebre a sua feature de propósito (inverta o if da permissão, remova a
   checagem de duplicata — uma linha).
2. `uv run pytest -q -k autoral` → tem que **FALHAR**.
3. Desfaça (`git checkout <arquivo>`). → volta a passar.

Se o teste continuou verde com a feature quebrada, ele não testa nada — vale
como ausente.

**Outra armadilha**: copiar o caminho feliz do `CONTRATO.md` ("crio bookmark,
recebo 201") = teste ausente. O grader já testa o contrato; o autoral cobre o
que o contrato **não** diz.

**Sobre IA**: pode escrever o teste com IA — mas ele é matéria da defesa. O
dono da feature responde na hora: *que caso esse teste cobre, por que o
contrato não cobre, e me mostre ele falhando.* Se você não sabe responder, o
teste não é seu.
