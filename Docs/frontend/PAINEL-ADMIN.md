# Painel de administração (`/admin`)



Área **role Admin** no frontend Next.js (`apps/web/app/admin/`).



**Plano de redesign:** [PAINEL-ADMIN-PLANO.md](PAINEL-ADMIN-PLANO.md).



## Âmbito



Governança do sistema (contas, auditoria, backups, limpeza em testes). **Não** inclui gráficos operacionais do Gestor — esses ficam na home `/` para Admin/Gestor.



## Rotas



| Rota | Função |

|------|--------|

| `/admin` | Dashboard: KPIs horizontais no topo, **Totais de referência** (5 cartões individuais, mesmo layout), atalhos, feed de logs |

| `/admin/utilizadores` | Tabela com pesquisa, filtros, **Novo utilizador** (modal), edição inline com roles, funcionário, email, confirmação e reset (`?edit={id}`, `?filtro=`) |

| `/admin/utilizadores/[id]/editar` | Redireciona para `?edit=` na lista |

| `/admin/logs` | Auditoria: filtros aplicados ao alterar (área, utilizador, ação com debounce, período e atalhos `ENCOMENDA`/`STOCK`/…), export CSV da página |

| `/admin/definicoes` | Estado do sistema (health), backup manual + histórico, zona de perigo (limpeza dev) |



## Layout



- Sidebar fixa em `lg+` com link **Voltar à aplicação** (`/`).

- Mobile: botão **Menu do painel** expande a navegação.

- Componentes: `app/admin/_components/` (`adminTheme`, `StatCard`, `AdminConfirmDialog`, `AdminSection`, etc.).



## API



Ver [API.md](../API.md) — secção `/api/admin`.



- Dashboard: `GET /api/admin/stats`, `GET /api/admin/logs` (feed), `GET /api/admin/health` (badge).

- Utilizadores (contas): `POST /api/admin/utilizadores`, `GET .../criar-opcoes`, `POST .../resend-confirm-email`, `POST .../confirm-email`, `POST .../send-password-reset`, `PUT .../credenciais` — ver [API.md](../API.md).

- **Não** usa `GET /api/home/gestor-dashboard` no painel admin.



## Backlog funcional (Fase 2)



Itens em âmbito **concluídos** (B01–B13, B19). Adiados: B14, B18; fase posterior: B15–B17. Ver [PAINEL-ADMIN-PLANO.md](PAINEL-ADMIN-PLANO.md).

Testes E2E: `apps/web/tests/e2e/admin.smoke.spec.ts`.

