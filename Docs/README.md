# Documentação PIROFAFE

Índice único. Arranque rápido: [README na raiz](../README.md) · Contribuição: [CONTRIBUTING.md](../CONTRIBUTING.md).

**Última revisão:** maio de 2026.

---

## Documentos

| Documento | Para quê |
|-----------|----------|
| [guia-iniciantes.md](guia-iniciantes.md) | Linguagem simples — o que é o sistema e como as partes ligam |
| [ARQUITETURA.md](ARQUITETURA.md) | Stack, domínio, módulos da API, convenções |
| [API.md](API.md) | Referência HTTP, JWT, endpoints, exemplos |
| [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md) | Roles, políticas e `permissions` em `/api/auth/me` |
| [SEGURANCA.md](SEGURANCA.md) | Sessão, CSP, armazenamento no browser |
| [TESTES.md](TESTES.md) | Unitários, integração, Vitest, Playwright, CI |
| [OPERACOES.md](OPERACOES.md) | Backups SQL, correlation id, logs |
| [frontend/PAINEL-ADMIN.md](frontend/PAINEL-ADMIN.md) | Rotas e funcionalidades do painel `/admin` |
| [frontend/PAINEL-ADMIN-PLANO.md](frontend/PAINEL-ADMIN-PLANO.md) | Plano de redesign estético (Fase 1) e backlog funcional (Fase 2) |
| [frontend/PAINEL-GESTOR.md](frontend/PAINEL-GESTOR.md) | Analytics do gestor na home (`/`) |

**Swagger** (só Development): `https://localhost:7225/swagger`

---

## Repositório (código)

```
Finalproj/
├── src/Finalproj.{Api,Application,Domain,Infrastructure}/
├── apps/web/                    # Next.js 16
├── Finalproj.Tests/             # 15 testes domínio
├── Finalproj.IntegrationTests/  # 69 testes HTTP
└── Docs/                        # esta pasta (7 ficheiros + este índice)
```

---

## Testes (comandos rápidos)

```bash
dotnet test Finalproj.sln -c Release
cd apps/web && npm test && npm run test:e2e
```

---

## Estado actual (resumo)

| Área | Situação |
|------|----------|
| Migração `src/` + CI | Feito |
| Auth, matriz 401/403, IDOR | Feito (integração) |
| E2E + Vitest | 14 + 41 specs |
| CSP com nonce | Feito (`apps/web/proxy.ts`) |
| Pendente opcional | Threshold cobertura CI (≥60% Domain/Application) |
| Swagger XML | Feito — comentários XML nos controllers (`GenerateDocumentationFile` + Swagger em Development) |

---

## Convenções em 3 linhas

- **Backend:** PascalCase; rotas `/api/kebab-case`.
- **Frontend:** `apps/web/app/lib/*Api.ts` na segunda utilização do mesmo endpoint.
- **PR:** build + testes; endpoint sensível → teste 401/403 (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).
