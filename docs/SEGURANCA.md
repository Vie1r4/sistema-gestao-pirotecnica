# Segurança

Resumo do que está implementado. **Maio 2026.**

---

## Sessão e tokens

| Item | Implementação |
|------|----------------|
| Access token | Memória (`useAuthStore` / `auth.ts`) — **não** em `localStorage` |
| Refresh token | Cookie **HttpOnly**, rotação no backend |
| Tema UI | Zustand persist `pirofafe-theme` |
| Dados de negócio | Apenas API; sem listas em `localStorage` |

Endpoints: `POST /api/auth/login`, `refresh`, `logout`, `GET /api/auth/me` (roles + **permissions**).

---

## Autorização

Políticas em `src/Finalproj.Api/Authorization/PoliticasAutorizacao.cs`. Matriz completa: [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

Testes de integração cobrem 401/403 e IDOR nos recursos sensíveis. Novo endpoint com dados por ID → acrescentar teste no mesmo PR.

Outras medidas: rate limiting em auth/admin; `clear-all-data` só em Development; backups Admin sem expor paths absolutos sensíveis.

---

## CSP (Content Security Policy)

Frontend com **nonce por pedido** (`apps/web/proxy.ts`, `apps/web/lib/csp.ts`).

**Produção:** `script-src` e `style-src` com nonce + `strict-dynamic`; sem `unsafe-inline` nem `unsafe-eval`.

**Desenvolvimento:** apenas `unsafe-eval` em `script-src` (React/Next debugging).

Verificar após `npm run build && npm run start` — header `Content-Security-Policy` no documento HTML.

**Nota:** Framer Motion / Recharts podem gerar avisos de `style` inline na consola; avaliar CSS ou `style-src-attr` se necessário.

---

## Headers HTTP

Backend (`Program.cs`) e frontend (`next.config.ts`): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. SRI experimental (`sha256`) no build Next.

---

## Uploads

`DocumentoStorageService`: validação de extensão/tamanho; `Path.GetFullPath` dentro de `wwwroot` antes de ler/apagar.
