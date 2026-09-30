# Checklist de aceitação

Data: 29/09/2026  
Aplicação: https://oauth-pages-lab-ec6.pages.dev/  
Repositório: https://github.com/Beatrys-lira/oauth-pages-lab

Revisão da estrutura publicada no commit `d09c840`. Checklist preenchido com base no código, nas evidências e nas confirmações dos testes manuais.

- [x] O site utiliza o endereço pages.dev do projeto.
- [x] Os arquivos estáticos e as Functions compartilham a mesma origem.
- [x] A publicação utiliza a integração com GitHub.
- [x] Não foram instalados nem executados Node.js, npm, npx ou Wrangler no computador da estudante durante a atividade.
- [x] Google e GitHub possuem URLs de retorno próprias e exatas.
- [x] Os pedidos de autorização usam código e PKCE S256.
- [x] Client Secrets permanecem no servidor. O GitHub também utiliza o segredo para autenticar a revogação.
- [x] O callback verifica presença, validade, provedor e state antes de trocar o código. Transações consumidas são recusadas. A expiração de transação foi conferida no código; os demais casos estão registrados no arquivo 07.
- [x] O id_token do Google passa por validação criptográfica e semântica antes da criação da sessão.
- [x] O access_token GitHub é usado na consulta de /user e enviado à revogação. A criação da sessão exige confirmação HTTP 204 da revogação.
- [x] O cookie de sessão é opaco, Secure, HttpOnly, SameSite=Strict, Path=/ e sem atributo Domain.
- [x] O D1 armazena o resumo SHA-256 do cookie de sessão.
- [x] /api/me retorna o perfil local sem tokens ou cookies.
- [x] O logout valida Origin, remove a sessão e expira o cookie.
- [x] O cookie restaurado após o logout não recuperou a sessão no teste manual.
- [x] A conferência de credenciais no histórico Git, registros e armazenamento do navegador foi confirmada pela estudante. Não foi realizada auditoria automatizada completa desses locais.
- [x] A estudante confirmou que consegue explicar por que os arquivos estáticos permanecem públicos.
- [x] O encerramento de sessões administrativas no computador compartilhado, quando aplicável, foi confirmado.
- [x] A remoção da cópia temporária do cookie e o fechamento da janela privativa foram confirmados.
- [x] Os Client Secrets permanecem criptografados no painel, conforme confirmação da estudante.
- [x] Os logins Google e GitHub foram confirmados após a reorganização das Functions.

## Validação complementar

A correção de revogação passou por oito cenários simulados, incluindo sucesso 204, falhas HTTP, falha de rede e falha na consulta de perfil. A separação das Functions passou por dez grupos de testes envolvendo os dois provedores, PKCE, callbacks, sessões, expiração, logout e rejeição de reutilização.

Os testes simulados usaram Node.js em ambiente separado do computador da estudante. Os resultados manuais estão no arquivo 07. O deploy da reorganização foi concluído pelo Cloudflare Pages.

## Configuração

- Binding D1: `DB`.
- Variáveis: `PUBLIC_BASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`.
- URL base: `https://oauth-pages-lab-ec6.pages.dev`.
- Callback Google: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/google`.
- Callback GitHub: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/github`.

## Identificação e assinatura

- Nome da estudante: Beatrys Belo
- RA: 2026108406
- Participação: atividade realizada em dupla; este site e esta entrega pertencem a Beatrys Belo.
- Integrante da dupla: Pedro Alexandre Zanetti
- RA do integrante: 2026108365
- Assinatura de Pedro Alexandre Zanetti: Pedro Zanetti
- Responsável pela rotação dos Client Secrets: Beatrys Belo
- Data: 29/09/2026
- Assinatura digitada: Beatrys Belo

