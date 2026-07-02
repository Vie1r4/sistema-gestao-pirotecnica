# Documentação — sistema de gestão pirotécnica

Índice da documentação do software desenvolvido para a **Pirofafe**. Toda a documentação vive **nesta pasta `Docs/`**.

Arranque rápido: [README na raiz](../README.md) · Contribuição: [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Estrutura

```
Docs/
├── README.md                    ← este índice
├── VISAO-GERAL.md               ← o que é o sistema e como as partes ligam
├── ARCHITECTURE.md              ← stack, domain, pipeline (English)
├── ARQUITETURA.md               ← stack, domínio, pipeline (PT)
├── API.md                       ← endpoints, JWT, exemplos
├── ROLES-E-PERMISSOES.md        ← cargos e políticas
├── SEGURANCA.md                 ← tokens, CSP, backups
├── PRODUCAO.md                  ← checklist inicial de produção
├── TESTES.md                    ← unitários, integração, E2E, CI
├── OPERACOES.md                 ← backups, RPO/RTO, correlation id
├── frontend/
│   ├── ORGANIZACAO-FRONTEND.md  ← onde vive cada coisa + design tokens
│   ├── PAINEL-ADMIN.md
│   └── PAINEL-GESTOR.md
└── documentacao-regulatoria/
    ├── README.md                ← declaração PSP
    └── MAPEAMENTO-CAMPOS-PSP.md
```

---

## Por onde começar

| Perfil | Documento |
|--------|-----------|
| **Recrutador / reviewer** | [CASE-STUDY.md](CASE-STUDY.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [README na raiz](../README.md) |
| **Novo no projeto** | [VISAO-GERAL.md](VISAO-GERAL.md) |
| **Integrar com a API** | [API.md](API.md) |
| **Permissões e roles** | [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md) |
| **Arquitetura e domínio** | [ARCHITECTURE.md](ARCHITECTURE.md) (EN) · [ARQUITETURA.md](ARQUITETURA.md) (PT) |
| **Produção** | [PRODUCAO.md](PRODUCAO.md) — checklist inicial de segurança |

---

## Documentos por tema

| Documento | Para quê |
|-----------|----------|
| [CASE-STUDY.md](CASE-STUDY.md) | Resumo portfolio — contexto, decisões, roadmap |
| [VISAO-GERAL.md](VISAO-GERAL.md) | O que é o sistema e como backend/frontend se ligam |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, domain, API modules, conventions (English) |
| [ARQUITETURA.md](ARQUITETURA.md) | Stack, domínio, módulos da API, convenções (PT) |
| [API.md](API.md) | Referência HTTP, JWT, endpoints, exemplos |
| [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md) | Roles, políticas e `permissions` em `/api/auth/me` |
| [SEGURANCA.md](SEGURANCA.md) | Sessão, CSP, armazenamento no browser |
| [PRODUCAO.md](PRODUCAO.md) | Checklist inicial de produção (HTTPS, CORS, segredos, fail-fast) |
| [TESTES.md](TESTES.md) | Unitários, integração, Vitest, Playwright, CI |
| [OPERACOES.md](OPERACOES.md) | Backups (BD + docs), RPO/RTO, testes de restauro |
| [frontend/ORGANIZACAO-FRONTEND.md](frontend/ORGANIZACAO-FRONTEND.md) | Onde vive cada coisa (`lib`, `_components`, tokens) |
| [frontend/PAINEL-ADMIN.md](frontend/PAINEL-ADMIN.md) | Rotas e funcionalidades `/admin` |
| [frontend/PAINEL-GESTOR.md](frontend/PAINEL-GESTOR.md) | Analytics do gestor na home (`/`) |
| [documentacao-regulatoria/README.md](documentacao-regulatoria/README.md) | Declaração PSP |

**Swagger** (só Development): `https://localhost:7225/swagger`

---

## Repositório (código)

```
Finalproj/
├── src/Finalproj.{Api,Application,Domain,Infrastructure}/
├── apps/web/                    # Next.js 16
├── Finalproj.Tests/             # testes unitários
├── Finalproj.IntegrationTests/  # testes HTTP
└── Docs/                        # esta pasta
```

---

## Testes (comandos rápidos)

```bash
dotnet test Finalproj.sln -c Release
cd apps/web && npm test && npm run test:e2e
```

Detalhe: [TESTES.md](TESTES.md).

---

## Convenções em 3 linhas

- **Backend:** PascalCase; rotas `/api/kebab-case`.
- **Frontend:** `apps/web/app/lib/*Api.ts` na segunda utilização do mesmo endpoint.
- **PR:** build + testes; endpoint sensível → teste 401/403 (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).
