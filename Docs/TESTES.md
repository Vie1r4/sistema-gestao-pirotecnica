# Testes

**Junho 2026** — totais verificados (`Release`, jun. 2026): **57** domínio (+1 skip) · **102** integração · **69** Vitest · **17** Playwright.

---

## O que são e para que servem

**Testes automatizados** são programas que executam o código e verificam se o resultado é o esperado — **sem** ter de clicar manualmente em cada ecrã antes de cada entrega ou apresentação.

Servem para três coisas principais:

1. **Confiança** — saber que login, permissões, stock FIFO, validações legais do paiol, etc. continuam a funcionar depois de alterações.
2. **Regressão** — quando se corrige um bug, o teste fica no repositório e impede que o mesmo erro volte.
3. **Documentação viva** — cada teste descreve um comportamento esperado (ex.: «Comercial não pode apagar encomenda» → 403).

O projeto usa **quatro camadas**, do mais isolado ao mais completo:

| Camada | Projeto / pasta | O que testa | Para quê |
|--------|-----------------|-------------|----------|
| **Unitários (domínio)** | `Finalproj.Tests` | Regras de negócio, validadores, cálculos legais, stock | Lógica pura, rápida, sem rede nem browser |
| **Integração (HTTP)** | `Finalproj.IntegrationTests` | API completa: auth, 401/403, IDOR, endpoints reais | Garantir que o servidor responde bem e que a segurança está aplicada |
| **Unitários (frontend)** | `apps/web/tests/unit` (Vitest) | Permissões de rotas, mapeadores de API, CSP, helpers | Lógica do client sem abrir browser |
| **E2E (browser)** | `apps/web/tests/e2e` (Playwright) | Fluxos como login, rotas protegidas, CRUD, encomendas | Simular o utilizador real na aplicação web |

Em CI (GitHub Actions), estes testes correm automaticamente em cada push/PR — ver secção [CI](#ci) abaixo.

---

## Comandos

```bash
# Tudo backend
dotnet test Finalproj.sln -c Release

# Frontend (em apps/web/)
npm test
npm run test:e2e
npx playwright install chromium   # primeira vez
```

---

## Backend

### `Finalproj.Tests` (domínio)

- EF InMemory, xUnit.
- `EncomendaService` — preparação, FIFO, validações.
- `StockDisponivelService` — entradas, saídas, reservas.
- Helpers: `TestDbContextFactory`, `NoOpLogSistemaService`.

### `Finalproj.IntegrationTests` (HTTP)

- `CustomWebApplicationFactory`, ambiente `Testing`.
- Auth (login, refresh, me, logout).
- Matriz **401/403** (GET + mutação).
- **IDOR** — documentos, paiol, admin, serviços.

Regra: alterar autorização → actualizar `InlineData` ou teste IDOR; documentar em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

---

## Frontend

### Vitest (`apps/web/tests/unit`)

Auth, `authApi`, `routePermissions`, APIs, CSP. Mocks de `fetch` com `Content-Type: application/json` quando usam `safeParseJson`.

### Playwright (`apps/web/tests/e2e`)

Login, rota protegida, CRUD funcionários (mocks), encomenda submeter, documentação. Helpers: `tests/e2e/helpers/auth.ts`, `setup.ts`.

`playwright.config.ts`: em CI, 2 workers e 2 retries; timeout 60s.

---

## CI

| Workflow | Conteúdo |
|----------|----------|
| `.github/workflows/dotnet-tests.yml` | `dotnet test`, cobertura HTML (informativa), bloqueio pacotes HIGH |
| `.github/workflows/client-ci.yml` | typecheck, lint, Vitest, build, Playwright |

Cobertura ≥60% Domain/Application: meta futura; CI ainda não falha por %.
