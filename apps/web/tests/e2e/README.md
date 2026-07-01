# Testes E2E (Playwright)

Objetivo: validar fluxos ponta-a-ponta em browser real.

## Dois modos

| Modo | Comando | Backend |
|------|---------|---------|
| **Mock** (rápido, CI `client-ci`) | `npm run test:e2e` | `page.route` — não precisa de API |
| **Full-stack** | `E2E_FULLSTACK=1 E2E_USE_HTTPS=1 npm run test:e2e:fullstack` | API HTTPS + SQL Server (refresh cookie) |

## Pré-requisitos (mock)

- `npx playwright install chromium`
- Playwright arranca `npm run dev` (`playwright.config.ts`)

## Pré-requisitos (full-stack)

1. SQL Server (`ConnectionStrings__FinalprojContext`)
2. `E2E_USE_HTTPS=1` + `bash scripts/e2e-fullstack/start-api.sh` (HTTPS `7225` — necessário para refresh após reload)
3. `bash scripts/e2e-fullstack/seed-admin.sh` + `validate-login.sh`
4. `npm run build` → `E2E_FULLSTACK=1 npm run test:e2e:fullstack`

Exemplo (bash, raiz do repo):

```bash
export ConnectionStrings__FinalprojContext="Server=...;..."
export E2E_USE_HTTPS=1
export E2E_FULLSTACK=1
export E2E_API_URL=https://127.0.0.1:7225
export NEXT_PUBLIC_API_URL=https://127.0.0.1:7225
bash scripts/e2e-fullstack/start-api.sh
bash scripts/e2e-fullstack/seed-admin.sh
bash scripts/e2e-fullstack/validate-login.sh
cd apps/web && npm run build
npm run test:e2e:fullstack
bash ../../scripts/e2e-fullstack/stop-api.sh
```

No **GitHub Actions**, o workflow [`.github/workflows/fullstack-e2e.yml`](../../../../.github/workflows/fullstack-e2e.yml) faz isto automaticamente.

## CI mock (`client-ci.yml`)

Após `npm run build`, corre `npm run test:e2e`. Cenários em `tests/e2e/*.spec.ts` usam mocks — estáveis e sem SQL Server.

## Organização

- `tests/e2e/*.spec.ts` — mocks (`testIgnore` exclui `fullstack/`)
- `tests/e2e/fullstack/*.spec.ts` — API real (3 testes: login, reload/refresh, clientes)
- Helpers mock: `tests/e2e/helpers/auth.ts` · full-stack: `tests/e2e/fullstack/helpers.ts`

Modo visual: `npm run test:e2e:headed`
