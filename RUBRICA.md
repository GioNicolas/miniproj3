# Rubrica — Mini-projeto 3: Rede social de nicho

> Versão 4.1 (painel v2 + verificação de consistência, 2026-07-21). Total: **100 pts + bônus**.
> O catálogo de features está em [CATALOGO.md](CATALOGO.md). O contrato exato (rota, método, request, response) de cada **feature de menu** está em `CONTRATO.md`; o **núcleo** é especificado pelos testes `@skip` do template — os testes são a spec.

## Composição da nota

| Bloco | Regra | Pontos |
|---|---|---|
| **Núcleo** (obrigatório) | 8 features: auth via guia, posts CRUD, feed paginado, perfil, follow, curtidas, comentários planos, seed fake | 25 |
| **Menu intermediário** | fácil 3 / média 5 / difícil 7 pts; **no máximo 3 fáceis pontuam** | cap 40 |
| **Menu avançado** | esforço M (médio) = 8 pts, G (grande) = 10 pts — legenda P/M/G no CATALOGO | cap 25 |
| **Produto** | vídeo demo de ~4 min (7 pts) + **demo day ao vivo** de 3 min (3 pts) | 10 |
| **Bônus** | deploy verificado **+5**; **+1** por feature média/difícil/avançada acima do cap (máx. **+3**); melhor `DECISIONS.md` da turma **+2** | acima de 100 |

**Nota 10 = atingir os caps.** Os "mínimos" de 8 intermediárias e 3 avançadas não são gates do script — são a quantidade que a aritmética exige para a soma alcançar o cap. Pode (e às vezes deve) entregar mais. Nem todo mix fecha:

- **Intermediário** (cap 40): atenção — o catálogo tem **só 1 intermediária difícil** (Comunidades/grupos). Com 8 features, fecham: **8 médias** (40), **1 difícil + 7 médias** (42→40) ou **1 fácil + 1 difícil + 6 médias** (40 exato). **3 fáceis + 5 médias = 34, não fecha** com 8 features — quem fizer fáceis compensa entregando mais (ex.: 3 fáceis + 7 médias = 44→40, com 10 features).
- **Avançado** (cap 25): exige **≥ 1 de esforço G** entre as 3 (3 avançadas M = 24, não fecha).

**Escala de notas parciais** (nota 10 é o teto, não o piso da aprovação):

| Entrega | Nota aproximada |
|---|---|
| Núcleo completo + 5 intermediárias + 1 avançada | ≈ 7 |
| Caps atingidos em todos os blocos | 10 |

## Como a nota é calculada (este pseudocódigo É o script do grader)

```text
# Núcleo: avaliado só pela fórmula do passo 5 (os testes estão no seu repo).
para cada feature de MENU entregue:
  passou no teste oculto?                          senão: vale 0
  sobreviveu à checagem transversal?               senão: vale 0
    (transversal = itens 4 e 5 abaixo: teste-sabotagem + grep 'from app.core'
     + linha válida no DECISIONS.md. Features marcadas "tecnologia extra" no
     catálogo são isentas de core/ e de medição.)
1. RECLASSIFICAÇÃO: avançada sem medição válida (bench_ irreproduzível ou sem a
   frase de interpretação) vira intermediária difícil (7 pts): passa a contar
   no cap 40; sai do cap 25. Não se aplica a "tecnologia extra" (isenta de medição).
2. TESTE AUTORAL: feature de menu sem teste autoral válido (critério: ele fica
   vermelho se a feature for sabotada) → valor × 0,7.
3. DEFESA: feature sorteada → × 1,0 / × 0,5 / × 0 (escala 100/50/0 abaixo).
   Reprovar = × 0 (o degrau 50% NÃO é reprovação). Dono reprovado nas 2
   sorteadas → as 2 continuam valendo 0 e todas as DEMAIS features dele × 0,5.
4. TETO DE FÁCEIS: só as 3 fáceis de maior valor pontuam; as demais valem 0.
5. SOMAS, CAPS E BÔNUS (por último):
   núcleo   = 25 × (testes do núcleo passando ÷ total)
   inter    = min(soma, 40)        avançado = min(soma, 25)
   produto  = max(0, vídeo (0–7) + demo day (0–3) − 2 se o congelamento da
              sexta do MVP estiver ausente ou com commit fora do prazo)
   bônus    = deploy verificado (+5) + 1/feature média-ou-acima além do cap
              (máx +3) + melhor DECISIONS.md da turma (+2, um trio)
   nota     = núcleo + inter + avançado + produto (+ bônus)
```

## Como a correção funciona (leia antes de codar)

1. **Os testes do núcleo são a spec.** O template traz testes `@skip` por feature do núcleo. Ciclo: remova o `@skip` → rode → veja falhar → implemente até passar. **`skipped` conta como não-entregue** — "6 passed, 11 skipped" não é sucesso, é backlog.
2. **Os testes do menu são ocultos e rodam na infra do instrutor.** O grader clona seu repo (somente leitura), roda no repo privado e publica um relatório no seu repo: **PASS/FAIL por feature + 1 mensagem por falha citando a seção do `CONTRATO.md`** ("esperava feed desc por `created_at`, veio asc") — nunca traceback. Cadência: toda noite, mais rodadas extras no checkpoint de auth, na sexta do MVP e na entrega. Você nunca vê o código dos testes; o contrato público é o `CONTRATO.md`. Achou um bug no grader? Vale o que o `CONTRATO.md` diz — reporte por issue (protocolo no README), correção em até ~48h.
3. **Contrato de API congelado.** Rotas, métodos, campos e status das features de menu estão no `CONTRATO.md`; o núcleo está nos testes `@skip`. O nicho do trio vive em conteúdo, seed e UI. Divergir do contrato = teste falha = 0 na feature.
4. **A checagem transversal: a estrutura tem que rodar de verdade.** Toda feature de menu exige a estrutura em `backend/app/core/` como Python puro **e o endpoint usando-a**. O grader (a) roda o teste-sabotagem — troca seu `core/` por uma versão quebrada; o endpoint tem que quebrar junto — e (b) cruza `grep 'from app.core'` com o `DECISIONS.md`. O template traz o exemplo canônico do padrão em `core/contadores.py` — imite-o. Core "de teatro" reprova na transversal e a feature **vale 0**. Exceção nomeada: features marcadas **"tecnologia extra"** no catálogo (ex.: Posts com imagem/upload) não têm estrutura possível — dispensam `core/` e medição; seus gates são o teste oculto e a alteração sob medida na defesa.
5. **`DECISIONS.md` é o índice da correção — e você mesmo o valida.** Tabela por feature: `| Feature | Dono | Módulo em core/ (app.core.<nome>) | Endpoint que usa | Big O | Por quê (1 frase) | Caso autoral (1 frase) |`. Features do **núcleo** entram só com Feature e Dono; as demais colunas valem para features de menu (célula vazia = WIP, ignorada pelo validador). O template traz `tests/test_decisions.py`, que roda em todo `make test` — se passa aí, o grader parseia por construção. Linha inválida numa feature de menu = reprova na transversal e **vale 0**.
6. **Teste autoral.** Cada feature de menu exige ≥ 1 teste do trio (`test_autoral_<feature>.py`) cobrindo um caso que o `CONTRATO.md` **não** especifica (borda, erro, permissão). Critério objetivo: o teste deve ficar **vermelho se a feature for sabotada**; duplicar o caminho feliz do contrato = teste ausente. Pode ser escrito com IA — mas é matéria da defesa ("que caso cobre e por quê? faça-o falhar mexendo no código"). Sem teste válido: × 0,7. Guia 09 ensina do zero, com `test_autoral_exemplo.py` de modelo.
7. **Medição obrigatória nas avançadas.** Números só valem saindo de `scripts/bench_<feature>.py` commitado e rodável via `make bench`, com o output colado no `DECISIONS.md` **+ 1 frase de interpretação** ("a trie só ganha do bisect a partir de ~N porque…"). A receita de 10 linhas está nos mini-guias (`timeit`, N de 1k/10k/100k via faker, média de repetições, medir só a operação). O corretor re-roda por amostragem — conclusão e ordem de grandeza têm que bater. **A estrutura ingênua vencer em N pequeno é resultado válido e valioso: pontua a interpretação, não a vitória.** Sem medição válida: pontua como intermediária difícil (7 pts). Alternativas ingênuas por feature: BFS vs varredura, heap vs ordenar tudo, trie vs bisect, árvore vs lista plana, DMs = dict de conversas vs varredura linear da tabela de mensagens. Upload é "tecnologia extra": isento.

## Trabalho em equipe (verificado por script)

- Cada feature tem **dono nomeado** no `DECISIONS.md` desde o dia 2, e **cada membro é dono de ≥ 1 feature de MENU de esforço M ou G** (piso estrutural — o `test_decisions.py` checa, com o mapa feature→esforço do catálogo embutido).
- **Processo**: toda feature pontuada tem **1 issue no GitHub fechada por PR merged** (`Closes #N`) do seu dono. Verificado por script; **não entra na fórmula da nota** — feature sem issue fechada gera alerta e vira **direcionador da defesa** (alteração mais difícil, 2ª sorteada antecipada). Board/colunas são livres e não pontuam.
- Por membro: **≥ 5 commits não triviais** e **≥ 2 PRs merged com review aprovado de colega**. Também **direcionam a defesa** em vez de dar nota: padrão suspeito (rajada na véspera, commits só de README) → alteração mais difícil e 2ª sorteada antecipada. Trios em risco recebem aviso na metade da semana 1.

## Defesa oral com modificação ao vivo

O gate central da nota individual. **Sorteia-se 1 feature por membro** (2ª apenas se reprovar na 1ª, ou antecipada por padrão git suspeito), **priorizando intermediárias e avançadas** — fácil só se não houver alternativa. Para a feature sorteada, o dono:

- Recebe uma **alteração instanciada na hora** a partir dos arquétipos publicados em `docs/defesa.md` do template desde o dia 1 ("inverta a ordenação de `{campo}`", "mude o limite para `{N}`", "inverta a regra de permissão"…) — só a instância com `{campo}`/`{N}` é sorteada na hora. Alterações calibradas: 1 função/1 arquivo, verificável com 1 curl/teste, gabarito de ≤ 5 min. Features de estrutura avançada (grafo, árvore, heap, trie e afins) recebem ≥ 1 alteração **inviável sem a estrutura**; as 6 avançadas têm alterações sob medida.
- **Escala 100/50/0**: alterou e a verificação passa = 100%; apontou o arquivo/função corretos **e** descreveu a mudança certa, mas não terminou no tempo = 50%; não soube onde mexer = 0. **Reprovar = 0** (o degrau 50% não é reprovação). Quem só colou código não sabe nem apontar o arquivo.
- Defende também o **teste autoral** da feature (que caso cobre? faça-o falhar) e, em avançada, responde uma **pergunta de previsão** antes de rodar o bench ("dobro o N — o que acontece com cada lado?").
- **Sem IA, operacionalmente**: editor sem assistentes de IA (`code --disable-extensions`, conferido em 30 s), terminal limpo, navegador só em localhost/Swagger/`CONTRATO.md`. Autocomplete padrão e LSP podem.
- **Anti-carona em escada**: reprovou na sorteada → ela zera e sorteia-se uma 2ª do mesmo dono; reprovou as duas → as 2 permanecem em 0 e **as demais features do dono caem para 50%**. Um branco de nervosismo continua barato; padrão não é nervosismo.
- Logística: 2 bancas em paralelo × 2 tardes, slot de 40 min por trio, máquina preparada e `git reset` entre membros. Ensaio de 5 min por trio na sexta do MVP.

## Política de IA

IA **permitida com disclosure**: seção "Uso de IA" no `DECISIONS.md`. A contrapartida é dupla: a **defesa com modificação ao vivo** (sem IA) e os **testes ocultos**. Use IA à vontade para escrever — mas o que você entrega tem que passar num teste que você nunca viu, e você tem que saber mexer no código na frente do avaliador. Código que ninguém do trio domina não pontua, gerado por IA ou não.

## Cronograma e rituais

| Quando | O quê |
|---|---|
| Dia 1–2 | Nicho, ER, esqueleto rodando (`make check` verde), donos no `DECISIONS.md`, issues das features criadas. **Ninguém espera a auth**: o Passo 0 do guia 01 (bypass de desenvolvimento) destrava posts/feed/curtidas em paralelo |
| **Dia 3** | **Checkpoint de auth (backend puro)**: testes de auth do núcleo passando + login funcionando via Swagger; quem não passou é destravado presencialmente |
| Dia 4 | Publicada a **break-glass** — branch de resgate do instrutor com `deps.py` + rotas de auth + páginas de login/registro. Mergear = os testes de auth contam como **não passando** na fórmula do núcleo (valor exato publicado com o template); o resto do núcleo fica intacto |
| **Sexta (fim da semana 1)** | **Sexta do MVP**: seção "Congelamento" no `DECISIONS.md` (~5 linhas: o que corta e por quê; commit até a data, senão −2 de produto) + 2 min de apresentação + ensaio de defesa (5 min/trio). **Cadastro→login na UI** é critério daqui |
| **Quarta (semana 2)** | **Quarta do deploy**: plantão de monitor para quem quiser o bônus +5 (guia 08 tem a receita única) |
| Semana 2 | Menu + polish + vídeo |
| **Defesas (2 bancas × 2 tardes)** | O **demo day** (3 min de pitch ao vivo + 1 pergunta da banca, 3 pts) abre a 1ª tarde; as defesas seguem nas duas tardes |

## Produto: vídeo + demo day (10 pts)

- **Vídeo (~4 min, 7 pts)**, roteiro fixo: fluxo contínuo cadastro → login → post → follow → feed; **até 2 avançadas** em destaque (não tem 2? mostre as 2 features mais fortes do trio — o item do checklist conta igual); e 1 item nomeando **o que ficou de fora no congelamento e por quê**. Corrigido por checklist binário de 6 itens: **nota do vídeo = 7 × (itens ✓ ÷ 6), arredondada para a 0,5 mais próxima**. Demo day: 3 itens de 1 pt cada.
- **Demo day (3 min ao vivo + 1 pergunta, 3 pts)**: o pitch do nicho (problema → para quem → solução) sai da sua boca, não do vídeo — hackathon não aceita regravação. Mesmo checklist da banca.
- Deploy público (+5): o avaliador abre a URL na defesa e percorre o fluxo do vídeo (cadastro → login → post → follow → feed). Gravar o vídeo contra a URL pública é recomendado, não obrigatório.

A nota de **features** vem 100% do grader + defesa — a demo avalia produto, não substitui teste.
