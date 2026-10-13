# Avaliação de GitHub Actions

Dupla: Beatrys Belo e Nicoly Ribeiro Barbosa (Nicaribeiro).

## Tarefa 1 — CI

- Execução verde: https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38403056711
- Execução vermelha proposital: https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38403429375
- Execução vermelha no PR: https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38403435899
- Execução após a correção: https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38403817794
- Linha do log: `Parse error near line 1: near "TABL": syntax error`.
- Erro introduzido: `CREATE TABL` no lugar de `CREATE TABLE`.
- A etapa de migração falhou; a validação HTML foi interrompida nessa execução.
- A migração é testada em SQLite local para detectar erros SQL antes de alterar o D1 remoto.

## Tarefa 2 — Proteção da main

PR: https://github.com/Beatrys-lira/oauth-pages-lab/pull/1

A main está protegida com o check verificar obrigatório para todos. O PR #1 ficou bloqueado com o CI vermelho (https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38408351137); o estado foi observado no GitHub e capturado em print. A migração foi corrigida na mesma branch.

Pendente: registrar liberação após a correção e recusa de git push direto.

## Tarefa 3 — Revisão por IA

Workflow implementado em .github/workflows/revisao-ia.yml.

COPILOT_PAT foi cadastrado. O log detalhado mostrou que o modelo gpt-4.1 não estava disponível; a entrada model foi ajustada para usar o padrão do Copilot (https://github.com/Beatrys-lira/oauth-pages-lab/actions/runs/38410480268). A versão v1 indicada no enunciado usa GitHub Models; a revisão foi adaptada para a implementação Copilot do próprio GitHub, fixada em commit.

Pendente: testar SQL vulnerável e corrigido, registrar erro de permissão e avaliar criticamente uma afirmação real da IA. Ausência de secret não é evidência do teste de permissão solicitado.

## Tarefa 4 — Migrações remotas

Migração inicial: migrations/0001_cria_notas.sql.

Banco configurado: oauth-pages-bd, binding DB. wrangler.toml e migrar.yml publicados na branch de avaliação; os secrets Cloudflare foram cadastrados pela estudante. A migração 0002_adiciona_coluna.sql adiciona observacao à tabela notas. As duas migrações passaram no SQLite local, com a coluna confirmada por PRAGMA.

Pendente: concluir a revisão por IA do PR, integrar, confirmar a execução remota e fazer um segundo merge sem migrations/ para demonstrar o filtro paths.

## Perguntas

### 1. Por que o CI roda duas vezes?

Um push numa branch com PR aberto dispara o evento push e também synchronize do pull_request. Quando ambos fornecem um check com o mesmo nome, o GitHub pode exigir os dois; a execução pull_request testa o merge proposto com a base, e a execução push testa o commit da branch.

### 2. Por que um fork não recebe COPILOT_PAT?

Código de um fork é controlado por outra pessoa e não recebe os secrets do repositório de destino no evento pull_request. Isso impede que um workflow malicioso envie o token a terceiros.

### 3. Por que declarar permissions?

As permissões explícitas limitam o GITHUB_TOKEN ao acesso necessário: leitura do código e escrita de comentários no PR. Assim o workflow não depende de permissões padrão e reduz o impacto de uso indevido do token.

### 4. A revisão da IA substitui o status check?

Não. O comentário da IA é uma análise que pode conter erros ou omissões; o CI executa as verificações e fornece o check obrigatório. A crítica baseada na revisão real ainda está pendente.
