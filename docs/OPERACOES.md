# Operações

Backups da base de dados e observabilidade HTTP. **Maio 2026.**

---

## Backups SQL Server

`DatabaseBackupHostedService` em `src/Finalproj.Infrastructure` — backup diário + retenção.

| Aspeto | Detalhe |
|--------|---------|
| Agendamento | Hora local configurável (`Backups:HoraDiaria`, etc.) |
| Ficheiros | `.bak` na raiz do content root (`{Prefixo}_{Bd}_{timestamp}.bak`) |
| Retenção | `Backups:RetencaoDias` — apaga ficheiros antigos com o mesmo prefixo |
| Manual | `POST /api/admin/backups/run` (Admin) |

Configuração: secção **`Backups`** em `appsettings` ou variáveis `Backups__*`.

**Produção:** considerar volume dedicado para `.bak` e cópias externas; monitorizar espaço em disco.

---

## Observabilidade HTTP

`RequestDiagnosticsMiddleware` (`src/Finalproj.Api/Middleware/`):

- Aceita ou gera **`X-Correlation-Id`** (até 128 chars seguros).
- Devolve o mesmo header na resposta; exposto em CORS.
- Log por pedido: método, path, status, `ElapsedMilliseconds` (scopes com `CorrelationId`).
- Respostas **500** JSON em `/api/*` podem incluir `correlationId`.

**Logging:** JSON + scopes em produção; formato simples em Development.

**Cliente:** opcional enviar `X-Correlation-Id` no `fetch`; ler da resposta em erros para suporte.

**Evolução possível:** OpenTelemetry, métricas por rota.
