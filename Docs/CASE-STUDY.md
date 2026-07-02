# Case study — Pyrotechnics Operations Platform

Portfolio overview for recruiters and technical reviewers.  
**Authors:** [Sérgio Henrique Oliveira Vieira](https://github.com/Vie1r4) · [LinkedIn](https://www.linkedin.com/in/s%C3%A9rgio-vieira-7b4290345/) · Tomás Campelos

*Final course group project — deployed on-premise on the client's infrastructure; no public demo instance.*

Index: [Docs/README.md](README.md) · Landing page: [README na raiz](../README.md)

---

## Context

**Client:** Pirofafe — a pyrotechnics company operating regulated warehouses (paióis), commercial orders, and field shows.

**Problem:** Spreadsheets and ad-hoc tools cannot enforce legal stock rules (ADR, RFACEPE), coordinate commercial ↔ warehouse workflows, or produce PSP regulatory PDFs for each event.

**Deliverable:** A production-oriented full-stack system covering the full operational chain — from warehouse entry to field service documentation.

**Academic context:** Developed as a **group final course project** (authors listed above). The system is intended to run on the **client's servers**, not as a public SaaS.

---

## My role

- **Full-stack development** — backend (.NET 8), frontend (Next.js 16), database design (EF Core + SQL Server)
- **Domain modeling** — legal parameters isolated in `Finalproj.Domain/Legislacao/`
- **Security & ops** — JWT auth, authorization tests, backups, production checklist
- **Documentation** — API reference, architecture, security, and operations guides

---

## Key technical decisions

| Decision | Why |
|----------|-----|
| **Clean Architecture (4 projects)** | Keep legal/business rules testable without ASP.NET or EF dependencies |
| **`Legislacao/` module** | When ADR/RFACEPE/PSP rules change, update one parameter file — not scattered magic numbers |
| **JWT + HttpOnly refresh** | Access token in browser memory; refresh in secure cookie with rotation |
| **FIFO in SQL** | Stock balance and lot ordering computed in the database, not in-memory loops |
| **403 → 404 on sensitive IDs** | Reduce enumeration of resources the caller cannot access |
| **Four test layers** | xUnit (domain), WebApplicationFactory (HTTP/auth), Vitest (frontend), Playwright (E2E) |

---

## Scope (numbers)

| Area | Scale |
|------|-------|
| Backend C# files | ~325 across 4 projects |
| EF migrations | ~42 |
| API controllers | 13 |
| Frontend routes | ~63 pages |
| Documentation | 15+ markdown guides in `Docs/` (incl. `ARCHITECTURE.md` EN) |
| Test projects | 2 backend + Vitest + Playwright |

---

## Features delivered

- Warehouse management with legal validation on every stock entry
- Product catalog with ADR classification and safety distances
- Order workflow with stock reservations and FIFO preparation
- Field services with launch zones, maps (Leaflet), and PSP PDF generation
- Role-based access (Admin, Gestor, Comercial, Armazém)
- Admin panel: users, logs, backup/restore
- Manager analytics dashboard

---

## Known limitations (honest)

Documented in [ARCHITECTURE.md](ARCHITECTURE.md#fifo-stock--implementation-and-known-gaps) (EN) / [ARQUITETURA.md](ARQUITETURA.md#stock-fifo--implementação-e-dívida-técnica) (PT):

- ~~FIFO preparation lacks pessimistic locking under concurrent operators~~ **Fixed (2026-07)** — transaction + SQL Server row locks; see `FifoPreparacaoConcorrenciaTests`
- E2E with mocks in `client-ci`; **full-stack pipeline** in `fullstack-e2e.yml`: login, refresh after reload, `/me`, list clients (browser → HTTPS API → SQL Server)
- Off-site backup replication not implemented — see [OPERACOES.md](OPERACOES.md)

Documented limitations, not hidden debt.

---

## Roadmap

Portfolio and delivery status:

| Phase | Status | Deliverable |
|-------|--------|-------------|
| **1** | Done | Portfolio README, case study |
| **1b** | Planned | Screenshots & GIF in README |
| **2** | Done | On-premise production checklist — [PRODUCAO.md](PRODUCAO.md), [OPERACOES.md](OPERACOES.md) |
| **3** | Done | FIFO concurrency + row locks; Auth refactor; coverage ≥60% in CI; full-stack E2E (login, refresh, `/me`, clients); [ARCHITECTURE.md](ARCHITECTURE.md) (EN) |
| **4** | Optional | LinkedIn post + technical article |

*Out of scope:* public cloud deploy and live demo URL — the product runs on the client's servers.

---

## Try it

- **Local development:** [README — Quick start](../README.md#quick-start)
- **On-premise install:** [PRODUCAO.md](PRODUCAO.md)

---

## Further reading

- [ARCHITECTURE.md](ARCHITECTURE.md) — layers, domain, FIFO (English)
- [VISAO-GERAL.md](VISAO-GERAL.md) — system overview
- [ARQUITETURA.md](ARQUITETURA.md) — same content in Portuguese
- [API.md](API.md) — HTTP reference
- [TESTES.md](TESTES.md) — test strategy
- [SEGURANCA.md](SEGURANCA.md) — auth and hardening
