# Arquitetura

Visão técnica do PIROFAFE (backend + frontend). **Maio 2026.**

---

## O que é

Sistema de gestão pirotécnica: paióis e stock (MLE/NEM, FIFO), catálogo de produtos, encomendas com reservas, serviços no terreno (1:1 com encomenda concluída), clientes, funcionários e documentos.

- **Backend:** `src/Finalproj.*` — API ASP.NET Core 8, EF Core, SQL Server, Identity + JWT.
- **Frontend:** `apps/web/` — Next.js 16, React 19, TanStack Query, Tailwind.

---

## Camadas backend

| Projeto | Conteúdo |
|---------|----------|
| `Finalproj.Api` | Controllers, `Program.cs`, middleware, model binders HTTP (`UploadedFileContent`), dropdowns |
| `Finalproj.Application` | Serviços de aplicação, DTOs, validadores FluentValidation — **sem** `Microsoft.AspNetCore.*` |
| `Finalproj.Domain` | Entidades, constantes, read models (`ReadModels/`); **parâmetros e regras legais em `Legislacao/`**; contratos em `Interfaces/` (`IUnitOfWork`, `IGestorAnalyticsRepository`) e `Interfaces/Repositories/` (`Finalproj.Domain.Interfaces.Repositories`) |
| `Finalproj.Infrastructure` | EF `FinalprojContext`, email, `ArquivosRaizService`, `DocumentoStorageService`, backups, `LogSistemaService` |

Serviços de negócio relevantes: `EncomendaService` (preparação FIFO), `StockDisponivelService`, `ServicoService`, `DocumentoStorageService` (uploads em `PirofafeData/Uploads` via `IArquivosRaizService`; validação extensão + magic bytes). Uploads na Application usam `UploadedFileContent` (bytes + nome); a API converte `IFormFile` na fronteira (`FormFileMapper` / model binder).

### Dados e cálculos legais (`Finalproj.Domain/Legislacao/`)

Tudo o que é **definido por lei** e muda com frequência (ADR, RFACEPE, Regulamento PSP) está concentrado neste módulo, para ser de fácil acesso quando a legislação for alterada:

- **`ParametrosLegaisPirotecnia`** — **fonte única** dos valores numéricos e matrizes: distâncias mínimas de segurança, limite de MLE do grupo C com G (50 kg), limiares de ocupação do paiol (80% / 90%), hierarquia de divisões de risco, matriz de compatibilidade de grupos (ADR 7.2.5) e matriz licença-paiol → famílias aceites (ADR 7.5.2.2). **Alterar a lei = alterar só aqui.**
- **`MotorValidacaoPaiol`** — valida entradas no paiol (licença, grupos, lotação); consome os parâmetros acima.
- **`RegrasLicencaPaiol`** — compatibilidade licença ↔ família do produto.
- **`ConstantesDistanciaSeguranca`** — nomes dos tipos de referência regulamentares (habitações, estrada, etc.); **não** é a fonte dos valores gravados em serviços.
- **`CalculoAreaSegurancaPublico`** — raio ao público de uma zona = **máximo** das distâncias de segurança ao público dos produtos alocados (campo obrigatório do catálogo). Bombas 100 m + caixas 50 m → 100 m. O **serviço** usa o **máximo entre zonas** (ex.: zonas 80 m e 120 m → 120 m).

Ao gravar zonas (`ServicoService.GravarZonasAsync`), o backend sincroniza `ServicoZonaDistanciaSeguranca` e `ServicoDistanciaSeguranca` com esses máximos (`DistanciaMinima_m` = `DistanciaMedida_m`). O PUT manual `.../distancia-seguranca/{id}` mantém-se por compatibilidade, mas os valores são repostos no próximo save de zonas; a UI não expõe edição manual.

O namespace `Finalproj.Domain.Legislacao` está nos `global using` de todos os projetos.

---

## Frontend

- Chamadas HTTP em `apps/web/app/lib/*Api.ts` e `auth.ts` / `authApi.ts`.
- Utilizador e permissões: `GET /api/auth/me` → `UserContext`.
- Rotas protegidas: `routePermissions.ts` + `ProtectedRoute`.
- Dados de negócio **só via API** (TanStack Query). Ver [SEGURANCA.md](SEGURANCA.md).

---

## Domínio (resumo)

- **Paiol** + entradas/saídas, documentos (visíveis para todos os perfis com permissão de armazém).
- **Produto** — NEM, classificação, compatibilidade.
- **Encomenda** — estados (Pendente → Aceite → Em preparação → Concluída / Rejeitada), itens, **reservas**.
- **Servico** — equipa, licenças, distâncias, documentos; `EncomendaId` único; **zonas de lançamento** (`ServicoZonaLancamento` com linhas de material/horário e distâncias por zona); campos para PSP (`NomeEvento`, `CoordenadorPirotecnico`, CRED no funcionário, `Categoria` no produto, `Nome` na encomenda).
- **Cliente**, **Funcionario**, **RefreshToken**, **LogSistema**.

Regras centrais: stock disponível = saldo por lote não esgotado (SQL) − saídas avulsas − reservas; preparação só em encomenda Aceite, saídas FIFO por data de fabrico e data de entrada. **Clientes e funcionários:** eliminação lógica (`EliminadoEm`) — a ficha sai das listagens e do GET detalhe, mas o registo e o nome permanecem nas encomendas/serviços (`disponivel: false` na API; UI mostra aviso em vez de link). Entradas no paiol passam por `MotorValidacaoPaiol` (licença, grupos ADR 7.2.5, lotação); cobertura HTTP em `Finalproj.IntegrationTests/Paiols/EntradaPaiolCompatibilidadeTests.cs`. Serviço exige repartição do material da encomenda por zonas (validação FluentValidation + `ServicoService`); geração de declaração PSP via `GeradorDeclaracaoPspService` (ver `Docs/documentacao-regulatoria/`).

---

## Autorização

Roles: **Admin**, **Gestor**, **Comercial**, **Armazém**. Políticas em `PoliticasAutorizacao`; detalhe em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

Auth: JWT + refresh HttpOnly; endpoints em `AuthController`. Listagem completa de recursos: [API.md](API.md).

---

## Pipeline HTTP (backend)

1. HSTS (não-Development) → middleware de erros JSON em `/api/*`.
2. HTTPS (prod) → static files → routing → CORS → session → auth → controllers.
3. `RequestDiagnosticsMiddleware` — `X-Correlation-Id`, latência (ver [OPERACOES.md](OPERACOES.md)).
4. Arranque: `MigrateAsync` (inclui evolução de schema, ex. `ServicoPaiolDataRegisto` para KPIs do gestor), seed de roles, opcional seed de utilizadores (`SeedUsers:Enabled=false` por defeito).

---

## API — módulos

| Prefixo | Função |
|---------|--------|
| `/api/auth` | Login, refresh, me, primeiro utilizador |
| `/api/paiol` | Paióis, stock, movimentos, entradas/saídas |
| `/api/produtos` | Catálogo |
| `/api/encomendas` | Rascunho sessão, submeter, aceitar, preparar, concluir |
| `/api/servicos` | Serviços, licenças, documentos |
| `/api/clientes`, `/api/funcionarios` | CRUD + documentos |
| `/api/admin` | Utilizadores, backups |
| `/api/home` | Stats, perfil, preferências |

Paginação habitual: `pagina`, `itensPorPagina`; resposta com `totalRegistos`.

---

## Stock FIFO — implementação e dívida técnica

**Implementado (2026):** `StockDisponivelService` usa `SumSaldoDisponivelPorProdutoAsync` (saldo por lote não esgotado − saídas avulsas − reservas). `EncomendaService.RegistarPreparacaoAsync` usa `ListComSaldoParaPreparacaoAsync`, que devolve read models `EntradaPaiolSaldoPreparacao` (`src/Finalproj.Domain/ReadModels/`) ordenados FIFO (`DataFabrico ?? DataEntrada`, depois `DataEntrada`). Agregação e filtro `saldo > 0` no EF/SQL Server; testes de domínio em `StockDisponivelServiceTests` e `EncomendaServiceTests`.

**Dívida técnica conhecida (não bloqueia merge, bloqueia produção em escala/concorrência):**

| Gap | Descrição | Endurecimento sugerido |
|-----|-----------|------------------------|
| **Índices FIFO** | `EntradasPaiol` só tem índices em `PaiolId` e `ProdutoId`; ordenação composta por data pode forçar sort costoso em volume. | Migration com índice composto (ex. `PaiolId`, `ProdutoId`, `DataFabrico`, `DataEntrada`); validar plano com `.ToQueryString()` / `EXPLAIN` em SQL Server. |
| **Concorrência na preparação** | `RegistarPreparacaoAsync` lê saldos (`AsNoTracking`) e grava saídas sem transacção serializável, lock pessimista ou `RowVersion`. Dois operadores podem over-alocar o mesmo lote. | Transacção + `UPDLOCK`/`HOLDLOCK` nas entradas afectadas, ou validação atómica pós-gravação. |
| **Saídas avulsas vs FIFO por lote** | Saídas com `EntradaPaiolId == null` reduzem stock global (`StockDisponivelService`) mas **não** reduzem saldo por lote em `ListComSaldoParaPreparacaoAsync`. Soma dos lotes pode exceder stock global após saídas manuais. | Pro-rata de avulsas nos lotes, proibir saída avulsa quando há stock lotado, ou validar `SUM(lotes) − avulsas ≥ quantidade` antes de alocar. |
| **Testes vs SQL real** | Suite unitária usa EF In-Memory; não valida tradução T-SQL (`COALESCE`, subqueries correlacionadas). | Teste de integração opcional contra SQL Server LocalDB para queries de stock/FIFO. |

---

## Convenções

- Decimais invariantes no binding (`DecimalInvariantModelBinder`).
- Documentos em `PirofafeData/Uploads` (portátil, relativo ao `ContentRootPath`); paths na BD permanecem relativos. `wwwroot` da API contém apenas `favicon.ico`; `DadosLocais:UsarFallbackWwwroot` está **desactivado** (sem leitura legada em `wwwroot/Documentos`). Path traversal validado em `ArquivosRaizService` / `DocumentoStorageService`.
- Erros `/api/*` em JSON (401/403/404/500); 500 inclui `correlationId` quando aplicável.
