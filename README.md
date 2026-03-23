# PIROFAFE — Sistema de Gestão Pirotécnica

Aplicação full-stack: **backend** ASP.NET Core 8 (API + MVC + Identity) e **frontend** Next.js 16 (pasta `client/`).

## Documentação da API

- **Swagger (UI interativa):** Com o backend a correr, abra [https://localhost:7225/swagger](https://localhost:7225/swagger). Inclui autenticação JWT (use **Authorize** após obter um token em `POST /api/auth/login`).
- **Documentação em texto:** [Docs/API.md](Docs/API.md) — base URL, autenticação, tabela de recursos, paginação, códigos de resposta e exemplo com cURL.

## Estrutura

- **Raiz do repositório**: Backend (Controllers, Data, Models, Services, Views).
- **client/**: Frontend Next.js (React 19, TanStack Query, Tailwind, Leaflet).

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

## Executar

### 1. Backend

```bash
cd C:\Users\shovi\source\repos\Finalproj
dotnet run
```

A API fica em `https://localhost:7225` (ou a porta em `Properties/launchSettings.json`). **Swagger:** [https://localhost:7225/swagger](https://localhost:7225/swagger) — documentação interativa com suporte a JWT.

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

## Documentação adicional

- **[Docs/API.md](Docs/API.md)** — Documentação da API (recursos, autenticação, paginação, exemplos).
- **client/Docs/** — Auditoria localStorage vs API, verificação de endpoints, o que falta fazer.
