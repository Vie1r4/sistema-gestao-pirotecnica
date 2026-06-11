# PIROFAFE — Frontend

Frontend **Next.js 16** (React 19) do sistema PIROFAFE. Consome a API do backend ASP.NET Core (raiz do repositório).

## Documentação

- **Índice geral:** [Docs/README.md](../../Docs/README.md)
- **Segurança (tokens, CSP):** [Docs/SEGURANCA.md](../../Docs/SEGURANCA.md)
- **Testes:** [Docs/TESTES.md](../../Docs/TESTES.md)

## Pré-requisitos

- Node.js 18+
- Backend da aplicação a correr (por defeito em `https://localhost:7225`)

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (opcional; por defeito usa `https://localhost:7225`):

```env
NEXT_PUBLIC_API_URL=https://localhost:7225
```

Em produção, use `.env.production.example` como modelo e veja [Docs/PRODUCAO.md](../../Docs/PRODUCAO.md).

## Executar

```bash
npm install
npm run dev
```

O script `scripts/dev.mjs` mostra um **banner** com URLs organizadas (este PC, rede Wi‑Fi, adaptadores virtuais) e a porta da API para telemóvel (`5078`). Abre [http://localhost:3000](http://localhost:3000) no PC.

## Build para produção

```bash
npm run build
npm start
```

## CI

Em PRs e em `push` às branches `main` e `next`, alterações em `apps/web/**` executam [`.github/workflows/client-ci.yml`](../../.github/workflows/client-ci.yml): `npm ci`, em paralelo `npm run typecheck` (`tsc --noEmit`), `npm run lint` e `npm run test` (Vitest), depois `npm run build`, instalação do Chromium do Playwright e `npm run test:e2e` (sem backend real — os specs usam `page.route` onde necessário).

No `eslint.config.mjs`, as regras `react-hooks/set-state-in-effect` e `react-hooks/incompatible-library` estão **desligadas** (`off`): com Next.js e TanStack Query/Table geram avisos em padrões válidos; ver comentários no próprio ficheiro.

## Layout do conteúdo

Largura e padding horizontais estão centralizados em `app/globals.css`:

- `.content-container` — listagens e dashboards (**90rem** / 1440px).
- `.content-container--admin` — painel `/admin` (**96rem** / 1536px).
- `.page-shell` — `<main>` com padding alinhado à navbar.

Para afinar no futuro, altere `--content-max-width` e `--content-max-width-admin` em `:root`.

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
- Checklist de PR: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Área de documentação de serviços

- Nova rota: `"/documentacao"`.
- Objetivo: centralizar ações de documentação por serviço (ex.: licenças/papelada por tipo).
- Acesso: apenas utilizadores com role `Admin` ou `Gestor`.
- A página de detalhe `"/servicos/[id]"` mantém dados operacionais e encaminha para esta área para gerir documentação.

