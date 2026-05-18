# Documentação PIROFAFE

Índice da documentação do repositório. Tudo o que está listado aqui vive sob a pasta **`docs/`** (exceto os `README.md` na raiz, em `apps/web/` e em `Services/`).

**Revisão do índice:** maio de 2026 — criado `backend/BACKUPS-AUTOMATICOS.md`; `ROLES-E-PERMISSOES.md` alinhado ao código; links e resumos revistos.

### Como esta pasta está organizada

- **`informacoes-basicas/`** — entrada rápida em linguagem simples (equipa não técnica ou primeiro contacto).
- **`visao-geral/`** — produto, stack, arquitetura e fluxos (documento de trabalho principal).
- **`api/`** — contratos HTTP, autenticação, exemplos; o detalhe vivo continua no **Swagger** (Development).
- **`backend/`** — domínio, segurança, DTOs, testes, **operação** (backups, observabilidade HTTP).
- **`frontend/`** — padrões React/Next, auditorias, checklist de PR, inventário de chamadas à API.

Sugestão para evoluir: se a doc crescer muito, podes criar **`docs/operacoes/`** e mover para lá `BACKUPS-AUTOMATICOS.md` e `OBSERVABILIDADE-HTTP.md` (hoje ficam em `backend/` para não partir links até decidires a migração).

---

## Visão geral e arranque

| Documento | Descrição |
|-----------|-----------|
| [**README.md**](../README.md) (raiz) | Pré-requisitos, user-secrets JWT, `dotnet run`, frontend, CORS, primeiro utilizador. |
| [**CONTRIBUTING.md**](../CONTRIBUTING.md) | Convenções, testes, checklist de PR. |
| [**visao-geral/PROJETO.md**](visao-geral/PROJETO.md) | Stack, domínio, segurança (JWT, políticas, permissões), módulos da API, convenções, melhorias futuras. |
| [**visao-geral/ARQUITETURA-E-VISAO-GERAL.md**](visao-geral/ARQUITETURA-E-VISAO-GERAL.md) | Arquitetura técnica (backend + frontend): `Program.cs`, domínio EF, segurança JWT/políticas, controllers, camada `apps/web/app/lib/*Api`, CI e testes. |

### Iniciantes — linguagem simples

| Documento | Descrição |
|-----------|-----------|
| [**informacoes-basicas/**](informacoes-basicas/) | Índice da pasta; ponte para `PROJETO.md` / `ARQUITETURA-E-VISAO-GERAL.md`. |
| [**informacoes-basicas/guia-iniciantes.md**](informacoes-basicas/guia-iniciantes.md) | Texto único: o que é o projeto, como as partes falam, login e tokens, pastas (`*Api.ts`, `auth`), glossário e links para a doc técnica. |
| [**informacoes-basicas/FUNCIONALIDADES-EXPLICADAS.txt**](informacoes-basicas/FUNCIONALIDADES-EXPLICADAS.txt) | Conceitos gerais em linguagem muito simples (ficheiro `.txt`). |

---

## API (contratos e referência)

| Documento | Descrição |
|-----------|-----------|
| [**api/API.md**](api/API.md) | Base URL, autenticação JWT, tabela de recursos, paginação, códigos de resposta, exemplos cURL. |
| [**api/CONTRATOS-API-DTOs.md**](api/CONTRATOS-API-DTOs.md) | DTOs de resposta e mapeamentos (evitar expor entidades EF). |

**Swagger (apenas ambiente Development):** com o backend a correr, UI em `/swagger` — ver [README.md](../README.md#executar).

---

## Frontend (Next.js — pasta `apps/web/`)

| Documento | Descrição |
|-----------|-----------|
| [**frontend/FRONTEND-ERROS-E-PADROES.md**](frontend/FRONTEND-ERROS-E-PADROES.md) | Padrões de erros e efeitos no React. |
| [**frontend/FRONTEND-PAGINACAO.md**](frontend/FRONTEND-PAGINACAO.md) | Paginação no cliente e alinhamento com a API. |
| [**frontend/AUDITORIA-LOCALSTORAGE.md**](frontend/AUDITORIA-LOCALSTORAGE.md) | O que pode/não pode ir para localStorage vs API. |
| [**frontend/VERIFICACAO-APIS-UTILIZADAS.md**](frontend/VERIFICACAO-APIS-UTILIZADAS.md) | Endpoints usados pelo client (pode precisar de atualização periódica). |
| [**frontend/DOCUMENTACAO-SERVICOS.md**](frontend/DOCUMENTACAO-SERVICOS.md) | Nova aba Documentação para gerir licenças/documentos por serviço. |
| [**frontend/CHECKLIST-QUALIDADE-PR.md**](frontend/CHECKLIST-QUALIDADE-PR.md) | Checklist para manter PRs funcionais e organizadas. |
| [**frontend/O-QUE-FALTA-FAZER.md**](frontend/O-QUE-FALTA-FAZER.md) | Estado do refactor (Query/Mutation, pendências opcionais). |
| [**frontend/PAINEL-INICIAL.md**](frontend/PAINEL-INICIAL.md) | Painel inicial / home (notas de implementação). |

Regras para o Cursor: `apps/web/.cursor/rules/` (ex.: API em primeiro lugar). **Convenção:** segunda utilização do mesmo endpoint → função em `apps/web/app/lib/*Api.ts` — ver [apps/web/README.md — Chamadas API (lib)](../apps/web/README.md#chamadas-api-lib).

**CI (frontend):** em PRs e em `push` a `main`/`next`, [`.github/workflows/client-ci.yml`](../.github/workflows/client-ci.yml) corre `npm ci`, `npm run typecheck`, `npm run lint` e `npm run test` (Vitest, em paralelo entre si), `npm run build`, instalação do Playwright (Chromium) e `npm run test:e2e` em `apps/web/`. Detalhes em [`apps/web/README.md`](../apps/web/README.md#ci).

---

## Backend (arquitetura, domínio e operação)

| Documento | Descrição |
|-----------|-----------|
| [**backend/ANALISE-CONTROLLERS-ENTIDADES-DTO.md**](backend/ANALISE-CONTROLLERS-ENTIDADES-DTO.md) | Onde a API usa DTOs vs entidades; dados sensíveis; checklist. |
| [**backend/ROLES-E-PERMISSOES.md**](backend/ROLES-E-PERMISSOES.md) | Roles, políticas de autorização e campo `permissions` em `/api/auth/me`. |
| [**backend/AUDITORIA-CYBERSEG.md**](backend/AUDITORIA-CYBERSEG.md) | Auditoria de cibersegurança (riscos e mitigação). |
| [**backend/SERVICOS-EXTRACAO-SERVICO.md**](backend/SERVICOS-EXTRACAO-SERVICO.md) | Notas sobre o módulo de serviços e `ServicoService`. |
| [**backend/BACKUPS-AUTOMATICOS.md**](backend/BACKUPS-AUTOMATICOS.md) | Agendamento diário de backups SQL Server e backup manual (`POST /api/admin/backups/run`). |
| [**backend/TESTES-DOMINIO.md**](backend/TESTES-DOMINIO.md) | Testes unitários xUnit (`Finalproj.Tests`): encomendas (FIFO, preparação), stock disponível. |
| [**backend/OBSERVABILIDADE-HTTP.md**](backend/OBSERVABILIDADE-HTTP.md) | Correlation id (`X-Correlation-Id`), logs e latência por pedido HTTP. |
| [**Services/README.md**](../Services/README.md) | Organização `Services/Domain` vs `Infrastructure`. |

---

## Configuração e deploy (resumo)

- **Desenvolvimento:** `Jwt:Secret` (≥32 caracteres) e restantes chaves via `dotnet user-secrets` — ver [README.md](../README.md#configuração-do-backend).
- **Produção:** variáveis de ambiente (`Jwt__Secret`, `ConnectionStrings__FinalprojContext`, `Cors__AllowedOrigins`, credenciais de email, etc.); **não** commitar segredos no Git.

---

## Estrutura de pastas `docs/`

```
docs/
├── README.md                 ← este índice
├── informacoes-basicas/    ← guia simples + texto longo opcional (.txt)
├── visao-geral/              ← produto, stack, arquitetura (PROJETO, ARQUITETURA-E-VISAO-GERAL)
├── api/                      ← referência HTTP e contratos DTO
├── frontend/                 ← Next.js: padrões, auditorias, checklist, APIs usadas
└── backend/                  ← controllers/DTOs, roles, testes, backups, observabilidade
```
