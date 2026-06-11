# Documentação PIROFAFE

Índice único da documentação do projeto. Toda a documentação vive **nesta pasta `Docs/`** (não existe pasta `docs/` separada).

Arranque rápido: [README na raiz](../README.md) · Contribuição: [CONTRIBUTING.md](../CONTRIBUTING.md).

**Última revisão:** junho de 2026.

---

## Estrutura

```
Docs/
├── README.md                    ← este índice
├── DEMO-PREPARACAO.md           ← testar do zero + roteiro de apresentação
├── guia-iniciantes.md           ← linguagem simples
├── ARQUITETURA.md               ← stack, domínio, pipeline
├── API.md                       ← endpoints, JWT, exemplos
├── ROLES-E-PERMISSOES.md        ← cargos e políticas
├── SEGURANCA.md                 ← tokens, CSP, backups
├── PRODUCAO.md                  ← checklist HTTPS, CORS, segredos (Fase 1)
├── TESTES.md                    ← unitários, integração, E2E, CI
├── OPERACOES.md                 ← backups, RPO/RTO, correlation id
├── frontend/
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
| **Preparar a defesa / demo** | [DEMO-PREPARACAO.md](DEMO-PREPARACAO.md) |
| **Novo no projeto** | [guia-iniciantes.md](guia-iniciantes.md) |
| **Integrar com a API** | [API.md](API.md) |
| **Permissões e roles** | [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md) |

---

## Documentos por tema

| Documento | Para quê |
|-----------|----------|
| [guia-iniciantes.md](guia-iniciantes.md) | O que é o sistema e como as partes ligam |
| [ARQUITETURA.md](ARQUITETURA.md) | Stack, domínio, módulos da API, convenções |
| [API.md](API.md) | Referência HTTP, JWT, endpoints, exemplos |
| [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md) | Roles, políticas e `permissions` em `/api/auth/me` |
| [SEGURANCA.md](SEGURANCA.md) | Sessão, CSP, armazenamento no browser |
| [PRODUCAO.md](PRODUCAO.md) | Checklist de produção (HTTPS, CORS, segredos, fail-fast) |
| [TESTES.md](TESTES.md) | Unitários, integração, Vitest, Playwright, CI |
| [OPERACOES.md](OPERACOES.md) | Backups (BD + docs), RPO/RTO, testes de restauro |
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

---

## Estado actual (resumo)

| Área | Situação |
|------|----------|
| Migração `src/` + CI | Feito |
| Auth, matriz 401/403, IDOR | Feito (integração) |
| Painel gestor (KPIs vs 7 dias, YoY multi-ano) | Feito |
| Migração `ServicoPaiolDataRegisto` | Feito |
| Testes backend | ~50 unitários + ~99 integração |
| Frontend | ~64 Vitest + ~14 Playwright (mocks) |
| CSP com nonce | Feito (`apps/web/proxy.ts`) |
| Documentação unificada em `Docs/` | Feito (junho 2026) |
| Pendente opcional | Threshold cobertura CI ≥60%; lockout login; E2E contra API real |

---

## Convenções em 3 linhas

- **Backend:** PascalCase; rotas `/api/kebab-case`.
- **Frontend:** `apps/web/app/lib/*Api.ts` na segunda utilização do mesmo endpoint.
- **PR:** build + testes; endpoint sensível → teste 401/403 (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).
