# Testes de autenticação

Data: 29/09/2026  
Aplicação: https://oauth-pages-lab-ec6.pages.dev/

Testes manuais realizados no Chrome. Os registros indicam quando o resultado foi informado durante a execução e quando há captura de tela.

## 1. Retorno sem cookie temporário

- **Preparação:** iniciar o login GitHub em uma janela comum e abrir a URL de autorização em uma janela anônima nova.
- **Requisição:** retorno para `/oauth/callback/github` sem o cookie `__Host-oauth-tx`.
- **Esperado:** recusar a autenticação e não criar sessão.
- **Resultado:** mensagem “Autenticação cancelada ou transação inválida” e `{"authenticated":false}` na consulta seguinte.
- **Registro:** resultado manual informado. O status HTTP do callback não foi registrado.

## 2. State alterado

- **Preparação:** iniciar um novo login Google e alterar um caractere do parâmetro `state` antes da autorização.
- **Requisição:** retorno para `/oauth/callback/google` com o valor alterado.
- **Esperado:** recusar o retorno antes de trocar o código e não criar sessão.
- **Resultado:** “Transação expirada ou inválida” e `{"authenticated":false}`.
- **Registro:** capturas da mensagem e da consulta de sessão. A mesma mensagem também é usada para transações expiradas; o procedimento de alteração foi informado na execução. No código, a comparação de state ocorre antes da troca do código.

## 3. Reutilização da transação

- **Preparação:** concluir o login Google e copiar a URL do callback no Network.
- **Requisição:** abrir novamente a mesma URL na mesma janela.
- **Esperado:** recusar a transação consumida, sem criar outra sessão.
- **Resultado:** “Transação expirada ou inválida”.
- **Registro:** resultado manual informado. Não foi feita contagem de sessões no D1; a ausência de nova inserção é sustentada pelo fluxo do código. A sessão do primeiro login pode continuar ativa.

## 4. Sessão expirada

- **Preparação:** com uma sessão ativa, executar no console D1:
  ```sql
  UPDATE sessions SET expires_at = 0;
  ```
- **Requisição:** `GET /api/me` na mesma janela.
- **Esperado:** HTTP 401.
- **Resultado:** `{"authenticated":false}` e status 401 na requisição `me`.
- **Registro:** JSON e status informados durante o teste. A execução SQL não foi capturada.

## 5. Origem inválida no logout

- **Preparação:** manter uma sessão ativa e abrir `https://example.com` em outra aba da mesma janela.
- **Requisição:** `POST /oauth/logout` a partir de example.com, com `credentials: "include"`.
- **Esperado:** HTTP 403 e sessão original preservada.
- **Resultado:** o Console mostrou 403 (Forbidden), acompanhado de erro CORS. Depois, `/api/me` retornou `authenticated:true`.
- **Registro:** erro do Console e resposta da API transcritos. O erro CORS sozinho não comprovaria a validação de Origin. SameSite também pode impedir o envio do cookie entre sites.

## 6. Reutilização do cookie revogado

- **Preparação:** guardar temporariamente o cookie de uma sessão própria, sair e restaurar o mesmo valor sem realizar novo login.
- **Requisição:** `GET /api/me` após restaurar o cookie.
- **Esperado:** HTTP 401 e `authenticated:false`.
- **Resultado:** `{"authenticated":false}` e status 401.
- **Registro:** captura do cookie restaurado com Secure, HttpOnly, Path=/ e SameSite=Strict; resposta JSON e captura de `me` com 401. A reutilização do mesmo valor depende do procedimento manual; o valor não é reproduzido.
- **Limpeza:** remoção da cópia temporária e fechamento da janela privativa confirmados.

## Login e logout

Os logins Google e GitHub e o logout funcionaram nos testes manuais. Após a separação das Functions em módulos e rotas, os dois logins foram testados novamente e confirmados em 29/09/2026.

## Evidências

Os arquivos 05 e 06 contêm os cabeçalhos transcritos e os prints do início dos logins. Cookies, códigos, tokens, segredos e valores transitórios não são incluídos neste registro.
