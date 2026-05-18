# Contribuir para o PIROFAFE

Obrigado por contribuir. Este documento resume como configurar o ambiente, as convenções e o que verificar antes de abrir um pull request.

## Pré-requisitos

- **.NET 8 SDK**
- **Node.js 20+** e npm
- **SQL Server** (LocalDB ou instância) para desenvolvimento com base real
- Git

## Configuração inicial

1. Clonar o repositório e abrir a solução `Finalproj.sln`.
2. Configurar user-secrets do backend (JWT obrigatório):

```bash
dotnet user-secrets set "Jwt:Secret" "sua-chave-secreta-longa-com-pelo-menos-32-caracteres" --project src/Finalproj.Api/Finalproj.Api.csproj
dotnet user-secrets set "Jwt:Issuer" "Finalproj" --project src/Finalproj.Api/Finalproj.Api.csproj
dotnet user-secrets set "Jwt:Audience" "FinalprojUsers" --project src/Finalproj.Api/Finalproj.Api.csproj
```

3. Frontend — em `apps/web/`, criar `.env.local` se necessário:

```
NEXT_PUBLIC_API_URL=https://localhost:7225
```

4. Instalar dependências do frontend: `cd apps/web && npm ci`

## Executar em desenvolvimento

**Backend** (raiz do repo):

```bash
dotnet run --project src/Finalproj.Api/Finalproj.Api.csproj
```

**Frontend**:

```bash
cd apps/web
npm run dev
```

Swagger (só Development): `https://localhost:7225/swagger`

## Estrutura do repositório

```
Finalproj/
├── src/
│   ├── Finalproj.Api/          # HTTP, controllers, Program.cs
│   ├── Finalproj.Application/  # Serviços, DTOs, validadores
│   ├── Finalproj.Domain/       # Entidades, interfaces de repositório
│   └── Finalproj.Infrastructure/ # EF Core, repositórios, email, ficheiros
├── apps/web/                   # Next.js 16 (App Router)
│   └── app/lib/*Api.ts         # Chamadas à API por domínio
├── Finalproj.Tests/            # Testes unitários (domínio)
├── Finalproj.IntegrationTests/ # Testes HTTP (auth, 401/403, IDOR)
└── Docs/                       # 8 ficheiros — ver Docs/README.md
```

## Convenções de nomenclatura

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| C# classes/DTOs | PascalCase | `FuncionarioResponseDto` |
| C# métodos | PascalCase | `GetFuncionarioAsync` |
| Rotas API | kebab-case plural | `/api/funcionarios` |
| Ficheiros React | PascalCase.tsx | `FuncionarioCard.tsx` |
| Libs API (TS) | camelCase.ts | `funcionariosApi.ts` |
| Funções TS | camelCase | `fetchFuncionarios` |

Segunda utilização do mesmo endpoint → função em `apps/web/app/lib/<dominio>Api.ts`.

## Testes

```bash
# Unitários (domínio)
dotnet test Finalproj.Tests/Finalproj.Tests.csproj

# Integração (API)
dotnet test Finalproj.IntegrationTests/Finalproj.IntegrationTests.csproj

# Frontend
cd apps/web
npm test
npm run test:e2e
```

### Testes E2E (Playwright)

Na primeira máquina ou após atualizar o Playwright:

```bash
cd apps/web
npx playwright install chromium
npm run test:e2e
```

- O comando `test:e2e` arranca o dev server automaticamente (ver `playwright.config.ts`).
- **`E2E_BASE_URL`**: URL do frontend (default `http://127.0.0.1:3000`). Útil se já tiveres `npm run dev` noutra porta.
- **`E2E_API_URL`** (opcional): para testes manuais contra API real; no **CI** os specs usam **mocks de rede** (`page.route`) — não é necessário SQL Server no GitHub Actions.
- **Autenticação nos testes:** usar [`apps/web/tests/e2e/helpers/auth.ts`](apps/web/tests/e2e/helpers/auth.ts) (`injectE2eAuth`, `mockAuthMeAdmin`). **Não** guardar JWT em `localStorage`.

## Checklist de pull request

| Item | Obrigatório? |
|------|----------------|
| `dotnet build` sem erros | Sim |
| `dotnet test` (unit + integração) | Sim |
| `npm run typecheck`, `npm run lint`, `npm test` em `apps/web/` | Sim |
| Novo endpoint sensível tem teste **401** e/ou **403** | Sim |
| Sem secrets em ficheiros versionados | Sim |
| `Docs/API.md` atualizado se a API mudou | Se aplicável |
| Migração EF se o modelo mudou | Se aplicável |
| Sem `console.log` de debug no frontend | Sim |

Ver o índice [Docs/README.md](Docs/README.md) (testes, segurança, roles).

## Regra de ouro (segurança)

Todo endpoint novo ou alterado que exponha dados por ID ou ficheiros deve incluir, no mesmo PR, pelo menos um teste de integração que prove **401** (sem token) ou **403** (role incorreta).
