# Frontend — sistema de gestão pirotécnica

Frontend **Next.js 16** (React 19) da aplicação desenvolvida para a **Pirofafe**. Consome a API ASP.NET Core na raiz do repositório.

A interface usa a marca da empresa (Pirofafe) nos ecrãs de autenticação; o repositório documenta o **software**, não um produto comercial com esse nome.

## Documentação

- **Índice geral:** [Docs/README.md](../../Docs/README.md)
- **Organização do frontend:** [Docs/frontend/ORGANIZACAO-FRONTEND.md](../../Docs/frontend/ORGANIZACAO-FRONTEND.md)
- **Segurança (tokens, CSP):** [Docs/SEGURANCA.md](../../Docs/SEGURANCA.md)
- **Testes:** [Docs/TESTES.md](../../Docs/TESTES.md)

## Pré-requisitos

- Node.js 20+
- Backend a correr (por defeito `https://localhost:7225`)

## Variáveis de ambiente

Copie [`.env.example`](.env.example) para `.env.local` (opcional):

```env
NEXT_PUBLIC_API_URL=https://localhost:7225
```

Produção: ver [Docs/PRODUCAO.md](../../Docs/PRODUCAO.md) e [`.env.example`](../../.env.example) na raiz.

## Executar

```bash
npm install
npm run dev
```

O script `scripts/dev.mjs` mostra URLs (PC, rede, API). Abre [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## CI

Alterações em `apps/web/**` disparam [`.github/workflows/client-ci.yml`](../../.github/workflows/client-ci.yml): typecheck, lint, Vitest, build, Playwright E2E.

## Estrutura relevante

| Pasta | Conteúdo |
|-------|----------|
| `app/lib/*Api.ts` | Chamadas HTTP à API |
| `app/components/` | UI reutilizável |
| `tests/unit/`, `tests/e2e/` | Vitest e Playwright |

Convenções: [CONTRIBUTING.md](../../CONTRIBUTING.md).
