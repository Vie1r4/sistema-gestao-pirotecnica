# Produção — checklist de segurança (Fase 1)

Guia para expor o PIROFAFE na internet **sem defaults de desenvolvimento**. **Junho 2026.**

Relacionado: [SEGURANCA.md](SEGURANCA.md) · [OPERACOES.md](OPERACOES.md) · [README na raiz](../README.md)

---

## O que o código já faz por si

Ao arrancar com `ASPNETCORE_ENVIRONMENT=Production`, a API **falha de imediato** se a configuração for insegura (`ProductionConfigurationValidator` em `src/Finalproj.Infrastructure/Configuration/`).

Verificações automáticas:

| Regra | Motivo |
|-------|--------|
| `Bootstrap:AllowFirstUserRegistration=false` | Impede criar Admin pela internet |
| `SeedUsers:Enabled=false` | Sem contas de teste automáticas |
| `AllowedHosts` ≠ `*` | Host header restrito |
| `Cors:AllowedOrigins` só **HTTPS**, sem localhost | Browser só fala com o domínio real |
| `Frontend:BaseUrl` em **HTTPS** | Links de email/reset corretos |
| `Jwt:Secret` ≥ 32 caracteres | Tokens não forjáveis |
| Connection string **sem LocalDB** | BD de produção real |

Também em produção: **HSTS**, **redirecionamento HTTP→HTTPS**, **Swagger desligado**.

---

## 1. Backend (API)

### Ficheiro base

Use `src/Finalproj.Api/appsettings.Production.json` como modelo e substitua `seudominio.pt` pelos vossos domínios.

### Variáveis de ambiente (obrigatórias)

Defina no servidor, painel cloud ou secret manager — **nunca** no Git:

```bash
ASPNETCORE_ENVIRONMENT=Production

# Segredos (exemplo Linux/Docker; no Windows use o mesmo formato com __)
Jwt__Secret=<mínimo-32-caracteres-aleatórios>
ConnectionStrings__FinalprojContext=Server=...;Database=Pirofafe;User Id=...;Password=...;

# Opcional mas recomendado para email (confirmação, reset)
Email__SmtpHost=smtp...
Email__SmtpUser=...
Email__SmtpPassword=...
Email__From=noreply@seudominio.pt
```

### CORS e frontend

| Setting | Exemplo |
|---------|---------|
| `Cors:AllowedOrigins` | `https://app.seudominio.pt` |
| `Frontend:BaseUrl` | `https://app.seudominio.pt` |
| `AllowedHosts` | `app.seudominio.pt;api.seudominio.pt` |

Se frontend e API estiverem em subdomínios diferentes, CORS tem de incluir **só** a origem do site (onde corre o Next.js).

### HTTPS na API

- Certificado válido (Let's Encrypt, Cloudflare, certificado do hosting).
- A API deve escutar HTTPS (reverse proxy nginx/IIS/Caddy à frente é o padrão).
- Após o primeiro admin existir: `Bootstrap__AllowFirstUserRegistration=false` (já é o default em `appsettings.Production.json`).

### Arranque de verificação

```bash
dotnet run --project src/Finalproj.Api/Finalproj.Api.csproj --environment Production
```

Se algo estiver mal, a consola lista os erros com `•` — corrija antes de publicar.

---

## 2. Frontend (Next.js)

### Variável pública

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.pt
```

Modelo: `apps/web/.env.production.example`.

### HTTPS no site

O Next em produção (`npm run build` + `npm start` ou hosting tipo Vercel) deve ser servido em **HTTPS**. O browser bloqueia cookies `Secure` e mistura conteúdo se o site estiver em HTTP.

---

## 3. Operação humana

| Prática | Detalhe |
|---------|---------|
| **Poucos Admins** | Conta Admin = backups, restauro, utilizadores |
| **Passwords fortes** | Política Identity já exige complexidade |
| **Bootstrap desligado** | Depois do primeiro admin em produção |
| **Segredos rotacionados** | Se `Jwt:Secret` vazar, invalidar sessões e trocar chave |

---

## 4. Desenvolvimento vs produção

| Aspeto | Development | Production |
|--------|-------------|------------|
| Bootstrap primeiro user | `true` em `appsettings.Development.json` | `false` |
| CORS | IPs privados + localhost (porta 3000) | Só origens HTTPS explícitas |
| HTTP→HTTPS redirect | Desligado (telemóvel na LAN) | Ligado |
| Swagger | `/swagger` | Desligado |
| Frontend dev URLs | Ver banner `npm run dev` | Domínio público HTTPS |

---

## Resumo rápido (antes de abrir à internet)

1. Domínios e certificados HTTPS (app + API).
2. `appsettings.Production.json` + variáveis de ambiente com segredos.
3. `dotnet run --environment Production` — deve arrancar sem erros.
4. Frontend com `NEXT_PUBLIC_API_URL` HTTPS.
5. Login com admin real; confirmar que **não** aparece «Criar primeiro utilizador».
6. Testar login, refresh de sessão e um upload PDF.
