# Checklist de aceitação

Aplicação: https://oauth-pages-lab-ec6.pages.dev
Repositório: Beatrys-lira/oauth-pages-lab
Revisão: 29/09/2026, baseada no código de autenticação corrigido no commit af79a535c4416cc21de7afec36e2e9d38600ed2c, nos arquivos 01–07 e nos testes manuais relatados.

**Situação: checklist concluído com base na revisão técnica, testes registrados e confirmações finais da estudante em 29/09/2026.**
Marcas [x] indicam suporte nas evidências ou no código, conforme a observação. Marcas [ ] exigem confirmação ou correção. Assinaturas digitadas registradas no arquivo e confirmadas na conversa; confirmações pessoais estão identificadas.

- [x] A aplicação usa pages.dev, com arquivos estáticos e Functions na mesma origem.
- [x] Publicação por integração com GitHub, conforme registro de configuração.
- [x] A estudante confirmou que não instalou nem executou Node.js, npm, npx ou Wrangler durante a atividade.
- [x] Cada provedor possui callback próprio e exato, registrado nos arquivos 02 e 03.
- [x] Os pedidos de autorização usam response_type=code e PKCE S256, conforme código e evidências 05–06.
- [x] Client Secrets são obtidos do ambiente e utilizados no servidor, sem literais no middleware revisado. O GitHub também exige autenticação do aplicativo na revogação.
- [x] O callback valida presença, prazo, provedor e state da transação antes de trocar o código; remove a transação antes de criar sessão. Os testes manuais de ausência, alteração e reutilização estão no arquivo 07. Expiração de transação foi verificada no código, não em um teste isolado com controle de tempo.
- [x] A identidade Google é validada criptograficamente com RS256 e chave pública; há verificações de emissor, audiência, nonce, expiração, emissão, subject e email verificado antes da sessão.
- [x] O GitHub consulta /user e exige HTTP 204 na revogação de /applications/{client_id}/grant antes de criar sessão. Falhas HTTP ou de rede interrompem o login.
- [x] A estudante confirmou o login GitHub no site após a correção de revogação do commit af79a53.
- [x] O cookie de sessão gerado é opaco, Secure, HttpOnly, SameSite=Strict, Path=/ e sem atributo Domain.
- [x] O D1 armazena o resumo SHA-256 do cookie de sessão, não seu valor bruto, conforme código.
- [x] /api/me retorna o perfil local (id, nome, email, provedor, id no provedor e criação), sem tokens ou cookies.
- [x] Logout valida Origin antes de excluir a sessão e expirar o cookie; tentativa de outra origem recebeu 403 e preservou a sessão no teste manual.
- [x] O teste guiado com cookie restaurado após logout retornou authenticated:false e 401, com os limites de evidência descritos em 07.
- [x] A estudante confirmou a conferência de credenciais no histórico Git, registros e armazenamento do navegador. Confirmação manual da estudante; não se trata de auditoria independente da assistência.
- [x] A estudante confirmou que consegue explicar por que os arquivos estáticos permanecem públicos.
- [x] Encerramento das sessões administrativas no computador compartilhado, quando aplicável, confirmado pela estudante.
- [x] Remoção da cópia temporária do cookie e fechamento da janela privativa confirmados pela estudante.
- [x] A estudante confirmou que os Client Secrets permanecem criptografados no painel; responsável pela rotação identificado abaixo.

## Validação técnica da correção

Oito cenários com respostas simuladas passaram: revogação 204; rejeições 400, 401, 403, 404 e 500; falha de rede; falha na consulta do perfil com tentativa de revogação preservada. Em caso de revogação não confirmada, githubIdentity() rejeita e o callback não prossegue à criação da sessão.

Esses testes foram executados no ambiente da assistência com Node.js, sem instalação ou execução no computador da estudante. Não substituem a confirmação de um novo login real após o deploy.

Os seis testes manuais anteriores e seus limites de evidência estão documentados em 07-testes-falha.md. Google, GitHub e logout tiveram sucesso relatado antes desta última correção.

## Callbacks
- Google: https://oauth-pages-lab-ec6.pages.dev/oauth/callback/google
- GitHub: https://oauth-pages-lab-ec6.pages.dev/oauth/callback/github

## Configuração utilizada
- Binding D1: DB.
- Variáveis: PUBLIC_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
- PUBLIC_BASE_URL: https://oauth-pages-lab-ec6.pages.dev
- Valores de credenciais omitidos.

## Explicação para apresentação
HTML, CSS e JavaScript são arquivos públicos entregues ao navegador. A proteção dos dados depende das Functions: /api/me só entrega o perfil se o cookie corresponder a uma sessão válida e não expirada no D1. Ocultar o dashboard ou redirecionar a página não substitui essa validação no servidor.

## Confirmações pessoais

Os itens pessoais marcados acima foram confirmados pela estudante em 29/09/2026. A estudante também confirmou as verificações finais e o login GitHub após a correção. Essas confirmações não constituem auditoria independente da assistência.

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

