# Backups automáticos da base de dados

O projeto tem backup de SQL Server integrado no backend via `BackgroundService`:

- serviço: `DatabaseBackupHostedService`
- opções: `DatabaseBackupOptions`
- endpoint manual: `POST /api/admin/backups/run` (Admin)

---

## Como funciona

### 1) Backup automático diário

- O serviço calcula a próxima execução e corre todos os dias às **19:00** (hora local do servidor).
- Usa `BACKUP DATABASE ... WITH COMPRESSION, CHECKSUM`.
- Gera um ficheiro `.bak` na **raiz do projeto**.

Formato do nome:

- `db-backup_<NomeDaBase>_yyyyMMdd_HHmmss.bak`

Exemplo:

- `db-backup_FinalprojContext_20260326_190000.bak`

### 2) Backup manual (Admin)

Endpoint:

- `POST /api/admin/backups/run`

Comportamento:

- executa backup imediato
- devolve `caminho`, `nomeFicheiro` e `tamanhoBytes`
- respeita autenticação JWT e policy de Admin

### 3) Retenção automática

- Depois de cada backup, o serviço remove backups antigos de acordo com `RetencaoDias`.
- Por defeito: mantém **30 dias**.

---

## Configuração (`appsettings.json`)

```json
"Backups": {
  "HoraDiaria": 19,
  "MinutoDiario": 0,
  "PrefixoFicheiro": "db-backup",
  "RetencaoDias": 30
}
```

Significado:

- `HoraDiaria` / `MinutoDiario`: hora local do servidor
- `PrefixoFicheiro`: prefixo dos `.bak`
- `RetencaoDias`: dias a manter backups na raiz

---

## Pré-requisitos operacionais

- A connection string (`ConnectionStrings:FinalprojContext`) tem de apontar para SQL Server válido.
- A conta que corre o backend precisa de permissões para:
  - ler a BD;
  - criar ficheiros `.bak` no caminho de destino (raiz do projeto).
- Se mudares o nome da BD, o nome dos ficheiros também muda.

Recomendação forte:

- manter cópia dos `.bak` fora da máquina (NAS/cloud/disco externo) para evitar perda total.

---

## O que fazer se a base de dados ficar corrompida

> Objetivo: restaurar rapidamente para um estado consistente usando o último `.bak` saudável.

### Passo 0 — Contenção

1. Parar a API (evitar mais escrita na BD).
2. Preservar os logs da aplicação e o ficheiro corrompido para análise.
3. Escolher o backup mais recente válido (`.bak`).

### Passo 1 — Validar o ficheiro de backup

Executar em SQL Server:

```sql
RESTORE VERIFYONLY
FROM DISK = N'C:\caminho\para\db-backup_FinalprojContext_20260326_190000.bak';
```

Se falhar, usar backup anterior.

### Passo 2 — Restaurar a BD

> Atenção: este passo substitui a BD atual. Garante que tens cópia da BD corrompida antes.

```sql
USE master;
ALTER DATABASE [FinalprojContext] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

RESTORE DATABASE [FinalprojContext]
FROM DISK = N'C:\caminho\para\db-backup_FinalprojContext_20260326_190000.bak'
WITH REPLACE, RECOVERY, STATS = 10;

ALTER DATABASE [FinalprojContext] SET MULTI_USER;
```

### Passo 3 — Validar aplicação

1. Arrancar backend.
2. Confirmar que `Database.Migrate()` não falha.
3. Testar endpoints críticos:
   - `POST /api/auth/login`
   - `GET /api/admin/stats` (com token Admin)
   - endpoint de domínio principal (ex.: serviços/encomendas)

### Passo 4 — Pós-incidente

1. Registar hora da falha e backup usado.
2. Identificar causa provável (disco, desligamento abrupto, update falhado, etc.).
3. Executar backup manual imediato após validação (`POST /api/admin/backups/run`).

---

## Plano de recuperação recomendado (RTO/RPO)

- **RPO esperado**: até 24h (com backup diário às 19:00).
- **RTO alvo**: 15-60 min (dependendo do tamanho da BD e acesso ao backup).

Para reduzir perda de dados:

- aumentar frequência (ex.: 2-4 backups/dia);
- armazenar cópia remota automática;
- testar restore 1x por mês em ambiente de teste.
