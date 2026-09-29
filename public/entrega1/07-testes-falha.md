# Testes de falha de autenticação

Aplicação: https://oauth-pages-lab-ec6.pages.dev
Data: 29/09/2026.
Execução: manual, no Chrome da estudante, com orientação. Os resultados abaixo distinguem capturas examinadas e respostas transcritas pela estudante. Não representam execução automatizada independente.

## 1 — Retorno sem cookie temporário
- **Preparação:** iniciar login com GitHub na janela comum; copiar a autorização para uma janela anônima nova, sem o cookie temporário do projeto.
- **Pedido:** GET /oauth/callback/github após autorizar nessa janela.
- **Esperado:** recusar o retorno e não criar sessão.
- **Observado:** a estudante relatou “Autenticação cancelada ou transação inválida”. A continuação da conversa registrou a verificação de authenticated:false na janela anônima.
- **Evidência:** relato da execução e confirmação dos prints na conversa. Status HTTP desse callback não transcrito.

## 2 — State alterado
- **Preparação:** iniciar nova transação Google na mesma janela de teste e alterar um caractere de state no Location do início do login, antes de autorizar.
- **Pedido:** GET /oauth/callback/google com state alterado.
- **Esperado:** recusar antes da troca do código e não criar sessão.
- **Observado:** “Transação expirada ou inválida” e consulta posterior com `{"authenticated":false}`.
- **Evidência:** capturas de 29/09/2026 às 15:39–15:40 examinadas, contendo a mensagem e o JSON. A preparação foi relatada pela estudante; os prints isolados não distinguem alteração de state de expiração. A inspeção do código confirma que a comparação ocorre antes de exchange().

## 3 — Reutilização da transação
- **Preparação:** concluir login Google normalmente e copiar do Network a URL do callback já utilizado.
- **Pedido:** abrir novamente esse callback na mesma janela.
- **Esperado:** recusar a transação consumida, sem criar nova sessão.
- **Observado:** a estudante relatou “Transação expirada ou inválida” após seguir a orientação de reutilização.
- **Evidência:** mensagem transcrita na conversa às 16:06. Não houve contagem de sessões no D1; a rejeição foi observada, e a ausência de uma nova inserção é sustentada pelo fluxo do código. A sessão original pode permanecer ativa.

## 4 — Sessão expirada
- **Preparação orientada:** com login ativo, executar no Console D1 `UPDATE sessions SET expires_at = 0;`. O comando expira todas as sessões do laboratório, sem excluir usuários.
- **Pedido:** GET /api/me na mesma janela.
- **Esperado:** HTTP 401.
- **Observado:** a estudante enviou `{"authenticated":false}` e transcreveu a linha `me | 401`.
- **Evidência:** respostas na conversa às 16:09–16:10. A execução SQL não foi capturada; o registro se baseia na sequência guiada e no resultado informado.

## 5 — Origem inválida no logout
- **Preparação:** manter login ativo no projeto e abrir https://example.com em outra aba da mesma janela.
- **Pedido:** POST https://oauth-pages-lab-ec6.pages.dev/oauth/logout, com Origin https://example.com e credentials:include.
- **Esperado:** HTTP 403 e sessão original preservada.
- **Observado:** Console transcrito pela estudante mostrou POST com 403 (Forbidden), acompanhado de bloqueio CORS. Depois, /api/me retornou authenticated:true.
- **Evidência:** erro transcrito às 18:55 e resposta autenticada às 18:56. Dados pessoais do perfil foram omitidos.
- **Interpretação:** o 403 e a sessão preservada sustentam o resultado. O aviso CORS isoladamente não provaria a validação de Origin. SameSite também pode impedir o envio do cookie entre sites.

## 6 — Reutilização do cookie revogado
- **Preparação:** copiar temporariamente o cookie de uma sessão própria, clicar em Sair e restaurar o mesmo valor no navegador, sem novo login.
- **Pedido:** GET /api/me após restaurar o cookie.
- **Esperado:** HTTP 401 e authenticated:false.
- **Observado:** captura mostrou __Host-session presente com Secure, HttpOnly, Path=/ e SameSite=Strict. A estudante enviou `{"authenticated":false}`; captura posterior mostrou a requisição me com status 401, iniciada por login.js.
- **Evidência:** capturas examinadas às 19:03 e 19:05 e JSON transcrito. A identidade do valor restaurado com o anterior ao logout depende do procedimento relatado; o valor não é reproduzido.
- **Limpeza:** orientada a apagar o cookie restaurado e sua cópia temporária; confirmação pessoal pendente.

## Verificação complementar — Logout normal
Após o logout, /api/me retornou authenticated:false e a captura do Network mostrou 401. Google e GitHub também tiveram login bem-sucedido relatado durante a execução do laboratório.

## Proteção das evidências
Não foram incluídos neste documento cookies, códigos, tokens, segredos, valores de state, nonce, code_challenge ou URLs transitórias completas. Os arquivos 05 e 06 mantêm as transcrições e prints saneados do início dos logins. Este arquivo contém o registro textual dos testes de falha; não incorpora capturas brutas com credenciais.
