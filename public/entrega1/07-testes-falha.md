# Testes de falha de autenticação

Status: em andamento. Os seis casos obrigatórios abaixo ainda não foram executados e não estão marcados como aprovados.

Aplicação: https://oauth-pages-lab-ec6.pages.dev

## Verificação complementar: logout

- **Preparação:** a estudante foi orientada a concluir o login com GitHub, entrar no dashboard e clicar em Sair.
- **Pedido enviado:** após a saída, GET /api/me na mesma janela do navegador.
- **Resultado esperado:** HTTP 401 e corpo `{"authenticated":false}`.
- **Resultado observado:** em 29/09/2026, a estudante enviou a resposta `{"authenticated":false}` e uma captura do Chrome DevTools mostrando a requisição `me` com status 401. A consulta após a saída foi confirmada; este registro não comprova os casos de expiração ou reutilização do cookie revogado.

## Caso 1: retorno sem cookie temporário

- **Preparação prevista:** iniciar login em uma janela comum; abrir a URL de autorização em janela privativa sem __Host-oauth-tx e concluir o fluxo nela.
- **Pedido previsto:** retorno do provedor para /oauth/callback/github ou /oauth/callback/google, sem o cookie temporário.
- **Resultado esperado:** rejeitar o retorno sem criar sessão; /api/me deve responder 401.
- **Resultado observado:** pendente de execução.

## Caso 2: state alterado

- **Preparação prevista:** iniciar uma nova transação e alterar um caractere do parâmetro state na URL de autorização antes de prosseguir.
- **Pedido previsto:** retorno do provedor com state diferente do registrado na transação.
- **Resultado esperado:** rejeitar o retorno antes da troca do código, sem criar sessão.
- **Resultado observado:** pendente de execução.

## Caso 3: reutilização da transação

- **Preparação prevista:** concluir um login e localizar a requisição de callback no Network.
- **Pedido previsto:** abrir novamente a mesma URL de callback, sem guardar seu conteúdo na evidência.
- **Resultado esperado:** rejeitar a transação já consumida; não criar nova sessão.
- **Resultado observado:** pendente de execução.

## Caso 4: sessão expirada

- **Preparação prevista:** criar uma sessão de teste e executar no console D1 `UPDATE sessions SET expires_at = 0;`.
- **Pedido previsto:** GET /api/me após a alteração.
- **Resultado esperado:** HTTP 401.
- **Resultado observado:** pendente de execução.

## Caso 5: origem inválida na saída

- **Preparação prevista:** manter uma sessão válida no site e iniciar a tentativa de logout a partir de outra origem.
- **Pedido previsto:** POST /oauth/logout com origem diferente da aplicação.
- **Resultado esperado:** rejeitar a operação e manter a sessão original válida.
- **Resultado observado:** pendente de execução.

## Caso 6: reutilização do cookie revogado

- **Preparação prevista:** conservar temporariamente o cookie de uma sessão exclusiva de teste, executar o logout e restaurar esse mesmo cookie.
- **Pedido previsto:** GET /api/me usando o cookie revogado.
- **Resultado esperado:** HTTP 401, pois a sessão foi removida do D1.
- **Resultado observado:** pendente de execução.

## Tratamento das evidências

Não incluir URLs completas de autorização ou callback com valores transitórios, cookies, códigos, tokens, state, nonce, code_challenge ou segredos. Substituir valores sensíveis por [REMOVIDO].
