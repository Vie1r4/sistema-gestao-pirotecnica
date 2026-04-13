# PIROFAFE — Sistema de Gestão Pirotécnica

Aplicação full-stack: **backend** ASP.NET Core 8 (API REST + Identity) e **frontend** Next.js 16 (pasta `client/`).

## Documentação

**Índice central:** [**Docs/README.md**](Docs/README.md) — visão geral, API, frontend, backend e configuração.

| Área | Ligação rápida |
|------|----------------|
| **Iniciantes (linguagem simples)** | [Docs/informacoes-basicas/guia-iniciantes.md](Docs/informacoes-basicas/guia-iniciantes.md) |
| API (referência) | [Docs/api/API.md](Docs/api/API.md) |
| Projeto (stack, domínio) | [Docs/visao-geral/PROJETO.md](Docs/visao-geral/PROJETO.md) |
| Frontend (auditorias, pendências) | [Docs/frontend/](Docs/frontend/) |

## Documentação interativa (Swagger)

Com o backend a correr em **Development**, a UI Swagger está em `/swagger` (ex.: [https://localhost:7225/swagger](https://localhost:7225/swagger)) — autenticação JWT com **Authorize** após `POST /api/auth/login`.

Em **Production** o Swagger fica **desligado** (não expor a superfície da API).

## Estrutura

- **Raiz do repositório:** backend (Controllers, Data, Models, Services).
- **`client/`:** frontend Next.js (React 19, TanStack Query, Tailwind, Leaflet).
- **`Finalproj.Tests/`:** testes unitários xUnit (domínio: `EncomendaService`, `StockDisponivelService` com EF InMemory). Ver [Docs/backend/TESTES-DOMINIO.md](Docs/backend/TESTES-DOMINIO.md).

## Testes (backend)

```bash
dotnet test Finalproj.Tests/Finalproj.Tests.csproj
```

## Pré-requisitos

- .NET 8 SDK
- Node.js 18+ (para o frontend)
- SQL Server (LocalDB ou instância) para o backend

## Configuração do Backend

### Segredos (obrigatório)

O JWT e credenciais de email **não** devem estar em `appsettings.json`. Use **User Secrets** em desenvolvimento:

```bash
cd C:\Users\shovi\source\repos\Finalproj
dotnet user-secrets set "Jwt:Secret" "sua-chave-secreta-longa-com-pelo-menos-32-caracteres"
dotnet user-secrets set "Jwt:Issuer" "Finalproj"
dotnet user-secrets set "Jwt:Audience" "FinalprojUsers"
# Opcional (email):
dotnet user-secrets set "Email:SmtpHost" "smtp.gmail.com"
dotnet user-secrets set "Email:SmtpUser" "seu-email@gmail.com"
dotnet user-secrets set "Email:SmtpPassword" "sua-password-app"
dotnet user-secrets set "Email:From" "seu-email@gmail.com"
```

Em **produção**, use variáveis de ambiente ou Azure Key Vault (por exemplo `Jwt__Secret`, `Cors__AllowedOrigins`).

### CORS

Por defeito o backend aceita origens `http://localhost:3000` e `https://localhost:3000`. Em produção, defina:

- `Cors:AllowedOrigins` em appsettings ou variável de ambiente (ex.: `https://app.seudominio.pt`).

### Logs e correlation id

- Cada pedido HTTP recebe um **`X-Correlation-Id`** (header de resposta; opcional no pedido). Os logs de consola incluem **scopes** com `CorrelationId` e o tempo do pedido em milissegundos.
- Detalhes: [Docs/backend/OBSERVABILIDADE-HTTP.md](Docs/backend/OBSERVABILIDADE-HTTP.md).

### Backups automáticos da base de dados

O backend inclui um serviço automático de backups SQL Server (`BackgroundService`) com execução diária às **19:00**.

- Destino: ficheiros `.bak` na raiz do projeto.
- Configuração: secção `Backups` no `appsettings.json`.
- Documentação detalhada: [Docs/backend/BACKUPS-AUTOMATICOS.md](Docs/backend/BACKUPS-AUTOMATICOS.md).

## Executar

### 1. Backend

```bash
cd C:\Users\shovi\source\repos\Finalproj
dotnet run
```

A API fica em `https://localhost:7225` (ou a porta em `Properties/launchSettings.json`). Em Development, use o Swagger em `/swagger` para testar endpoints.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). O frontend usa por defeito `https://localhost:7225` como base da API. Para alterar, crie `.env.local`:

```
NEXT_PUBLIC_API_URL=https://localhost:7225
```

Em produção, defina `NEXT_PUBLIC_API_URL` com a URL da API.

## Primeiro utilizador

Se não existir nenhum utilizador, ao aceder ao frontend será redirecionado para **Registar primeiro utilizador**. Esse utilizador recebe a role Admin.
