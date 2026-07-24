# Guia 05 — JWT (opcional, leitura de 2 minutos)

**Você não precisa disto para o projeto.** A auth do guia 01 (token opaco em
tabela) é auth de verdade e vale todos os pontos. JWT aqui não vale ponto extra
— este stub existe só para matar a curiosidade.

**O que é**: JWT (JSON Web Token) é um token que carrega os próprios dados
(user_id, validade...) assinados criptograficamente. O servidor não guarda nada:
ele **verifica a assinatura** em vez de consultar a tabela `sessions`.

**Trade-off em uma linha**: JWT é *stateless* (escala sem banco de sessões),
mas o seu token em tabela é *revogável* (logout/ban = deletar a linha; um JWT
emitido vale até expirar, goste você ou não).

**Quando migrar faria sentido**: vários serviços validando o mesmo login sem
compartilhar banco (microsserviços, API pública). Numa rede social de um
backend só — nunca.

**Para estudar depois**: [jwt.io](https://jwt.io) (decodifique um token no
browser) e [PyJWT](https://pyjwt.readthedocs.io/) (a lib Python).
