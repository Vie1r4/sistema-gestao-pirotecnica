# PIROFAFE — Guia em linguagem simples (para programadores iniciantes)

Este texto explica **o que é** o projeto, **como está organizado** e **porquê** se faz assim. Não é preciso dominar todas as tecnologias para perceber a ideia geral.

**Atualização:** maio de 2026 — roles em [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md); pasta `apps/web/app/lib`, refresh de sessão.

---

## 1. O que é este projeto?

**PIROFAFE** é uma aplicação de **gestão** para contexto pirotécnico: armazéns (paióis), produtos, encomendas, serviços no terreno, clientes, funcionários, etc.

Na prática são **dois programas** que trabalham em conjunto:

1. Um **servidor** (backend) que guarda dados numa **base de dados** e expõe **regras de negócio**.
2. Um **site / aplicação web** (frontend) que as pessoas usam no **browser** (Chrome, Edge, etc.).

Juntos formam o que se chama uma aplicação **full-stack**: há “frente” (o que vês) e “trás” (servidor e dados).

---

## 2. Porque é que existem duas partes (backend e frontend)?

### Backend (`src/Finalproj.*`)

- **ASP.NET Core** (C#, .NET 8) — API em `src/Finalproj.Api`.
- Corre como um **serviço** (por exemplo na porta `7225` em desenvolvimento).
- **Valida**, **calcula** e **grava** na base de dados.
- Expõe uma **API REST** com respostas em **JSON**.

### Frontend (`apps/web/`)

- **Next.js**, **TypeScript** e **React**.
- Porta **3000** em desenvolvimento — ecrãs, formulários, mapas.
- Pedidos HTTP concentrados em **`apps/web/app/lib/*Api.ts`** e `apiConfig.ts`.

---

## 3. Como é que as duas partes “falam”?

O browser faz pedidos a `https://localhost:7225/api/...` (ou `NEXT_PUBLIC_API_URL`). O backend responde em JSON.

**CORS:** o backend aceita o origin do frontend (ex.: `http://localhost:3000`).

---

## 4. Autenticação — login e token

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
| `src/Finalproj.Domain/` | Entidades, constantes |
| `src/Finalproj.Application/` | Serviços, DTOs |
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
| [README.md](README.md) | Índice |
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

*Dica:* pergunta **“backend ou frontend?”** e **“já existe num `*Api.ts`?”** antes de procurar no código.
