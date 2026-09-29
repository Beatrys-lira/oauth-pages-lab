# Laboratório de autenticação

Projeto acadêmico de autenticação com Google e GitHub, desenvolvido com HTML, CSS e JavaScript e publicado no Cloudflare Pages. Após o login, o usuário acessa um dashboard simples com gráficos relacionados à área de Engenharia de Software.

**Acesse o site:** [oauth-pages-lab-ec6.pages.dev](https://oauth-pages-lab-ec6.pages.dev/)

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


**Callbacks cadastrados:**

- Google: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/google`
- GitHub: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/github`

O D1 utiliza as tabelas `users`, `oauth_transactions` e `sessions`. O perfil inclui id, nome, email quando disponibilizado pelo provedor, provedor, id do usuário no provedor e data de criação.

## Avaliação

A entrega é a URL deste repositório, com os logins funcionando:

**https://github.com/Beatrys-lira/oauth-pages-lab**

As evidências estão em [public/entrega1](public/entrega1), incluindo os registros de configuração, início dos logins, testes de falha e checklist de aceitação.
