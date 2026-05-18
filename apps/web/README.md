# PIROFAFE — Frontend

Frontend **Next.js 16** (React 19) do sistema PIROFAFE. Consome a API do backend ASP.NET Core (raiz do repositório).

## Documentação

- **Índice geral do projeto:** [docs/README.md](../../docs/README.md)
- **Documentação específica do frontend:** [docs/frontend/](../../docs/frontend/) (auditoria localStorage, APIs utilizadas, pendências, padrões)

## Pré-requisitos

- Node.js 18+
- Backend da aplicação a correr (por defeito em `https://localhost:7225`)

## Variáveis de ambiente

Crie `.env.local` para desenvolvimento (opcional; por defeito usa `https://localhost:7225`):

```env
NEXT_PUBLIC_API_URL=https://localhost:7225
```

Em produção, defina `NEXT_PUBLIC_API_URL` com a URL pública da API.

## Executar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build para produção

```bash
npm run build
npm start
```

## CI

Em PRs e em `push` às branches `main` e `next`, alterações em `apps/web/**` executam [`.github/workflows/client-ci.yml`](../../.github/workflows/client-ci.yml): `npm ci`, em paralelo `npm run typecheck` (`tsc --noEmit`), `npm run lint` e `npm run test` (Vitest), depois `npm run build`, instalação do Chromium do Playwright e `npm run test:e2e` (sem backend real — os specs usam `page.route` onde necessário).

No `eslint.config.mjs`, as regras `react-hooks/set-state-in-effect` e `react-hooks/incompatible-library` estão **desligadas** (`off`): com Next.js e TanStack Query/Table geram avisos em padrões válidos; ver comentários no próprio ficheiro.

## Chamadas API (lib)

**Regra de equipa:** na **segunda vez** que o **mesmo endpoint** (mesmo método + caminho) for usado noutro sítio, extrair para uma **função** no módulo `app/lib/*Api.ts` adequado (ex.: `encomendasApi.ts`, `paiolApi.ts`). A primeira ocorrência pode ficar inline; não é obrigatório refatorar código já existente de uma só vez.

## Testes (organizados)

- Stack: `Vitest` + `Testing Library` + `jsdom`.
- Estrutura:
  - `tests/unit/` para lógica pura;
  - `tests/component/` para componentes/páginas;
  - `tests/setup/` para setup global;
  - `tests/mocks/` para mocks/fixtures partilhados.
- Scripts:
  - `npm run test`
  - `npm run test:watch`
  - `npm run test:coverage`
  - `npm run test:e2e`
  - `npm run test:e2e:headed`
- E2E Playwright: ver `tests/e2e/README.md`
- Checklist de PR: [docs/frontend/CHECKLIST-QUALIDADE-PR.md](../../docs/frontend/CHECKLIST-QUALIDADE-PR.md)

## Área de documentação de serviços

- Nova rota: `"/documentacao"`.
- Objetivo: centralizar ações de documentação por serviço (ex.: licenças/papelada por tipo).
- Acesso: apenas utilizadores com role `Admin` ou `Gestor`.
- A página de detalhe `"/servicos/[id]"` mantém dados operacionais e encaminha para esta área para gerir documentação.

