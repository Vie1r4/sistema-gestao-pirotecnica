# Painel do gestor (analytics)

O role **Gestor** (e **Admin** na home) vê o painel em `/` — secção `#dashboard-gestor`.

## Vista da home por cargo (`apps/web/app/page.tsx`)

| Cargo | O que vê na `/` |
|-------|-----------------|
| **Admin / Gestor** | **Só o painel** (`DashboardGestor`), começando no «Bem-vindo». O hero PIROFAFE **não** aparece. |
| **Comercial / Armazém** (e outros logados) | **Só o hero PIROFAFE**. Sem os cards de estatísticas e sem botões. |
| **Visitante** (sem sessão) | Hero PIROFAFE com o botão **«Aceder à aplicação»** (login). |

Os antigos cards de estatísticas do hero (clientes, serviços, produtos, paióis) e o botão «Ver painel» foram removidos. A condição‑chave é `showDashboardGestor = token && !apenasArmazem && !melhorCargoComercial`.

## Layout (desktop)

1. **Cabeçalho** — Saudação + data/hora (badge de role inline).
2. **KPIs** — 5 cartões (`grid-cols-5`), sempre visíveis acima das tabs.
3. **Tabs** — `Atividade` / `Clientes` / `Armazém` (a tab Armazém mostra um badge com o nº de alertas). Conteúdo trocado com fade; estado em `useState` (sem URL).
   - **Atividade**: gráfico herói «Este ano vs ano passado» (`YoYChart`, 2 linhas + legenda) + «Volume de encomendas» (`VolumeChart`).
   - **Clientes**: «Melhores clientes» (`TopClientesBlock` wide) + «O que o cliente levou» (`ClienteConsumoList`, tabela completa).
   - **Armazém**: alerta de paióis em manutenção (se houver) + `grid-cols-3` com movimentos de armazém (`col-span-2`) e encomendas pendentes (`col-span-1`).

Em mobile, todas as secções empilham a 100%. Estilos: `dashboardPanelStyles.ts`.

> Reorganização inspirada num layout de referência (cabeçalho com estado, tabs, gráfico herói com 2 séries, tabela de eventos). Sem gráficos novos — apenas redistribuição dos componentes existentes, mantendo a paleta laranja `#f97316`/`#ea580c`.

## Widgets e API

| Widget | API |
|--------|-----|
| Volume | `GET /api/gestor-analytics/volume` |
| Este ano vs ano passado (YoY) | `GET /api/gestor-analytics/comparacao-anual` |
| O que o cliente levou | `GET /api/gestor-analytics/consumo-cliente` |
| Melhores clientes | `GET /api/gestor-analytics/top-clientes` |
| KPIs, estado/alertas, pendentes, movimentos | `GET /api/home/gestor-dashboard` |

## Código frontend

- Layout: [`apps/web/app/components/DashboardGestor.tsx`](../../apps/web/app/components/DashboardGestor.tsx)
- Cliente API: [`apps/web/app/lib/gestorAnalytics.ts`](../../apps/web/app/lib/gestorAnalytics.ts)
- Componentes: [`apps/web/app/components/gestor-analytics/`](../../apps/web/app/components/gestor-analytics/)

Ver [API.md](../API.md) — `/api/gestor-analytics`.
