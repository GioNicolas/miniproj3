# Guia 03 — Boas práticas (1 página)

Seis hábitos que separam um repo que dá gosto de corrigir de um que vira dívida.

1. **Nomes em português, consistentes.** O contrato já é assim (`/usuarios`,
   `texto`, `curtidas`) — siga o padrão nos seus módulos, schemas e variáveis.
   Não misture `post_text` com `texto_do_post`.

2. **Router fino, service com a lógica, core/ puro.** O router traduz HTTP ↔
   Python e nada mais; a regra de negócio mora no service; a estrutura de
   dados mora em `core/` sem saber que a web existe. É o desenho do slice de
   exemplo — imite.

3. **Commit pequeno, mensagem com porquê.** "curtir post: endpoint idempotente"
   conta uma história; "ajustes" não. Se a mensagem precisa de "e também...",
   eram dois commits.

4. **Código morto não sobe.** Bloco comentado, `print()` de debug, função que
   ninguém chama: apague antes do PR. O git guarda o histórico por você.

5. **Traceback lê de baixo para cima.** A última linha é O QUE quebrou
   (`IntegrityError: UNIQUE constraint failed`); subindo, a primeira linha que
   cita um arquivo **seu** é ONDE. O meio é caminho de framework — ignore na
   primeira passada. Erro conhecido? Guia 04 antes de chamar monitor.

6. **`make test` antes de todo PR.** Verde local = review do colega gasta
   tempo com a lógica, não com o óbvio. E `skipped` é backlog, não sucesso.
