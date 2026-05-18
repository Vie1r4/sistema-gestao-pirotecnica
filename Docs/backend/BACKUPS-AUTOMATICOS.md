# Backups automáticos da base de dados (SQL Server)

O backend inclui um **`BackgroundService`** que executa **BACKUP DATABASE** para SQL Server e grava ficheiros **`.bak`** na **raiz do content root** do projeto (normalmente a pasta onde está o `.csproj` / repositório em desenvolvimento).

**Última revisão:** maio de 2026 (alinhada a `DatabaseBackupHostedService`, `appsettings.json` e `AdminController`).

---

## Comportamento

| Aspeto | Detalhe |
|--------|---------|
| **Agendamento** | Uma vez por dia, à **hora local do servidor** (`DateTime.Now`), configurável. |
| **Comando SQL** | `BACKUP DATABASE [nome]` para ficheiro em disco com `INIT`, `FORMAT`, `COMPRESSION`, `CHECKSUM`. |
| **Nome do ficheiro** | `{PrefixoFicheiro}_{NomeBd}_{yyyyMMdd_HHmmss}.bak` na raiz do content root. |
| **Retenção** | Após cada backup (e no fim de um backup manual), ficheiros `.bak` com o mesmo prefixo **mais antigos** que `RetencaoDias` são apagados. |
| **Concorrência** | `SemaphoreSlim` — backups automáticos e manuais não correm em paralelo. |
| **Timeout** | Comando SQL: até **1 hora** (`CommandTimeout`). |

Implementação: `Services/Infrastructure/DatabaseBackupHostedService.cs` (implementa `IDatabaseBackupService` e `BackgroundService`).

---

## Configuração (`appsettings` / variáveis de ambiente)

Secção **`Backups`** (classe `DatabaseBackupOptions`, `SectionName = "Backups"`):

| Propriedade | Significado | Exemplo |
|-------------|-------------|---------|
| **`HoraDiaria`** | Hora (0–23) do backup diário | `19` |
| **`MinutoDiario`** | Minuto (0–59) | `0` |
| **`PrefixoFicheiro`** | Prefixo dos ficheiros na raiz | `db-backup` |
| **`RetencaoDias`** | Dias a manter; `0` ou negativo **desativa** a limpeza automática | `30` |

Em produção, usa-se o padrão de configuração do .NET, por exemplo variáveis **`Backups__HoraDiaria`**, **`Backups__RetencaoDias`**, etc.

A **connection string** vem de **`ConnectionStrings:FinalprojContext`** — o nome da base (`Initial Catalog`) é extraído do builder para o comando `BACKUP DATABASE`.

---

## Backup manual (Admin)

Utilizadores com política de **Admin** podem disparar um backup imediato:

- **`POST /api/admin/backups/run`**  
  Resposta de sucesso inclui mensagem e o **caminho** do ficheiro `.bak` gerado (o mesmo serviço `ExecuteBackupNowAsync` usado pelo agendamento).

Útil para cópia antes de manutenção ou para testar permissões de escrita no disco.

---

## Notas de segurança e operações

1. **Localização dos `.bak`:** por defeito ficam na **raiz do content root** — em produção convém **alterar** para um volume dedicado (isto exigiria evolução de código: pasta configurável em vez de só `ContentRootPath`).
2. **Permissões SQL:** a conta da connection string precisa de permissão para executar `BACKUP DATABASE`.
3. **Espaço em disco:** monitorizar o diretório; a retenção ajuda mas não substitui política de cópias para armazenamento externo.
4. **`clear-all-data` / limpeza de dados** são fluxos separados (desenvolvimento / admin); não confundir com backup.

---

## Documentação relacionada

- [README.md](../../README.md) — menção rápida na secção de configuração.
- [Services/README.md](../../Services/README.md) — papel do `DatabaseBackupHostedService`.
