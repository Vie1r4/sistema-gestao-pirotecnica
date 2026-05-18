# Auditoria pesada de cibersegurança (pontos críticos)

Data: 2026-04-23  
Âmbito: ambiente **interno** (rede/empresa), backend ASP.NET Core 8 + frontend Next.js.

## Top achados (Crítico / Alto)

### 1) Refresh token exposto ao JavaScript (Crítico)
- **Impacto**: qualquer XSS consegue roubar `refreshToken` e obter sessões persistentes (account takeover).
- **Evidência (antes)**: `apps/web/app/lib/auth.ts` guardava `token` + `refreshToken` em `localStorage` e chamava `POST /api/auth/refresh` com body `{ refreshToken }`.
- **Mitigação aplicada**:
  - refresh token passou para **cookie HttpOnly** emitido pelo backend (`Controllers/AuthController.cs`).
  - o frontend deixou de persistir o refresh token e faz refresh via `credentials: "include"` (`apps/web/app/lib/auth.ts`).
- **Risco residual**: o access token ainda está em `localStorage` (curta duração). Para reduzir mais o impacto de XSS, ideal é access token em memória/cookie HttpOnly.

### 2) IDOR/BOLA em Serviços (Crítico/Alto)
- **Impacto**: utilizador autenticado podia enumerar IDs e descarregar documentos/licenças de outros serviços.
- **Evidência**: endpoints de download em `Controllers/ServicosApiController.cs` não exigiam policy, e `Index`/`Details` estavam acessíveis a qualquer autenticado.
- **Mitigação aplicada**: `Index`, `Details`, `DownloadDocumento` e `DownloadLicenca` passaram a exigir `PoliticasAutorizacao.PodeGerirServicos`.

### 3) Password seed previsível e “backdoor” de roles (Alto)
- **Impacto**: password “Teste123!” em config e fallback no seed aumentavam risco de credenciais fracas/reutilizadas; email hardcoded com permissões máximas é um backdoor.
- **Evidência**:
  - `appsettings.json` tinha `SeedUsers:Password` preenchido.
  - `Data/SeedRoles.cs` fazia fallback para `"Teste123!"` e tinha email hardcoded com permissões máximas.
- **Mitigação aplicada**:
  - `SeedUsers` passou a estar **desativado por defeito** (`SeedUsers:Enabled=false`) e sem password no repo.
  - o seed só cria contas se `SeedUsers:Enabled=true` **e** existir `SeedUsers:Password` via segredos.
  - remoção do email hardcoded; passou a ser configurável (`SeedUsers:AdminEmail`).

### 4) Abuso por brute force / spam de endpoints sensíveis (Alto)
- **Impacto**: brute force a `login`, spam a `forgot-password`, abusos a `refresh/logout`, etc.
- **Mitigação aplicada**:
  - rate limiting por IP com políticas `auth` e `admin` em `Program.cs`.
  - aplicação via `[EnableRateLimiting]` em `Controllers/AuthController.cs` e `Controllers/AdminController.cs`.

### 5) Hardening HTTP ausente (Alto)
- **Impacto**: sem headers básicos, aumenta risco/impacto de clickjacking/MIME sniffing e dificulta mitigação de XSS.
- **Mitigação aplicada**:
  - backend adiciona headers (`Program.cs`) e o frontend adiciona headers equivalentes (`apps/web/next.config.ts`).

### 6) Endpoint destrutivo e resposta com path sensível (Alto)
- **Impacto**: `POST /api/admin/clear-all-data` apaga tudo; endpoint de backup devolvia caminho absoluto do servidor.
- **Mitigação aplicada**:
  - `clear-all-data` só existe em **Development** (`Controllers/AdminController.cs`).
  - `backups/run` deixou de devolver `caminho` absoluto.

## Recomendações P0/P1 adicionais (não implementadas aqui)
- **Access token fora de `localStorage`** (preferência: memória + refresh via cookie HttpOnly).
- **CSRF**: onde existir `credentials: "include"` (sessão do draft de encomendas), considerar anti-CSRF token e/ou reforçar `Origin/Referer` checks.
- **Backups**: guardar em pasta dedicada fora do content root e com permissões restritas + cópia off-host.
- **Logs**: rever `api/admin/logs` (campo `JsonDados`) para garantir que não expõe PII/segredos.

