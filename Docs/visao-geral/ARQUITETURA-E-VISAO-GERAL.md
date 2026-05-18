# Arquitetura e visão geral — PIROFAFE

Documento técnico de referência (backend + frontend). **Última revisão:** maio de 2026 — alinhada a políticas `PoliticasAutorizacao`, permissões em `/api/auth/me`, role **Gestor** (ex-Técnico) e backups SQL documentados.

---

## Conteúdo deste documento

1. [Visão geral](#1-visão-geral) — domínio e regras centrais  
2. [Stack e arquitetura](#2-stack-e-arquitetura) — backend (`Program.cs`), frontend (camada `lib/`).  
3. [Domínio](#3-domínio) — EF, entidades, relações.  
4. [Segurança](#4-segurança) — JWT, políticas, `/me`.  
5. [API](#5-api) — controllers e ciclo de encomenda.  
6. [Persistência](#6-persistência-e-migrações)  
7. [Convenções](#7-convenções-e-decisões-técnicas-relevantes)

O resumo executivo e o índice de documentação estão em [**`PROJETO.md`**](PROJETO.md).

---

## 1. Visão geral

**PIROFAFE** é um sistema de gestão para contexto **pirotécnico**: catálogo de produtos com NEM (kg de pólvora por unidade), **paióis** (armazéns com limite MLE, perfil de risco, licenças), **movimentação de stock** (entradas por lote, saídas com rastreio a entradas), **encomendas de clientes** com **reserva de stock** enquanto a encomenda está em curso, e **serviços no terreno** ligados a **encomendas concluídas** (relação 1:1 encomenda–serviço), com equipa, documentos, licenças e distâncias de segurança.

### Regras de negócio centrais (resumo)

- **Encomenda**: fluxo em strings (`ConstantesEncomenda`): Pendente → Aceite | Rejeitada; Aceite → Em preparação → Concluída. Enquanto o estado está em **Pendente**, **Aceite** ou **Em preparação**, existem **reservas** por produto que reduzem o stock “disponível” para novas encomendas.
- **Stock disponível**: entradas − saídas − reservas das encomendas em estados com reserva (`StockDisponivelService`).
- **Preparação**: só com encomenda **Aceite**; gera **saídas** de paiol por **FIFO** (por lote/entrada), com validação de acesso a paióis via `PaiolAcesso` e roles do utilizador (`EncomendaService.RegistarPreparacaoAsync`).
- **Conclusão**: só em **Em preparação**; remove reservas e fixa data de conclusão.
- **Serviço**: só pode associar-se a encomendas **Concluídas**; `EncomendaId` é **único** na tabela de serviços (1 serviço por encomenda).
- **Produto / Paiol**: compatibilidade de classificação de risco e grupos ADR; validações adicionais em controladores de entrada (motor de regras no fluxo de armazém).

O frontend é **API-first**: dados de negócio vêm da API; tokens de sessão e eventual estado mínimo de UI seguem as regras em [`docs/frontend/AUDITORIA-LOCALSTORAGE.md`](../frontend/AUDITORIA-LOCALSTORAGE.md).

---

## 2. Stack e arquitetura

### Backend

| Aspeto | Tecnologia |
|--------|------------|
| Runtime | **.NET 8** (`net8.0`) |
| Web | **ASP.NET Core** — apenas **API** (sem Razor/Identity UI) |
| ORM | **Entity Framework Core 8** + **SQL Server** |
| Identidade | **ASP.NET Core Identity** (`IdentityUser` / `IdentityRole`) com stores em EF |
| Auth API | **JWT Bearer** (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Validação | **FluentValidation** (registos explícitos em `Program.cs`) |
| Documentação API | **Swashbuckle** (Swagger/SwaggerUI) **só em Development** |

#### `Program.cs` — configuração relevante

- **`AddControllers`**: JSON com **camelCase**, `ReferenceHandler.IgnoreCycles`; **primeiro** provider de model binding = `DecimalInvariantModelBinderProvider` (decimais invariantes em query/form); filtro global `InvalidOperationExceptionFilter` (ex.: uploads) → 400.
- **`AddDbContext<FinalprojContext>`** com connection string `FinalprojContext`.
- **`AddIdentity`**: confirmação de email obrigatória para sign-in; política de passwords (dígito, maiúsculas, minúsculas, comprimento 6; sem obrigar não alfanumérico); `IdentityErrorDescriberPt` para mensagens em português.
- **FluentValidation**: validators scoped para DTOs de cliente, saída/entrada paiol, encomenda, paiol, funcionário.
- **`DocumentosOptions`** + **`FormOptions.MultipartBodyLengthLimit`** alinhados ao tamanho máximo de ficheiro.
- **Serviços**: `IEmailSender` (singleton), `ILogSistemaService`, `IStockDisponivelService`, `IEncomendaService`, `IServicoService`, `IDocumentoStorageService` (scoped conforme caso).
- **Backups SQL:** `Configure<DatabaseBackupOptions>` (secção `Backups` no `appsettings`). `DatabaseBackupHostedService` implementa `IDatabaseBackupService` e `IHostedService` — backup diário (hora local), ficheiros `.bak` na raiz do projeto, retenção de N dias. Ver **`docs/backend/BACKUPS-AUTOMATICOS.md`**.
- **`AddDistributedMemoryCache` + `AddSession`**: rascunho de encomenda no servidor; cookie de sessão com `SameSite=None`, `Secure=Always` para CORS com credenciais.
- **`AddAuthentication`**: default scheme = **`IdentityConstants.ApplicationScheme`** (cookies Identity); **JWT** registado como scheme adicional — os controladores da API usam **`[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]`** para não depender de cookies.
- **`AddAuthorization`**: políticas nomeadas via `PoliticasAutorizacao.ConfigurarPoliticas`.
- **`Jwt:Secret`**: validação de arranque (mín. 32 caracteres).
- **CORS** `FrontendPolicy`: em Development, origem dinâmica `IsAllowedDevelopmentFrontendOrigin` (localhost/127.0.0.1/IPv4 privados, **porta 3000**); em produção, lista em `Cors:AllowedOrigins`; `AllowCredentials` para cookies/sessão.

#### Pipeline HTTP (ordem)

1. Em não-Development: **HSTS**.
2. Middleware custom: **try/catch** global — para paths `/api/*`, respostas **500 JSON** (detalhe da exceção só em Development).
3. **HTTPS redirection** (exceto Development — acesso por IP/telemóvel sem certificado).
4. **Static files** (`wwwroot` — documentos carregados).
5. **Routing** → **CORS** → **Swagger** (dev) → **Session** → **Authentication** → **Authorization** → **MapControllers**.

#### Arranque (`InicializarAsync`)

`Database.MigrateAsync()`, salvaguarda SQL para coluna `ServicoLicencas.OrigemRegisto` se o histórico estiver desalinhado, `DbInitializer.Initialize` (vazio), `SeedRoles.InitializeAsync` (roles, migração Técnico→Gestor, contas de teste opcionais).

### Frontend

| Aspeto | Tecnologia |
|--------|------------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS 4** |
| Dados | **TanStack Query v5** |
| Estado local | **Zustand** (ex.: toasts) |
| Mapas | **Leaflet** + **react-leaflet** |
| Gráficos | **Recharts** |
| Tabelas | **TanStack Table** |

**Arquitetura cliente**

| Camada | Conteúdo |
|--------|----------|
| **Páginas** | `apps/web/app/**/page.tsx` — UI, rotas, TanStack Query onde aplica. |
| **API (HTTP)** | `apps/web/app/lib/*Api.ts` — um módulo por domínio ou fluxo: `encomendasApi`, `paiolApi` (incl. POST criar paiol, GET movimentos), `produtosApi`, `servicosApi`, `funcionariosApi`, `entradaPaiolApi` (GET formulário + POST registar entrada), **`saidaPaiolApi`** (GET/POST registar saída), **`authApi`** (`existem-utilizadores`, login, primeiro utilizador, **`fetchAuthMe`**). Outros: `admin.ts`, `clientes.ts`, `home.ts`, `homeGestor.ts`, `geocoding.ts`. |
| **Sessão local** | `auth.ts` — `getToken`, refresh, `logout` (sem duplicar URLs de login aqui; isso fica em `authApi`). |
| **Config** | `apiConfig.ts` — `getApiBaseUrl()`, `apiPath()` (HTTPS `localhost:7225` por defeito, override `NEXT_PUBLIC_API_URL`). |
| **Helpers** | `api.ts` (`safeParseJson`), `apiErrors.ts` (`parseApiErrorBody`). |

**Layout raiz:** `QueryProvider`, `ThemeSync`, `GlobalToast`, `ProtectedRoute`, `PageTransition`. **`UserContext`** chama `fetchAuthMe` (wrapper sobre `GET /api/auth/me`); o backend devolve **roles** e **`permissions`** (strings tipo `encomendas.gerir`) para a UI e **Navbar** alinharem com o servidor. **`refreshAccessToken`** é agendado ~5 min antes da expiração do JWT.

**CI:** `.github/workflows/client-ci.yml` em alterações sob `apps/web/**` (typecheck, lint, Vitest em paralelo, build, Playwright E2E com Chromium).

**Testes:** Vitest + Testing Library em `apps/web/tests/`; Playwright para E2E — ver `apps/web/README.md`.

---

## 3. Domínio

### `FinalprojContext`

Herdado de **`IdentityDbContext<IdentityUser>`** — tabelas Identity + domínio.

**Conjuntos principais:** `Paiol`, `PaiolDocumentoExtra`, `Perfil`, `Funcionario`, `FuncionarioDocumentoExtra`, `Cliente`, `ClienteDocumentoExtra`, `Produto`, `EntradaPaiol`, `PaiolAcesso`, `SaidaPaiol`, `Encomenda`, `EncomendaItem`, `Reserva`, `Servico` (+ filhos), `LogSistema`, `RefreshToken`.

### Relacionamentos e regras EF (resumo)

- **Encomenda** → **Cliente** (Restrict). **EncomendaItem** → cascade com encomenda; **Produto** Restrict.
- **Reserva** → **Encomenda** cascade; **Produto** Restrict; índice único `(EncomendaId, ProdutoId)`.
- **Servico** → **Encomenda** Restrict; **índice único em `EncomendaId`** (1:1 lógico). **Cliente** Restrict; **ResponsavelTecnico** (funcionário) SetNull.
- **ServicoEquipa**: único `(ServicoId, FuncionarioId)`.
- **Paiol**: decimais com precisão explícita (`LimiteMLE` 18,2; coordenadas 18,14). **Servico**: lat/lng 18,9.
- **Produto**: `NEMPorUnidade` 18,4; **EntradaPaiol/SaidaPaiol/EncomendaItem/Reserva**: quantidades 18,4.
- **RefreshToken**: índices em `TokenHash` e `(UserId, RevokedAtUtc)`.

### Entidades de negócio (papel)

- **Produto**: NEM por unidade, família de risco, grupo de compatibilidade ADR, filtros técnicos — alimenta regras de paiol e stock.
- **Paiol**: limite MLE, perfil de risco, estado, licença PSP, coordenadas.
- **EntradaPaiol / SaidaPaiol**: stock e rastreio; saída pode referenciar `EntradaPaiolId` (FIFO na preparação).
- **Encomenda + Reserva**: vínculo temporal entre pedido e stock reservado.
- **Servico**: evento no terreno; **ServicoLicenca** inclui `OrigemRegistoServicoLicenca` (pedido vs autorização definitiva); **ServicoDistanciaSeguranca** para registos no local.

---

## 4. Segurança

### Autenticação

- **Identity** para utilizadores e passwords; **email confirmado** exigido para sign-in (configuração Identity).
- **API**: autenticação por **JWT** (claims: `NameIdentifier`, `Email`, `nome`, `ClaimTypes.Role` por role).
- **`AuthController`**: `POST /api/auth/login`, `POST /api/auth/registar-primeiro-utilizador` (só se não existir utilizador), `GET /api/auth/existem-utilizadores`, `GET /api/auth/me`, `GET /api/auth/confirm-email`, `POST /api/auth/refresh`, `POST /api/auth/logout`.

### Refresh tokens

- Token em claro **só no cliente**; na BD guarda-se **SHA-256** (`TokenHash`).
- **Rotação** em `POST /api/auth/refresh`: invalida o refresh usado (`RevokedAtUtc`) e emite novo par access+refresh.
- **Logout**: revoga refresh por hash.

### Autorização

- **Políticas** (`PoliticasAutorizacao`): Admin; gestão de clientes, produtos, encomendas (incl. apagar), serviços (incl. apagar), armazém (ver stock vs gerir), funcionários — cada uma mapeada a conjuntos de roles (`ConstantesRoles`: Admin, Gestor, Comercial, Armazém).
- **`GET /api/auth/me`** devolve também **`permissions`** derivadas das roles (strings tipo `encomendas.gerir`, `armazem.stock`) para o frontend alinhar UI com o backend.

### JWT Bearer e API

- Desafio JWT customizado devolve **401 JSON** (sem redirect HTML).
- CORS com credenciais alinhado ao uso de **sessão** para rascunho de encomenda.

Documentação alinhada: [`docs/backend/ROLES-E-PERMISSOES.md`](../backend/ROLES-E-PERMISSOES.md), [`docs/api/API.md`](../api/API.md).

---

## 5. API

**Controllers** (todos sob rotas `api/...`, maioritariamente JWT):

| Controller | Função principal |
|------------|------------------|
| `AuthController` | Login, refresh, me, primeiro utilizador, confirmação email |
| `AdminController` | Utilizadores, roles, stats, logs (`Policy` Admin) |
| `HomeController` | Stats, dashboard gestor, perfil, tema, passwords |
| `ClientesController` | CRUD clientes + documentos |
| `FuncionariosController` | CRUD funcionários, documentos, associação a contas |
| `ProdutosController` | Catálogo / gestão de produtos |
| `PaiolController` | Paióis, acessos por role, documentos |
| `EntradaPaiolController` | Registo de entradas |
| `SaidaPaiolController` | Saídas avulsas |
| `EncomendasController` | Lista paginada, detalhe, rascunho (sessão), submeter, editar, aceitar/rejeitar, preparar, registar preparação, concluir |
| `ServicosApiController` | CRUD serviços, licenças, uploads, dados de formulário |

### Ciclo de vida da entidade principal: **Encomenda**

1. **Rascunho**: `Session` guarda JSON `EncomendaDraftViewModel`; endpoints adicionam/removem itens.
2. **Submeter** (`POST .../submeter`): cria `Encomenda` **Pendente**, itens e **Reservas** por produto; limpa rascunho; log `ENCOMENDA_CRIADA`.
3. **Aceitar** (`POST .../aceitar`): só Pendente → **Aceite**; regista `FuncionarioAceiteUserId`.
4. **Rejeitar**: Pendente ou Aceite → **Rejeitada**; remove **Reservas**; motivo opcional.
5. **Editar** (`PUT`): só Pendente ou Aceite; substitui itens e reservas.
6. **Preparar** (`GET/POST`): só **Aceite**; `POST registar-preparacao` chama serviço de domínio → saídas FIFO, estado → **Em preparação**.
7. **Concluir** (`POST .../concluir`): só **Em preparação** → **Concluída**, `DataConclusao`, remove **Reservas** (material efetivamente consumido nas saídas).

Depois disso, um **Servico** pode ser criado apontando para essa encomenda (única), conforme `ServicoService` e restrições de estado.

---

## 6. Persistência e migrações

- **Motor**: **Microsoft SQL Server** (provider `Microsoft.EntityFrameworkCore.SqlServer`).
- **Migrações**: pasta `Migrations/` na raiz do projeto backend, com histórico desde a criação inicial até alterações recentes (ex.: refresh tokens, `ServicoLicenca.OrigemRegisto`, tema de perfil, ajustes de precisão de coordenadas, evolução serviços/encomendas).
- **Arranque**: `MigrateAsync()` aplica migrações automaticamente; existe **SQL defensivo** em `Program.cs` para `OrigemRegisto` em `ServicoLicencas` caso o snapshot/BD estejam desincronizados.

---

## 7. Convenções e decisões técnicas relevantes

1. **Decimais invariantes**: `DecimalInvariantModelBinder` para `decimal`/`decimal?` — evita erros de cultura em coordenadas e campos numéricos em query string.
2. **Uploads**: `IDocumentoStorageService` grava sob `wwwroot`, extensões `.pdf`, `.jpg`, `.jpeg`, `.png`, tamanho máximo configurável; `InvalidOperationException` de tamanho → **400** com mensagem.
3. **Precisão SQL**: `HasPrecision` explícita para NEM, quantidades, coordenadas e limites MLE.
4. **Estados de encomenda em string + enum** (`EstadoEncomenda`) para conversão tipada sem mudar o esquema legado.
5. **Auditoria**: `ILogSistemaService` para ações relevantes (encomendas, saídas, etc.).
6. **Sessão + JWT**: rascunho de encomenda no servidor exige cookie de sessão com **SameSite=None** e **Secure** + CORS com **credentials** no cliente.
7. **API-only e erros JSON**: middleware para `/api` garante respostas JSON em erro; JWT não redireciona para HTML.
8. **Frontend**: TanStack Query com `staleTime` curto e retry condicionado; refresh proativo de JWT no `UserContext`; `safeParseJson` evita parse de HTML como JSON.
9. **Seed**: roles e contas de demonstração por email (`SeedUsers:Password`); migração de role antiga "Técnico" para "Gestor".
10. **Centralização de endpoints no client:** o mesmo método + caminho HTTP não deve repetir `fetch`/`apiPath` em várias páginas; extrair para `apps/web/app/lib/*Api.ts` (ver regra em `apps/web/.cursor/rules` e `docs/frontend/VERIFICACAO-APIS-UTILIZADAS.md`).
11. **Testes de domínio (backend):** projeto **`Finalproj.Tests`** (xUnit, EF InMemory) cobre `EncomendaService` e `StockDisponivelService` — ver **`docs/backend/TESTES-DOMINIO.md`**.

---

## Documentos relacionados

| Tema | Documento |
|------|-----------|
| Visão resumida / arranque | [`PROJETO.md`](PROJETO.md) |
| API HTTP | [`../api/API.md`](../api/API.md) |
| Roles e políticas | [`../backend/ROLES-E-PERMISSOES.md`](../backend/ROLES-E-PERMISSOES.md) |
| Controllers e DTOs | [`../backend/ANALISE-CONTROLLERS-ENTIDADES-DTO.md`](../backend/ANALISE-CONTROLLERS-ENTIDADES-DTO.md) |
| Serviços (camada) | [`../../Services/README.md`](../../Services/README.md) |
| Frontend / localStorage | [`../frontend/AUDITORIA-LOCALSTORAGE.md`](../frontend/AUDITORIA-LOCALSTORAGE.md) |
| Backups automáticos (SQL) | [`../backend/BACKUPS-AUTOMATICOS.md`](../backend/BACKUPS-AUTOMATICOS.md) |
| APIs usadas pelo client | [`../frontend/VERIFICACAO-APIS-UTILIZADAS.md`](../frontend/VERIFICACAO-APIS-UTILIZADAS.md) |
| Testes unitários (domínio) | [`../backend/TESTES-DOMINIO.md`](../backend/TESTES-DOMINIO.md) |
