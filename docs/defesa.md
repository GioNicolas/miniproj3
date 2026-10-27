# Defesa oral: arquétipos de alteração

Na defesa, cada integrante recebe uma alteração sorteada em uma feature
própria e a implementa ao vivo, sem IA, em ~10 minutos. A nota segue a escala
×1 / ×0,5 / ×0 da `RUBRICA.md`. As alterações saem dos arquétipos abaixo. Os
`{parâmetros}` são sorteados na hora, então a pergunta exata não existe antes
da banca. Para se preparar, pratiquem estes arquétipos no código de vocês.

## Os arquétipos

1. Inverta a ordenação de `{campo}` na listagem `{rota}` (ex.: feed do mais
   antigo primeiro; salvos por ordem alfabética do autor).
2. Mude o limite de `{N}` para `{M}` (rate limit, capacidade do LRU, top-k,
   maxlen dos visitantes, tamanho de página).
3. Inverta ou restrinja a permissão: `{ação}` passa a ser permitida só para
   `{papel}` (ex.: comentar só quem segue o autor; denunciar só quem não é o autor).
4. Adicione um campo derivado da estrutura na resposta de `{rota}` (ex.:
   `posicao_no_ranking` no top-k; `tamanho_da_fila` no GET de pedidos). O valor
   vem do `core/`, não de uma query nova.
5. Adicione um filtro: `{listagem}` só devolve itens com `{condição}` (ex.:
   trending ignora a tag `{x}`; busca ignora palavras de 1 letra).
6. Troque o critério de desempate de `{rota}` para `{campo}`.
7. Mostre no código onde a estrutura do `core/` é atualizada num write e diga
   o que quebra se essa linha sumir. Provem comentando a linha e rodando o
   teste.
8. Faça seu teste autoral falhar: sabote a própria feature, rode o teste,
   explique por que falhou e desfaça.
9. (Avançadas) Preveja antes de rodar: "dobrando o N, o que acontece com o
   tempo da sua estrutura e com o da versão ingênua?". Depois rode o
   `make bench` e compare com a previsão.
10. (Features de estrutura avançada) Alteração estrutural: uma mudança
    inviável sem a estrutura de verdade (ex.: no autocomplete, devolva também
    quantas palavras existem sob o prefixo, o que é trivial na trie e caro sem
    ela; no BFS, devolva o caminho, não só a distância).

## Regras da banca

- A banca sorteia 1 feature por integrante, com prioridade para intermediárias
  e avançadas, e sorteia o arquétipo e os parâmetros na hora.
- Cada alteração cabe em 1 função ou 1 arquivo, é verificável com 1 curl ou 1
  teste e tem gabarito de até 5 minutos.
- Sem IA: editor sem assistentes (`code --disable-extensions`), terminal
  limpo, navegador só em localhost, Swagger e documentação do projeto.
  Autocomplete padrão e LSP são permitidos.
- ×1: alterou e a verificação passa. ×0,5: achou o arquivo e a função certos e
  explicou a mudança, mas não terminou. ×0: não soube onde nem como alterar.
- **Quem tira 0 defende uma segunda feature. Se tirar 0 de novo, as duas
  features sorteadas valem 0 e as outras features desse integrante caem para
  50%.**
