# Defesa oral — arquétipos de alteração

Na defesa, cada membro recebe **uma alteração sorteada da sua feature** e a
implementa ao vivo, **sem IA**, em ~10 minutos (RUBRICA: escala 100/50/0).
As alterações saem dos arquétipos abaixo — os `{parâmetros}` são sorteados **na
hora**, então a pergunta literal não existe antes da banca. Treinar estes
arquétipos com o seu próprio código é exatamente o estudo que a defesa quer
provocar. Vá em frente.

## Os arquétipos

1. **Inverta a ordenação** de `{campo}` na listagem `{rota}` (ex.: feed do mais
   antigo primeiro; salvos por ordem alfabética do autor).
2. **Mude o limite** de `{N}` para `{M}` (rate limit, capacidade do LRU, top-k,
   maxlen dos visitantes, tamanho de página).
3. **Inverta ou restrinja a permissão**: `{ação}` passa a ser permitida só para
   `{papel}` (ex.: comentar só quem segue o autor; denunciar só quem não é o autor).
4. **Adicione um campo derivado da estrutura** na resposta de `{rota}` (ex.:
   `posicao_no_ranking` no top-k; `tamanho_da_fila` no GET de pedidos) — derivado
   do `core/`, não de uma query nova.
5. **Adicione um filtro**: `{listagem}` só devolve itens com `{condição}` (ex.:
   trending ignora a tag `{x}`; busca ignora palavras de 1 letra).
6. **Troque o critério de desempate** de `{rota}` para `{campo}`.
7. **Mostre no código** onde a estrutura do `core/` é **atualizada num write** e
   diga o que quebra se essa linha sumir (e prove: comente-a, rode o teste).
8. **Faça seu teste autoral falhar**: sabote a própria feature, rode o teste,
   explique por que ficou vermelho, desfaça.
9. **(Avançadas) Preveja antes de rodar**: "dobrando o N, o que acontece com o
   tempo da sua estrutura e com o da versão ingênua?" — depois rode o
   `make bench` e compare com a sua previsão.
10. **(Features de estrutura avançada) Alteração estrutural**: uma mudança
    inviável sem a estrutura de verdade (ex.: no autocomplete, devolva também
    QUANTAS palavras existem sob o prefixo — trivial na trie, caro sem ela;
    no BFS, devolva o caminho, não só a distância).

## As regras da banca

- Sorteia-se **1 feature por membro** (prioridade para intermediárias e
  avançadas), e o arquétipo + parâmetros na hora.
- Alterações calibradas: 1 função / 1 arquivo, verificável com 1 curl ou 1
  teste, gabarito de ≤ 5 min.
- **Sem IA**: editor sem assistentes (`code --disable-extensions`), terminal
  limpo, navegador só em localhost / Swagger / CONTRATO.md. Autocomplete padrão
  e LSP podem.
- 100% = alterou e a verificação passa; 50% = apontou arquivo/função certos e
  descreveu a mudança correta, mas não terminou; 0% = não soube onde mexer.
- Reprovou (0%) → sorteia-se uma 2ª feature sua; reprovou as duas → as demais
  features suas caem para 50% (RUBRICA).
