# PIROFAFE — Frontend

Frontend **Next.js 16** (React 19) do sistema PIROFAFE. Consome a API do backend ASP.NET Core (raiz do repositório).

## Documentação

- **Índice geral do projeto:** [Docs/README.md](../Docs/README.md)
- **Documentação específica do frontend:** [Docs/frontend/](../Docs/frontend/) (auditoria localStorage, APIs utilizadas, pendências, padrões)

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

Em PRs e em `push` às branches `main` e `next`, alterações em `client/**` executam [`.github/workflows/client-ci.yml`](../.github/workflows/client-ci.yml): `npm ci`, em paralelo `npm run typecheck` (`tsc --noEmit`) e `npm run lint`, depois `npm run build`.

No `eslint.config.mjs`, as regras `react-hooks/set-state-in-effect` e `react-hooks/incompatible-library` estão **desligadas** (`off`): com Next.js e TanStack Query/Table geram avisos em padrões válidos; ver comentários no próprio ficheiro.

## Chamadas API (lib)

**Regra de equipa:** na **segunda vez** que o **mesmo endpoint** (mesmo método + caminho) for usado noutro sítio, extrair para uma **função** no módulo `app/lib/*Api.ts` adequado (ex.: `encomendasApi.ts`, `paiolApi.ts`). A primeira ocorrência pode ficar inline; não é obrigatório refatorar código já existente de uma só vez.

