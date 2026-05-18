# Testes Frontend (Organização)

Estrutura inicial:

- `tests/unit/` - lógica pura (helpers, mapeamentos, regras de permissões)
- `tests/component/` - componentes/páginas com Testing Library
- `tests/e2e/` - fluxos ponta-a-ponta com Playwright
- `tests/setup/` - setup global de testes (matchers, mocks globais)
- `tests/mocks/` - fixtures e mocks partilhados

Convenções:

- Nome de ficheiros: `*.test.ts` ou `*.test.tsx`
- Um tema por ficheiro de teste
- Testes unitários primeiro; componentes depois
- Sempre que corrigir bug, adicionar teste de regressão
- Reutilizar fixtures em `tests/mocks/` para evitar duplicação e manter consistência

Execução:

- Unit + Component: `npm run test`
- E2E (Playwright): `npm run test:e2e`
