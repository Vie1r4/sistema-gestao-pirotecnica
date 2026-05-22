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
Política de palavra-passe (Identity, `IPasswordValidationService`): mín. **8** caracteres, maiúsculas, minúsculas, algarismo e carácter especial — aplicada em `reset-password`, `registar-primeiro-utilizador`, criação de conta de funcionário e `alterar-password`. Reset: token Base64Url no link; `PasswordResetTokenDecoder` tolera espaços/quebras no URL; após sucesso confirma o email (`EmailConfirmed`) para permitir login.

**Bootstrap / enumeração:** `GET /api/auth/existem-utilizadores` devolve apenas `primeiroRegistoDisponivel` (não `existem`). Ativo só com `Bootstrap:AllowFirstUserRegistration=true` e sem contas; rate limit **5/min** (`bootstrap`). Em produção manter `AllowFirstUserRegistration=false` após o primeiro admin.

**Email de conta nova (funcionário):** o corpo inclui aviso para alterar a palavra-passe imediatamente após o primeiro login (Perfil).

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

`DocumentoStorageService` + `ArquivosRaizService`: validação de **extensão**, **tamanho** e **conteúdo (magic bytes)** antes de gravar; ficheiros em `PirofafeData/Uploads` (configurável em `DadosLocais`); `Path.GetFullPath` com verificação de prefixo antes de ler/apagar (anti path-traversal). Ficheiros antigos em `wwwroot` só são lidos se `DadosLocais:UsarFallbackWwwroot` for `true`.

| Tipo | Extensões | Assinatura (início do ficheiro) |
|------|-----------|----------------------------------|
| PDF | `.pdf` | `%PDF` (`25 50 44 46`) |
| JPEG | `.jpg`, `.jpeg` | `FF D8 FF` |
| PNG | `.png` | `89 50 4E 47 0D 0A 1A 0A` |

Implementação: `UploadFileContentRules` (regras) + `IUploadFileContentValidator` / `UploadFileContentValidator`; chamado automaticamente em `GuardarFicheiroAsync` e `GuardarFicheiroNoCaminhoRelativoAsync`. A extensão tem de coincidir com o tipo detetado (ex.: `.pdf` com cabeçalho JPEG é rejeitado).
