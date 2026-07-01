# Case study — Pyrotechnics Operations Platform

Portfolio overview for recruiters and technical reviewers.  
**Author:** [Sérgio Henrique Oliveira Vieira](https://github.com/Vie1r4) · [LinkedIn](https://www.linkedin.com/in/s%C3%A9rgio-vieira-7b4290345/)

Index: [Docs/README.md](README.md) · Landing page: [README na raiz](../README.md)

---

## Context

**Client:** Pirofafe — a pyrotechnics company operating regulated warehouses (paióis), commercial orders, and field shows.

**Problem:** Spreadsheets and ad-hoc tools cannot enforce legal stock rules (ADR, RFACEPE), coordinate commercial ↔ warehouse workflows, or produce PSP regulatory PDFs for each event.

**Deliverable:** A production-oriented full-stack system covering the full operational chain — from warehouse entry to field service documentation.

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
| Documentation | 14+ markdown guides in `Docs/` |
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

Documented in [ARQUITETURA.md](ARQUITETURA.md#stock-fifo--implementação-e-dívida-técnica):

- ~~FIFO preparation lacks pessimistic locking under concurrent operators~~ **Fixed (2026-07)** — transaction + SQL Server row locks; see `FifoPreparacaoConcorrenciaTests`
- E2E with mocks in `client-ci`; **full-stack pipeline** in `fullstack-e2e.yml`: login, refresh after reload, `/me`, list clients (browser → HTTPS API → SQL Server)
- No Docker / cloud deploy yet (portfolio Phase 2)

These are deliberate next steps, not hidden debt.

---

## Roadmap

Portfolio improvements in progress:

| Phase | Status | Deliverable |
|-------|--------|-------------|
| **1** | In progress | Portfolio README, case study |
| **1b** | Planned | Screenshots & GIF in README |
| **2** | Planned | `docker compose up` + demo seed data |
| **2b** | Planned | Live demo URL + demo credentials |
| **3** | In progress | FIFO concurrency (done); coverage threshold (done); full-stack E2E login in CI |
| **4** | Planned | LinkedIn post + technical article |

---

## Try it

- **Local:** [README — Quick start](../README.md#quick-start)
- **Live demo:** coming soon (see [Demo credentials](../README.md#demo-credentials))

---

## Further reading

- [VISAO-GERAL.md](VISAO-GERAL.md) — system overview
- [ARQUITETURA.md](ARQUITETURA.md) — layers and domain
- [API.md](API.md) — HTTP reference
- [TESTES.md](TESTES.md) — test strategy
- [SEGURANCA.md](SEGURANCA.md) — auth and hardening
