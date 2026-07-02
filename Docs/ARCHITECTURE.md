# Architecture

Technical overview of the pyrotechnics operations platform (backend + frontend).

Portuguese version: [ARQUITETURA.md](ARQUITETURA.md)

---

## What it is

Operations management system built for **Pirofafe**: regulated warehouses (paióis) and stock (MLE/NEM, FIFO), product catalog, orders with reservations, field services (1:1 with a completed order), clients, staff, and documents.

- **Backend:** `src/Finalproj.*` — ASP.NET Core 8 API, EF Core, SQL Server, Identity + JWT.
- **Frontend:** `apps/web/` — Next.js 16, React 19, TanStack Query, Tailwind.

---

## Backend layers

| Project | Responsibility |
|---------|----------------|
| `Finalproj.Api` | Controllers, `Program.cs`, middleware, HTTP model binders (`UploadedFileContent`), dropdowns |
| `Finalproj.Application` | Application services, DTOs, FluentValidation validators — **no** `Microsoft.AspNetCore.*` |
| `Finalproj.Domain` | Entities, constants, read models (`ReadModels/`); **legal parameters and rules in `Legislacao/`**; contracts in `Interfaces/` (`IUnitOfWork`, `IGestorAnalyticsRepository`) and `Interfaces/Repositories/` |
| `Finalproj.Infrastructure` | EF `FinalprojContext`, email, `ArquivosRaizService`, `DocumentoStorageService`, backups, `LogSistemaService` |

Notable business services: `EncomendaService` (FIFO preparation), `StockDisponivelService`, `ServicoService`, `DocumentoStorageService` (uploads under `PirofafeData/Uploads` via `IArquivosRaizService`; extension + magic-byte validation). Application uploads use `UploadedFileContent` (bytes + filename); the API maps `IFormFile` at the boundary (`FormFileMapper` / model binder).

### Legal data and calculations (`Finalproj.Domain/Legislacao/`)

Everything **defined by regulation** that changes often (ADR, RFACEPE, PSP rules) lives in this module so updates stay localized:

- **`ParametrosLegaisPirotecnia`** — **single source** for numeric values and matrices: minimum safety distances, group C + G MLE limit (50 kg), warehouse occupancy thresholds (80% / 90%), risk division hierarchy, ADR 7.2.5 compatibility matrix, and license–warehouse → accepted families matrix (ADR 7.5.2.2). **Law changes = edit here only.**
- **`MotorValidacaoPaiol`** — validates warehouse entries (license, groups, capacity); uses the parameters above. **Leveling rule:** occupied weight is always real (quantity × NEM); when an entry raises the warehouse’s dominant division (e.g. 1.4-only warehouse receives 1.3), **AVISO_004** warns that the whole warehouse is treated under the stricter division (does not block). The resulting dominant division is persisted and used for safety distances.
- **`RegrasLicencaPaiol`** — license ↔ product family compatibility. Two-phase validation: **(1) risk division numbers** — cascade only downward from 1.3; high explosives 1.1 and 1.2 are “islands”; **(2) ADR 7.2.5 compatibility letters** — B/C/D/G/S matrix. Danger order: 1.1 > 1.2 > 1.3 > 1.4 > 1.4S.
- **`ConstantesDistanciaSeguranca`** — regulatory reference type names (dwellings, road, etc.); **not** the source of values stored on services.
- **`CalculoAreaSegurancaPublico`** — public radius for a launch zone = **maximum** of catalog public safety distances for allocated products. Service-level distance = **maximum across zones**.

When saving zones (`ServicoService.GravarZonasAsync`), the backend syncs `ServicoZonaDistanciaSeguranca` and `ServicoDistanciaSeguranca` with those maxima. Manual PUT on `.../distancia-seguranca/{id}` remains for compatibility but values are overwritten on the next zone save; the UI does not expose manual editing.

The `Finalproj.Domain.Legislacao` namespace is in `global using` across all projects.

---

## Frontend

- HTTP calls in `apps/web/app/lib/*Api.ts` and `auth.ts` / `authApi.ts`.
- User and permissions: `GET /api/auth/me` → `UserContext`.
- Protected routes: `routePermissions.ts` + `ProtectedRoute`.
- Business data **only via API** (TanStack Query). See [SEGURANCA.md](SEGURANCA.md) (Portuguese).

---

## Domain (summary)

- **Paiol** + entries/exits, documents (visible to warehouse roles with access).
- **Produto** — NEM, classification, compatibility.
- **Encomenda** — states (Pending → Accepted → In preparation → Completed / Rejected), line items, **reservations**.
- **Servico** — crew, licenses, distances, documents; unique `EncomendaId`; **launch zones** (`ServicoZonaLancamento` with material/time lines and per-zone distances); PSP fields (`NomeEvento`, `CoordenadorPirotecnico`, CRED on staff, `Categoria` on product, `Nome` on order).
- **Cliente**, **Funcionario**, **RefreshToken**, **LogSistema**.

Core rules: available stock = non-exhausted lot balance (SQL) − ad-hoc exits − reservations; preparation only on Accepted orders, FIFO exits by manufacture date then entry date. **Clients and staff:** soft delete (`EliminadoEm`) — hidden from lists and detail GET, but names remain on orders/services (`disponivel: false` in API). Warehouse entries go through `MotorValidacaoPaiol`; HTTP coverage in `EntradaPaiolCompatibilidadeTests`. Services require order material split across zones; PSP declaration via `GeradorDeclaracaoPspService` (see `Docs/documentacao-regulatoria/`).

---

## Authorization

Roles: **Admin**, **Gestor** (Manager), **Comercial**, **Armazém** (Warehouse). Policies in `PoliticasAutorizacao`; details in [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

Auth: JWT + HttpOnly refresh; thin `AuthController` delegating to `AuthTokenService`, `AuthPasswordResetService`, `AuthEmailConfirmationService`, `AuthBootstrapService`. Full endpoint list: [API.md](API.md).

---

## HTTP pipeline (backend)

1. HSTS (non-Development) → JSON error middleware on `/api/*`.
2. HTTPS (production) → static files → routing → CORS → session → auth → controllers.
3. `RequestDiagnosticsMiddleware` — `X-Correlation-Id`, latency (see [OPERACOES.md](OPERACOES.md)).
4. Startup: `MigrateAsync` (schema evolution **only** via EF migrations in `Persistence/Migrations/`) and Identity **roles** (`SeedRoles`). **No** ad-hoc SQL in `Program.cs` and **no** automatic business seed — products, clients, orders, etc. are created through the application.

---

## API modules

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Login, refresh, me, first-user bootstrap |
| `/api/paiol` | Warehouses, stock, movements, entries/exits |
| `/api/produtos` | Catalog |
| `/api/encomendas` | Session draft, submit, accept, prepare, complete |
| `/api/servicos` | Services, licenses, documents |
| `/api/clientes`, `/api/funcionarios` | CRUD + documents |
| `/api/admin` | Users, backups |
| `/api/home` | Stats, profile, preferences |

Typical pagination: `pagina`, `itensPorPagina`; response includes `totalRegistos`.

---

## FIFO stock — implementation and known gaps

**Implemented:** `StockDisponivelService` uses `SumSaldoDisponivelPorProdutoAsync` (lot balance − ad-hoc exits − reservations). `EncomendaService.RegistarPreparacaoAsync` uses `ListComSaldoParaPreparacaoLockedAsync` (SQL Server: `UPDLOCK`/`HOLDLOCK`; InMemory: equivalent LINQ **without real isolation**), FIFO-ordered (`DataFabrico ?? DataEntrada`, then `DataEntrada`), inside an explicit transaction with a row lock on the order. `SAIDA_STOCK` logs only after successful commit. Domain tests in `StockDisponivelServiceTests` and `EncomendaServiceTests`; concurrency proof in `FifoPreparacaoConcorrenciaTests` (SQL Server via Testcontainers — skipped locally without Docker; runs in CI).

**Testing note:** the default suite (EF InMemory + HTTP integration) **does not reproduce** SQL locks or races. That does not invalidate the production fix (SQL Server); it validates business rules and HTTP contracts. Concurrency proof is the Docker test (CI) or local Docker when available.

**Known technical debt:**

| Gap | Description | Hardening |
|-----|-------------|-----------|
| **FIFO indexes** | `EntradasPaiol` only indexes `PaiolId` and `ProdutoId`; composite date ordering may sort expensively at scale. | Composite index migration; validate plan with `.ToQueryString()` / SQL Server `EXPLAIN`. |
| **Preparation concurrency** | ~~Read balances without pessimistic locking; two operators could over-allocate the same lot.~~ **Fixed (2026-07):** explicit transaction + `UPDLOCK`/`HOLDLOCK` on `Encomendas` and `EntradasPaiol` in `RegistarPreparacaoAsync`; test `FifoPreparacaoConcorrenciaTests`. | — |
| **Ad-hoc exits vs per-lot FIFO** | Exits with `EntradaPaiolId == null` reduce global stock but **not** per-lot balance in `ListComSaldoParaPreparacaoLockedAsync`. Sum of lots can exceed global stock after manual exits. | Pro-rata ad-hoc across lots, forbid ad-hoc when lot stock exists, or validate `SUM(lots) − ad-hoc ≥ quantity` before allocation. |
| **Tests vs real SQL** | Unit suite uses EF InMemory; does not validate T-SQL translation (`COALESCE`, correlated subqueries). | Optional integration test against SQL Server LocalDB for stock/FIFO queries. |

---

## Conventions

- Invariant decimal binding (`DecimalInvariantModelBinder`).
- Documents under `PirofafeData/Uploads` (portable, relative to `ContentRootPath`); DB paths stay relative. API `wwwroot` only has `favicon.ico`; `DadosLocais:UsarFallbackWwwroot` is **disabled**. Path traversal validated in `ArquivosRaizService` / `DocumentoStorageService`.
- `/api/*` errors as JSON (401/403/404/500); 500 includes `correlationId` when applicable.

---

## Testing and CI (summary)

| Layer | Where | CI workflow |
|-------|-------|-------------|
| Unit + HTTP integration | `Finalproj.Tests`, `Finalproj.IntegrationTests` | `dotnet-tests.yml` (≥60% coverage Domain/Application; Docker tests for FIFO + bootstrap) |
| Frontend unit + mocked E2E | Vitest, Playwright `tests/e2e` | `client-ci.yml` |
| Full-stack E2E | Playwright `tests/e2e/fullstack` | `fullstack-e2e.yml` (browser → HTTPS API → SQL Server) |

Details: [TESTES.md](TESTES.md).
