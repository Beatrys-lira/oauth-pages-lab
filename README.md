# Laboratório de autenticação

Projeto da faculdade desenvolvido por **Beatrys Belo e Nicoly Ribeiro Barbosa**, para as atividades do professor **Frank**.

O site permite entrar com uma conta Google ou GitHub e acessar um painel com gráficos relacionados à Engenharia de Software. Depois do login, aparecem o nome e a foto da pessoa conectada. Ao clicar na foto, é possível ver o e-mail, quando disponibilizado pelo provedor.

**[Acessar o site](https://oauth-pages-lab-ec6.pages.dev/)**

## Como funciona

1. A pessoa escolhe entrar com Google ou GitHub.
2. O provedor confirma o login e retorna para o site.
3. O servidor valida a tentativa e cria uma sessão no banco.
4. O painel consulta a sessão para exibir os dados da pessoa conectada.
5. Ao sair, a sessão é encerrada.

A autenticação usa OAuth no GitHub e OpenID Connect no Google. Os dados da sessão são validados no servidor, e o cookie de sessão não pode ser lido pelo JavaScript da página.

## Tecnologias

- HTML, CSS e JavaScript para a interface.
- Cloudflare Pages para publicar o site.
- Pages Functions para autenticação e API.
- Cloudflare D1 para guardar usuários e sessões.
- GitHub Actions para as verificações e migrações automáticas.

## Organização dos arquivos

- `public/`: páginas, estilos, scripts e imagens.
- `functions/`: login, retorno dos provedores, API e logout.
- `migrations/`: alterações na estrutura do banco.
- `.github/workflows/`: testes, revisão com IA e migração do D1.

## GitHub Actions

A avaliação acrescentou verificações de HTML, possíveis segredos no código e migrações SQL. As alterações entram na `main` por pull request, após os testes exigidos pela proteção da branch.

Também há uma revisão com IA nos pull requests. Quando uma alteração em `migrations/` é integrada à `main`, outro workflow aplica as migrações no D1.

As respostas e os registros dos testes estão em [AVALIACAO.md](AVALIACAO.md). As evidências da primeira atividade de autenticação estão em [public/entrega1](public/entrega1).

## Configuração

O Cloudflare usa a pasta `public` e a branch `main`. As Functions precisam do binding `DB`, da variável `PUBLIC_BASE_URL` e dos IDs e segredos dos clientes Google e GitHub. Os segredos ficam nas configurações do Cloudflare.

Endereços de retorno dos logins:

- Google: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/google`
- GitHub: `https://oauth-pages-lab-ec6.pages.dev/oauth/callback/github`
