# Checklist de aceitação

Aplicação: https://oauth-pages-lab-ec6.pages.dev
Repositório: Beatrys-lira/oauth-pages-lab
Revisão: 29/09/2026, baseada no código do commit 4530399e61b59dec431be1ed29e7a36286f18b41, nos arquivos 01–07 e nos testes manuais relatados.

**Situação: revisão técnica registrada; aceitação final pendente.**
Marcas [x] indicam suporte nas evidências ou no código, conforme a observação. Marcas [ ] exigem confirmação ou correção. Não há assinatura presumida.

- [x] A aplicação usa pages.dev, com arquivos estáticos e Functions na mesma origem.
- [x] Publicação por integração com GitHub, conforme registro de configuração.
- [ ] Confirmar pessoalmente que a equipe não instalou nem executou Node.js, npm, npx ou Wrangler.
- [x] Cada provedor possui callback próprio e exato, registrado nos arquivos 02 e 03.
- [x] Os pedidos de autorização usam response_type=code e PKCE S256, conforme código e evidências 05–06.
- [x] Client Secrets são obtidos do ambiente e utilizados no servidor, sem literais no middleware revisado. O GitHub também exige autenticação do aplicativo na revogação.
- [x] O callback valida presença, prazo, provedor e state da transação antes de trocar o código; remove a transação antes de criar sessão. Os testes manuais de ausência, alteração e reutilização estão no arquivo 07. Expiração de transação foi verificada no código, não em um teste isolado com controle de tempo.
- [x] A identidade Google é validada criptograficamente com RS256 e chave pública; há verificações de emissor, audiência, nonce, expiração, emissão, subject e email verificado antes da sessão.
- [ ] **Pendência técnica:** o GitHub consulta /user e tenta revogar /applications/{client_id}/grant antes da sessão, mas o código não verifica o status da revogação e ignora falhas de rede. Portanto, ainda não garante revogação bem-sucedida antes de criar a sessão.
- [x] O cookie de sessão gerado é opaco, Secure, HttpOnly, SameSite=Strict, Path=/ e sem atributo Domain.
- [x] O D1 armazena o resumo SHA-256 do cookie de sessão, não seu valor bruto, conforme código.
- [x] /api/me retorna o perfil local (id, nome, email, provedor, id no provedor e criação), sem tokens ou cookies.
- [x] Logout valida Origin antes de excluir a sessão e expirar o cookie; tentativa de outra origem recebeu 403 e preservou a sessão no teste manual.
- [x] O teste guiado com cookie restaurado após logout retornou authenticated:false e 401, com os limites de evidência descritos em 07.
- [ ] Confirmar saneamento completo do histórico Git, registros de execução e armazenamento do navegador. A revisão do middleware e destes documentos não equivale a uma auditoria completa desses locais.
- [ ] A estudante confirma que consegue explicar por que os arquivos estáticos permanecem públicos.
- [ ] Confirmar encerramento das sessões administrativas de Google, GitHub e Cloudflare no computador compartilhado, quando aplicável.
- [ ] Confirmar remoção da cópia temporária do cookie e fechamento da janela privativa.
- [ ] Confirmar no painel que Client Secrets continuam criptografados e definir responsável pela rotação.

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

## Aceite e assinatura
Preencher após resolver a pendência técnica e conferir as declarações pessoais acima.

- Nome da estudante: ____________________
- Outros integrantes, se aplicável: ____________________
- Responsável pela rotação dos Client Secrets: ____________________
- Data do aceite: ____________________
- Assinatura(s): ____________________

A revisão não substitui a assinatura nem atesta declarações pessoais ainda não confirmadas.
