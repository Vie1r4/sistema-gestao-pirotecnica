# PIROFAFE — Visão geral

Resumo do sistema, da organização do código e de como backend e frontend se ligam.

**Atualização:** junho de 2026 — roles em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md); índice em [README.md](README.md) (pasta `Docs/`).

---

## 1. O que é o PIROFAFE?

Aplicação de **gestão pirotécnica**: armazéns (paióis), produtos, encomendas, serviços no terreno, clientes, funcionários e documentação regulamentar.

São **duas aplicações** que trabalham em conjunto:

1. **Backend** — servidor que guarda dados na base de dados e aplica regras de negócio.
2. **Frontend** — aplicação web usada no browser.

---

## 2. Backend e frontend

### Backend (`src/Finalproj.*`)

- **ASP.NET Core** (C#, .NET 8) — API em `src/Finalproj.Api`.
- Porta `7225` em desenvolvimento (ver `launchSettings.json`).
- Valida, calcula e grava na base de dados.
- Expõe **API REST** com respostas em **JSON**.

### Frontend (`apps/web/`)

- **Next.js**, **TypeScript** e **React**.
- Porta **3000** em desenvolvimento.
- Pedidos HTTP em **`apps/web/app/lib/*Api.ts`** e `apiConfig.ts`.

---

## 3. Comunicação entre as partes

O browser faz pedidos a `https://localhost:7225/api/...` (ou `NEXT_PUBLIC_API_URL`). O backend responde em JSON.

**CORS:** o backend aceita o origin do frontend (ex.: `http://localhost:3000`).

---

## 4. Autenticação

1. Login → JWT + refresh token.
2. Pedidos seguintes: `Authorization: Bearer ...`
3. **`GET /api/auth/me`** → roles e **permissions** (ex.: `encomendas.gerir`).

**Armazenamento no browser:** dados de negócio **só via API**; access token em memória; refresh em cookie HttpOnly; tema no `localStorage`. Ver [SEGURANCA.md](SEGURANCA.md).

---

## 5. Base de dados

**SQL Server** + **Entity Framework Core** (migrações). Connection string por ambiente, não no Git.

**Backups** automáticos (ficheiros `.bak`) — ver [OPERACOES.md](OPERACOES.md).

---

## 6. Pastas principais

**Backend:**

| Pasta | Função |
|-------|--------|
| `src/Finalproj.Api/` | Controllers, `Program.cs`, middleware |
| `src/Finalproj.Domain/` | Entidades, constantes, `Legislacao/` |
| `src/Finalproj.Application/` | Serviços, DTOs, validadores |
| `src/Finalproj.Infrastructure/` | EF, email, ficheiros, backups |

**Frontend:**

| Pasta | Função |
|-------|--------|
| `app/` | Páginas (App Router) |
| `app/lib/*Api.ts` | Chamadas à API |
| `app/context/` | Utilizador autenticado |
| `app/components/` | UI reutilizável |

---

## 7. Outras escolhas

- **TanStack Query** — cache e estados de carregamento.
- **Vitest** e **Playwright** — testes; ver [TESTES.md](TESTES.md).
- **Swagger** — só em Development (`/swagger`).

---

## 8. Documentação técnica

| Documento | Para quê |
|-----------|----------|
| [README.md](README.md) | Índice da documentação |
| [ARQUITETURA.md](ARQUITETURA.md) | Stack, domínio, módulos |
| [API.md](API.md) | Endpoints e exemplos |
| [README na raiz](../README.md) | Instalar e correr o projeto |

---

## Glossário rápido

| Termo | Significado |
|-------|-------------|
| **API** | URLs com que o frontend pede dados |
| **JWT** | Token de sessão nos pedidos |
| **REST** | API com GET, POST, PUT, DELETE |
| **Migration** | Alteração versionada à BD |
| **DTO** | Objeto só para transporte na API |
| **CORS** | Regras do browser entre portas diferentes |
