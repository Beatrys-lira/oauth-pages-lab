# Laboratório de autenticação

Projeto acadêmico de autenticação com Google e GitHub, desenvolvido com HTML, CSS e JavaScript e publicado no Cloudflare Pages. Após o login, o usuário acessa um dashboard simples com gráficos relacionados à área de Engenharia de Software.

**Acesse o site:** [oauth-pages-lab-ec6.pages.dev](https://oauth-pages-lab-ec6.pages.dev/)

## Funcionamento

1. O usuário escolhe entrar com Google ou GitHub.
2. O provedor realiza a autenticação e retorna ao site.
3. A Function valida a transação e a identidade do usuário.
4. O perfil é salvo no Cloudflare D1 e uma sessão local é criada.
5. O usuário é redirecionado ao dashboard e pode encerrar a sessão pelo botão Sair.

O login utiliza código de autorização com PKCE S256. As sessões duram até oito horas e usam um cookie opaco com Secure, HttpOnly e SameSite=Strict. O banco armazena o resumo SHA-256 desse cookie. No fluxo GitHub, a revogação da autorização deve ser confirmada antes da criação da sessão local.

## Tecnologias

- HTML, CSS e JavaScript, em arquivos separados.
- Cloudflare Pages para hospedagem.
- Cloudflare Pages Functions para autenticação e API.
- Cloudflare D1 para usuários, transações e sessões.
- Google OpenID Connect e GitHub OAuth.

## Estrutura

- `public/`: página de login, dashboard e arquivos estáticos.
- `functions/_middleware.js`: rotas de autenticação, validação dos provedores e controle de sessões.
- `functions/api/`: endpoints auxiliares.
- `public/entrega1/`: os oito arquivos de evidências exigidos pela atividade.

Os arquivos estáticos são públicos. O acesso aos dados do usuário é validado no servidor; o redirecionamento da interface não substitui a proteção da API.

## Rotas de autenticação

| Rota | Finalidade |
|---|---|
| `GET /oauth/login/google` | Iniciar login com Google |
| `GET /oauth/login/github` | Iniciar login com GitHub |
| `GET /oauth/callback/google` | Receber o retorno do Google |
| `GET /oauth/callback/github` | Receber o retorno do GitHub |
| `GET /api/me` | Consultar a sessão e o perfil autenticado |
| `POST /oauth/logout` | Encerrar a sessão local |

Sem uma sessão válida, `/api/me` responde com HTTP 401 e `{"authenticated":false}`. O logout exige que o cabeçalho Origin corresponda ao endereço do projeto.

## Configuração no Cloudflare

A publicação utiliza a integração com GitHub, a branch `main`, a pasta de saída `public` e nenhum comando de build.

| Configuração | Uso |
|---|---|
| `DB` | Binding do banco D1 |
| `PUBLIC_BASE_URL` | `https://oauth-pages-lab-ec6.pages.dev` |
| `GOOGLE_CLIENT_ID` | Identificador do cliente Google |
| `GOOGLE_CLIENT_SECRET` | Secret do cliente Google |
| `GITHUB_CLIENT_ID` | Identificador da OAuth App GitHub |
| `GITHUB_CLIENT_SECRET` | Secret da OAuth App GitHub |

Os Client Secrets devem permanecer como segredos criptografados no Cloudflare e nunca ser incluídos no repositório.

**Callbacks cadastrados:**

- Google: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/google`
- GitHub: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/github`

O D1 utiliza as tabelas `users`, `oauth_transactions` e `sessions`. O perfil inclui id, nome, email quando disponibilizado pelo provedor, provedor, id do usuário no provedor e data de criação.

## Avaliação

A entrega é a URL deste repositório, com os logins funcionando:

**https://github.com/Beatrys-lira/oauth-pages-lab**

As evidências estão em [public/entrega1](public/entrega1), incluindo os registros de configuração, início dos logins, testes de falha e checklist de aceitação.
