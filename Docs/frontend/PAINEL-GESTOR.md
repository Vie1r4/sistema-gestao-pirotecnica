# Painel do gestor (analytics)

O role **Gestor** (e **Admin** na home) vê o painel em `/` — secção `#dashboard-gestor`.

## Layout (desktop)

1. **Cabeçalho** — Saudação + data/hora (badge de role inline).
2. **Linha 1** — 5 KPIs (`grid-cols-5`).
3. **Linha 2** — `grid-cols-3`: movimentos de armazém (`col-span-2`), encomendas pendentes (`col-span-1`).
4. **Linha 3** — `grid-cols-3`: volume de encomendas (`col-span-2`), o que o cliente levou — filtros (`col-span-1`).
5. **Linha 4** — melhores clientes a 100% (ranking + detalhe no mesmo bloco).

Em mobile, todas as secções empilham a 100%. Estilos: `dashboardPanelStyles.ts`.

## Widgets e API

| Widget | API |
|--------|-----|
| Volume | `GET /api/gestor-analytics/volume` |
| O que o cliente levou | `GET /api/gestor-analytics/consumo-cliente` |
| Melhores clientes | `GET /api/gestor-analytics/top-clientes` |
| KPIs, pendentes, movimentos | `GET /api/home/gestor-dashboard` |

## Código frontend

- Layout: [`apps/web/app/components/DashboardGestor.tsx`](../../apps/web/app/components/DashboardGestor.tsx)
- Cliente API: [`apps/web/app/lib/gestorAnalytics.ts`](../../apps/web/app/lib/gestorAnalytics.ts)
- Componentes: [`apps/web/app/components/gestor-analytics/`](../../apps/web/app/components/gestor-analytics/)

## Modo exemplo

Toggle no topo: **Ver dados de exemplo** (`gestor-painel-modo-demo` em `localStorage`).

Ver [API.md](../API.md) — `/api/gestor-analytics`.
