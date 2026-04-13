# PIROFAFE — Documento do Projeto

Visão geral, stack técnica, domínio, segurança, API e convenções do sistema de gestão pirotécnica.

**Última revisão:** março de 2026 (alinhada à estrutura atual do repositório: client `lib/*Api`, backups automáticos).

---

## 1. Visão geral

O **PIROFAFE** é uma aplicação **full-stack** para gestão operacional e administrativa de atividades pirotécnicas:

- **Gestão de armazéns/paióis** — carga, limites MLE/NEM, acessos por cargo (role).
- **Catálogo de produtos** — classificação de risco, compatibilidade, calibres, NEM por unidade.
- **Encomendas** — criação, aceitação, preparação com stock (FIFO) e conclusão.
- **Serviços no terreno** — ligados a encomendas concluídas; equipa, licenças, distâncias de segurança.
- **Clientes e funcionários** — com documentos anexos e integração a contas de utilizador (Identity).
- **Gestão documental** — upload e download de ficheiros (paióis, serviços, clientes, funcionários).

A **raiz do repositório** contém o **backend** (ASP.NET Core). O **frontend** está na pasta **`client/`** (Next.js) e consome a API via JWT.

---

## 2. Stack e arquitetura

### Backend

- **ASP.NET Core 8** — API REST; sem UI server-side (a interface é toda no frontend Next.js).
- **Entity Framework Core** com **SQL Server** para persistência.
- **Autenticação** — JWT para `/api/*`; refresh token com rotação e revogação.
- **Swagger** — documentação interativa em `/swagger` com suporte a Bearer token (**apenas ambiente Development**; em produção fica desligado).
- **FluentValidation** — validação de DTOs com mensagens em português.

No arranque (`Program.cs`):

- Aplicação de **migrações** (`Database.MigrateAsync()`).
- **Seed de roles** (Admin, Armazém, Técnico, Comercial) em `Data/SeedRoles.cs`.
- Resposta **401 em JSON** para a API (sem redirect para login).
- CORS configurado para origens do frontend (ex.: `http://localhost:3000`).

### Frontend

- **Next.js** (pasta `client/`) — App Router, React 19, TanStack Query v5, Tailwind CSS 4, Leaflet, Recharts, TanStack Table, Zustand (toasts).
- Comunicação com a API em `https://localhost:7225` (configurável via `NEXT_PUBLIC_API_URL`); `client/app/lib/apiConfig.ts` expõe `getApiBaseUrl()` e `apiPath()` para montar URLs.
- **Chamadas HTTP** concentradas em `client/app/lib/*Api.ts` e módulos relacionados (`encomendasApi`, `paiolApi`, `produtosApi`, `servicosApi`, `funcionariosApi`, `entradaPaiolApi`, **`saidaPaiolApi`**, **`authApi`** — login, primeiro utilizador, `existem-utilizadores`, `/me`, etc.). `auth.ts` trata apenas tokens locais, refresh e logout.
- Autenticação via access token + refresh token; **`UserContext`** obtém o utilizador com `GET /api/auth/me` (via `authApi`) e agenda renovação do JWT antes de expirar.
- Dados de negócio vêm da API (não de localStorage), exceto estado de UI (tema, etc.) e tokens de sessão — ver `Docs/frontend/AUDITORIA-LOCALSTORAGE.md`.
- **CI:** workflow em `.github/workflows/client-ci.yml` (typecheck, lint, testes Vitest em paralelo, build, Playwright E2E em `main`/`next`).

### Serviços (backend)

Os serviços estão organizados em **domínio** e **infraestrutura** (detalhes em **`Services/README.md`**):

- **`Services/` (raiz)** — interfaces (`IEncomendaService`, `IStockDisponivelService`, `ILogSistemaService`, `IDocumentoStorageService`, `IEmailSender`) e opções (`DocumentosOptions`).
- **`Services/Domain/`** — regras de negócio:
  - **EncomendaService** — preparação de encomendas (FIFO, validações, saídas de stock).
  - **StockDisponivelService** — stock disponível por produto (entradas − saídas − reservas).
- **`Services/Infrastructure/`** — I/O e cross-cutting:
  - **LogSistemaService** — auditoria em BD.
  - **DocumentoStorageService** — ficheiros em wwwroot.
  - **EmailSender** — envio de email (SMTP ou ficheiro).
  - **IdentityErrorDescriberPt** — mensagens do Identity em português.
  - **DatabaseBackupHostedService** / **IDatabaseBackupService** — agendamento diário de backup SQL Server (ficheiros `.bak` na raiz do projeto; retenção e hora configuráveis em `Backups` no `appsettings`). Detalhes: **`Docs/backend/BACKUPS-AUTOMATICOS.md`**.

Os controllers dependem apenas das interfaces; o DI regista as implementações pelos namespaces `Finalproj.Services.Domain.*` e `Finalproj.Services.Infrastructure.*`.

---

## 3. Domínio — entidades principais

Entidades no `FinalprojContext` (`Data/FinalprojContext.cs`):

- **Paiol** — armazém com limite MLE/NEM, coordenadas (lat/lng com precisão alta).
  - **PaiolAcesso** — acesso por role.
  - **EntradaPaiol** / **SaidaPaiol** — movimentos de stock.
  - **PaiolDocumentoExtra** — documentos anexos.
- **Produto** — catálogo com NEM por unidade, família de risco, grupo de compatibilidade, filtro técnico, calibre.
- **Encomenda** — estado (Pendente, Aceite, Em preparação, Concluída, Rejeitada).
  - **EncomendaItem** — itens e quantidades.
  - **Reserva** — quantidades reservadas por encomenda (estados com reserva).
  - Relação 1:1 com **Servico** (apenas para encomendas concluídas).
- **Servico** — evento no terreno.
  - **ServicoEquipa** — equipa e responsável técnico (requisitos ADR/licença).
  - **ServicoLicenca** — licenças com ficheiros.
  - **ServicoDistanciaSeguranca** — mínimos e medição real.
  - **ServicoDocumentoExtra** — outros documentos.
- **Cliente**, **Funcionario**, **Perfil** — dados e nome de exibição do utilizador.
- **RefreshToken** — refresh tokens (hash em BD; rotação e revogação).
- **LogSistema** — auditoria (ação, userId, userName, JSON, timestamp).

---

## 4. Segurança — autenticação e autorização

### Roles

Definidas em `Data/SeedRoles.cs`: **Admin**, **Armazém**, **Técnico**, **Comercial**.  
Se existirem utilizadores e nenhum tiver Admin, o primeiro utilizador passa a Admin.

### JWT e refresh token

Endpoints em `Controllers/AuthController.cs`:

- `GET /api/auth/existem-utilizadores` — público; indica se há contas (para “registar primeiro utilizador”).
- `POST /api/auth/registar-primeiro-utilizador` — público apenas quando não existem utilizadores; atribui Admin.
- `POST /api/auth/login` — devolve `token` (JWT), `refreshToken`, `expiresAt`, `userName`, `roles`.
- `GET /api/auth/me` — utilizador autenticado (JWT).
- `POST /api/auth/refresh` — renova access token (rotação do refresh token).
- `POST /api/auth/logout` — revoga refresh token.

Refresh tokens são guardados em hash (SHA-256). JWT inclui claims de identificação, email e roles.  
`Jwt:Secret` é obrigatório (mín. 32 caracteres; User Secrets em desenvolvimento).

### Autorização nos endpoints

- Controllers em `/api/*` usam `[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]`.
- Ações restritas usam `[Authorize(Roles = "Admin")]` (ex.: CRUD de entidades, gestão de utilizadores).
- Acesso a paióis filtrado por **PaiolAcesso** (roles do utilizador).

---

## 5. API — módulos e fluxos

Resumo dos recursos. Documentação completa: **Swagger** (`/swagger`, só em Development) e [**`Docs/api/API.md`**](../api/API.md) (tabelas de endpoints, autenticação, paginação, exemplos cURL).

### Auth — `/api/auth`

Registo do primeiro utilizador, login, refresh, logout, `me`. Ver secção 4.

### Paióis — `/api/paiol`

- Lista e detalhe consoante acesso por role (Admin vê todos; outros só paióis com `PaiolAcesso` para as suas roles).
- Ocupação MLE calculada a partir de entradas e saídas.
- **Movimentos** — `GET /api/paiol/movimentos` com `tipo` (Entradas/Saídas), `paiolId`, `pagina`, `itensPorPagina` (ex.: 20).
- CRUD (Admin), documentos extra.

### Produtos — `/api/produtos`

Listagem com filtros; CRUD para Admin.

### Encomendas — `/api/encomendas`

- Rascunho em **sessão** (adicionar/remover itens) antes de submeter.
- `POST /api/encomendas/submeter` — cria Encomenda (Pendente), itens e reservas.
- Transições: aceitar, rejeitar, **registar preparação** (via `IEncomendaService` — FIFO e validações), concluir.
- `PUT /api/encomendas/{id}` — edição em Pendente ou Aceite (recalcula itens e reservas).

### Serviços — `/api/servicos`

- Um serviço por encomenda concluída (índice único).
- Equipa (responsável técnico com ADR e licença operador); licenças e distâncias de segurança; documentos.
- Uploads via `multipart/form-data`; validação de extensão e tamanho (`IDocumentoStorageService`).

### Clientes — `/api/clientes`

CRUD; detalhe com encomendas ativas e **histórico paginado** (`historicoPagina` na query).

### Funcionários — `/api/funcionarios`

CRUD; associação a utilizador Identity; documentos (cartão cidadão, licença, etc.).

### Outros

- **Entrada/Saída paiol** — `/api/entrada-paiol`, `/api/saida-paiol` (registar movimentos).
- **Admin** — `/api/admin` (utilizadores, roles).
- **Home** — `/api/home` (stats, preferências, perfil, alterar password).

---

## 6. Paginação e convenções da API

- **Parâmetros comuns:** `pagina` (default 1), `itensPorPagina` (ex.: 20 em listagens principais).
- **Resposta:** `totalRegistos`, array de itens; totais derivados para “X–Y de N” e “Página K de M”.
- **Frontend:** parâmetro `pagina` na URL; uso de TanStack Query (useQuery) para listagens (ex.: Encomendas, Serviços, Movimentos); sem estado local redundante de página/total.
- **Detalhe de cliente:** histórico de encomendas paginado com `historicoPagina`; controlos de paginação no frontend.

---

## 7. Persistência e migrações

- **Base de dados:** SQL Server (`ConnectionStrings:FinalprojContext` em `appsettings.json`).
- **Migrações EF Core** aplicadas no arranque.
- Migrações relevantes: precisão de coordenadas em paióis; suporte a refresh tokens.

---

## 8. Configuração e execução (desenvolvimento)

### Backend

- **User Secrets** (obrigatório): `Jwt:Secret` (mín. 32 caracteres), `Jwt:Issuer`, `Jwt:Audience`; opcional: Email (SmtpHost, SmtpUser, SmtpPassword, From).
- Comando: `dotnet run` na raiz do repositório.
- **Swagger (Development):** `https://localhost:7225/swagger` (confirmar porta em `Properties/launchSettings.json`).

### Frontend

- `cd client` → `npm install` → `npm run dev`.
- Variável `NEXT_PUBLIC_API_URL` em `.env.local` se a API não estiver em `https://localhost:7225`.

---

## 9. Convenções técnicas

- **Decimais:** lat/lng com precisão alta no EF; `DecimalInvariantModelBinder` para form/query (evitar problemas de cultura).
- **Erros da API:** para `/api/*`, middleware devolve 500 em JSON; JWT em falta/inválido devolve 401 em JSON (sem redirect).
- **Documentos:** guardados em `wwwroot/Documentos/...`; servidos com `Content-Disposition: inline` e content-type adequado.
- **Frontend:** dados de negócio via API; localStorage apenas para token/sessão e estado de UI (tema, etc.). Endpoints repetidos → funções em **`client/app/lib/*Api.ts`** (regra em `client/.cursor/rules` e `client/README.md`). Ver [**`Docs/frontend/`**](../frontend/) para auditoria, APIs utilizadas e padrões.

---

## 10. Melhorias futuras (sugestões)

- **Contratos de API:** DTOs de resposta explícitos em vez de expor entidades EF (evitar acoplamento e overfetch).
- **Observabilidade:** logs estruturados com correlation id; métricas de latência e erros por endpoint.
- **Segurança de ficheiros:** validação MIME/assinatura nos uploads; confirmação de permissões nos downloads (acesso ao paiol/serviço/cliente).
- **Testes:** existem **testes unitários** em `Finalproj.Tests/` (xUnit + EF InMemory) para `EncomendaService` (preparação, FIFO, validações) e `StockDisponivelService` (entradas/saídas/reservas). Ver **`Docs/backend/TESTES-DOMINIO.md`**. Falta alargar a integração (SQL real) e outros módulos (equipa, licenças).
- **Frontend:** manter padrões que evitam loops em `useEffect`; acessibilidade (labels, contraste, teclado) nas novas páginas.
- **Serviços:** continuar a extrair lógica dos controllers para serviços de domínio/aplicação onde reduza duplicação e facilite testes.

---

## Documentação relacionada

| Documento | Conteúdo |
|-----------|----------|
| [**README.md**](../../README.md) (raiz) | Estrutura, pré-requisitos, configuração, execução, primeiro utilizador. |
| [**Docs/README.md**](../README.md) | Índice de toda a documentação em `Docs/`. |
| [**Docs/api/API.md**](../api/API.md) | Documentação da API: base URL, autenticação, tabelas de recursos, paginação, códigos de resposta, cURL. |
| [**Services/README.md**](../../Services/README.md) | Organização dos serviços (Domain vs Infrastructure). |
| [**Docs/visao-geral/ARQUITETURA-E-VISAO-GERAL.md**](ARQUITETURA-E-VISAO-GERAL.md) | Arquitetura técnica aprofundada (Program.cs, domínio EF, segurança, API, frontend). |
| [**Docs/frontend/**](../frontend/) | Auditoria localStorage vs API, verificação de endpoints, tarefas em aberto. |
