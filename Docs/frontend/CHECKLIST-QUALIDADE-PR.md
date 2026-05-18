# Checklist de Qualidade para PR (Frontend)

Objetivo: manter entregas previsíveis, funcionais e organizadas em todas as mudanças do `apps/web/`.

## Fluxo recomendado por PR

1. Implementar mudança focada (escopo pequeno e claro).
2. Validar funcionalmente no browser.
3. Executar validação técnica:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - `npm run test:e2e` (quando a mudança toca fluxos críticos de UI)
4. Atualizar documentação afetada no mesmo trabalho.
5. Preencher checklist da PR.

## Regras de organização (prioridade máxima)

- Cada ficheiro deve ter uma responsabilidade clara.
- Evitar duplicação de chamadas API; segunda repetição de endpoint vai para `app/lib/*Api.ts`.
- Reutilizar fixtures em `tests/mocks/` para reduzir duplicação de testes.
- Sempre que corrigir bug, adicionar teste de regressão.

## Comandos padrão

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

No GitHub Actions, o workflow `client-ci.yml` já corre `typecheck`, `lint` e `test` (Vitest) em paralelo, depois `build`, instalação do Chromium do Playwright e `test:e2e` — alinhar com isto antes de abrir PR reduz falhas na pipeline.

## Referência

- Template de PR: `.github/pull_request_template.md`
- Organização de testes: `apps/web/tests/README.md`
