# Guia 02 — Git em equipe (receitas, não teoria)

Regras da rubrica que este guia te ajuda a cumprir sem drama: **≥5 commits não
triviais por membro**, **≥2 PRs merged com review de colega por membro**, e
**toda feature pontuada tem 1 issue fechada pelo PR** (`Closes #N`). Isso é
verificado por script — e padrão suspeito (rajada de commits na véspera,
commits só de README) não tira ponto direto: **direciona a defesa** para cima
de você, com alteração mais difícil. Commite de verdade, todo dia.

## O fluxo diário (decore isto)

```bash
# 1. comece o dia atualizado
git checkout main && git pull

# 2. uma branch por feature (a MESMA feature da sua issue)
git checkout -b feat/curtidas

# 3. trabalhe, commite pequeno e com porquê
git add backend/app/routers/curtidas.py
git commit -m "curtir post: endpoint idempotente (2º like não duplica)"

# 4. suba e abra o PR
git push -u origin feat/curtidas
```

No PR (pela interface do GitHub): descrição curta + **`Closes #12`** (o número
da issue da feature — sem isso a feature não conta o critério de processo).
Peça review de um colega do trio; ele comenta/aprova; **quem aprova não é quem
escreveu**. Merge pelo botão, apague a branch.

## "Meu PR deu conflito em main.py" — a receita exata

Vai acontecer, porque todo mundo registra router em `main.py`. Sem pânico —
são 5 comandos:

```bash
git checkout main && git pull
git checkout feat/curtidas
git merge main
# → Auto-merging backend/app/main.py
#   CONFLICT (content): Merge conflict in backend/app/main.py
#   Automatic merge failed; fix conflicts and then commit the result.
```

Abra `backend/app/main.py`. O conflito tem esta cara:

```python
<<<<<<< HEAD
app.include_router(curtidas.router)
=======
app.include_router(posts.router)
>>>>>>> main
```

A resolução aqui é sempre a mesma: **as duas linhas ficam** (e os dois
imports). Apague só os marcadores `<<<<<<<`, `=======`, `>>>>>>>`:

```python
app.include_router(posts.router)
app.include_router(curtidas.router)
```

Termine:

```bash
git add backend/app/main.py
git commit          # aceita a mensagem padrão de merge
git push
# → o PR atualiza sozinho, sem conflito
```

É por isso que o template é **1 arquivo por router e 1 por model**: o único
ponto de colisão vira uma linha de `include_router` — conflito de 10 segundos.
Se dois membros editam o MESMO arquivo de router, o conflito é dentro da
lógica — aí é sentar junto e resolver linha a linha (e repensar a divisão de
donos).

## "Commitei o app.db" (ou outro arquivo que não devia)

O `.gitignore` do template já bloqueia `*.db` — se o `git status` mostra
`app.db`, alguém mexeu no `.gitignore` ou forçou com `-f`. Conserto:

```bash
git rm --cached backend/app.db
# → rm 'backend/app.db'        (sai do git, MAS continua no seu disco)
git commit -m "remove app.db do versionamento (banco é local)"
git push
```

Confira que a linha `*.db` existe no `.gitignore`. Binário no git = conflito
irresolvível esperando para acontecer; o banco de cada um é local e
reconstruível com `make seed`.

## O que conta como "commit não trivial"

Commit que muda comportamento ou testes — não `fix typo`, não reindentação,
não "atualiza README" em série. O script do corretor usa
`git shortlog -sn --no-merges` e o histórico real; três commits gigantes na
sexta contam menos a seu favor do que dez pequenos ao longo da semana — e
lembre: padrão estranho = defesa mais difícil para o dono.
