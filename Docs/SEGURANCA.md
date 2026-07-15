# Segurança

Resumo do que está implementado.


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

**Bootstrap / enumeração:** `GET /api/auth/existem-utilizadores` devolve `primeiroRegistoDisponivel` e, só quando não há contas, `existemBackupsAnteriores` (boolean — **sem** contagem nem nomes de ficheiros). Ativo só com `Bootstrap:AllowFirstUserRegistration=true`. Rate limits separados: `bootstrap-status` (60/min) e `bootstrap-register` (15/min). Em produção manter `AllowFirstUserRegistration=false` após o primeiro admin.

**Backups e reset (Admin / Development):**

| Operação | Quem | Ambiente | Notas |
|----------|------|----------|--------|
| Listar / criar / descarregar / apagar / restaurar backup | Role **Admin** (JWT + `PodeAcederAdmin`) | Produção e Dev | Rate limit `admin` (30/min). Paths validados (`Path.GetFileName`, prefixo `db-backup_`, sem `..`). |
| `POST clear-all-data` | Admin | **Só Development** | Apaga BD, Uploads, contas, tokens; repõe roles. **Não** apaga `.bak` em `PirofafeData/Backups`. Log de auditoria. |
| `POST home/limpar-dados` | Admin | **Só Development** (legado) | Mesmo objetivo; preferir `clear-all-data` na UI. |
| Restauro ZIP documentos | Admin | Prod/Dev | Extração com validação anti path-traversal no ZIP. |
| Leitura de disco (`.bak`) | API no **servidor** | — | Pasta `DadosLocais` / `PirofafeData/Backups`; o browser nunca acede ao disco do cliente. |

Riscos: conta Admin comprometida → restauro ou download de backups; mitigar com passwords fortes, poucos admins e backups externos. Restauro substitui a BD em uso (`RESTORE DATABASE`).

**RPO/RTO:** objetivos e cenários documentados em [OPERACOES.md — RPO e RTO](OPERACOES.md#rpo-e-rto-objetivos-de-recuperação) (RPO ≤ 24 h automático; RTO alvo ~30–60 min; testes de restauro recomendados).

**Email de conta nova (funcionário):** o corpo inclui aviso para alterar a palavra-passe imediatamente após o primeiro login (Perfil).

---

## Autorização

Políticas em `src/Finalproj.Api/Authorization/PoliticasAutorizacao.cs`. Matriz completa: [ROLES-E-PERMISSOES.md](ROLES-E-PERMISSOES.md).

Testes de integração cobrem 401/403 e IDOR nos recursos sensíveis. Novo endpoint com dados por ID → acrescentar teste no mesmo PR.

Outras medidas: rate limiting em auth/admin/bootstrap; limpeza total só em Development; backups Admin sem paths absolutos na API.

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

`DocumentoStorageService` + `ArquivosRaizService`: validação de **extensão**, **tamanho** e **conteúdo (magic bytes)** antes de gravar; ficheiros em `PirofafeData/Uploads` (configurável em `DadosLocais`); `Path.GetFullPath` com verificação de prefixo antes de ler/apagar (anti path-traversal). Leitura legada em `wwwroot/Documentos` **desactivada** (`UsarFallbackWwwroot: false`).

| Tipo | Extensões | Assinatura (início do ficheiro) |
|------|-----------|----------------------------------|
| PDF | `.pdf` | `%PDF` (`25 50 44 46`) |
| JPEG | `.jpg`, `.jpeg` | `FF D8 FF` |
| PNG | `.png` | `89 50 4E 47 0D 0A 1A 0A` |

Implementação: `UploadFileContentRules` (regras) + `IUploadFileContentValidator` / `UploadFileContentValidator`; chamado automaticamente em `GuardarFicheiroAsync` e `GuardarFicheiroNoCaminhoRelativoAsync`. A extensão tem de coincidir com o tipo detetado (ex.: `.pdf` com cabeçalho JPEG é rejeitado).

**Cifragem em repouso (opcional):** secção `CifragemEmRepouso` em `appsettings` — quando `Ativa=true`, novos ficheiros em `PirofafeData/Uploads` e backups (`.bak`, `_uploads.zip`) são gravados com AES-256-GCM (cabeçalho `PIRFENC1`). Ficheiros legados em plain text continuam legíveis. Chave: 32 bytes em Base64 (`ChaveBase64`); **nunca** versionar a chave no Git — usar variável de ambiente ou secret manager em produção. Download/restauro decifra automaticamente.
