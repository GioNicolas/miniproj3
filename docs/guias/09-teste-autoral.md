# Guia 09: teste autoral

Cada feature de menu exige pelo menos um teste escrito pelo time
(`test_autoral_<feature>.py`), cobrindo um caso que o `CONTRATO.md` não
especifica. Sem ele, a feature vale ×0,7 (ver `RUBRICA.md`). Este guia serve
para quem nunca escreveu um teste.

## Arrange, act, assert

Todo teste tem três partes. Vejam o modelo que já vem no repo,
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

Ele testa a paginação além do fim da lista. O contrato do slice diz o que
`GET /usuarios` devolve, mas não diz o que acontece com `offset=50` quando só
existe 1 usuário. Esse é um caso autoral: uma borda que o contrato deixou em
aberto e que vocês decidiram que não pode dar erro.

## Três perguntas

Olhem para a feature e perguntem:

1. E se vier duplicado ou vazio? (segunda curtida no mesmo post, hashtag
   repetida no mesmo texto, texto de 0 caracteres)
2. E sem permissão? (marcar como lida a notificação de outro usuário, votar
   duas vezes na enquete, ver bookmark alheio)
3. E além do limite? (11º item do "últimos 10 visitantes", post nº N+1 do
   rate limit, offset além do total)

Qualquer uma rende um teste autoral. Escolham a que tem mais chance de quebrar.

## Fixtures disponíveis

O `tests/conftest.py` já traz:

- `client`: API com banco zerado a cada teste. Peçam como argumento.
- `logar`: cria um usuário logado (depende da auth do guia 01):

```python
def test_autoral_nao_marco_notificacao_dos_outros(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    # ... ana tenta mexer no que é da bia; espere 403/404
```

Para rodar só os autorais: `uv run pytest -q -k autoral`.

## Critério de validade

**O teste precisa falhar quando a feature é sabotada.** A rubrica confere isso.

Verifiquem assim:

1. Quebrem a feature de propósito, em uma linha: invertam o if da permissão ou
   removam a checagem de duplicata.
2. Rodem `uv run pytest -q -k autoral`. O teste tem que falhar.
3. Desfaçam com `git checkout <arquivo>`. O teste volta a passar.

Se o teste continuou verde com a feature quebrada, ele não testa nada e conta
como ausente.

Copiar o caminho feliz do `CONTRATO.md` ("crio bookmark, recebo 201") também
conta como teste ausente. O corretor já testa o contrato; o autoral cobre o
que o contrato não diz.

Podem escrever o teste com IA, mas ele cai na defesa. O dono da feature tem
que responder na hora: que caso o teste cobre, por que o contrato não cobre, e
mostrar o teste falhando. Quem não sabe responder não escreveu o teste.
