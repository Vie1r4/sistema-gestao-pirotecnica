# Operações

Backups da base de dados e observabilidade HTTP. **Junho 2026.**

---

## Backups completos (BD + documentos)

`DatabaseBackupHostedService` em `src/Finalproj.Infrastructure` — backup diário + retenção.

Cada execução gera **dois ficheiros** com o mesmo carimbo de data em `{ContentRoot}/PirofafeData/Backups/`:

| Ficheiro | Conteúdo |
|----------|----------|
| `{Prefixo}_{Bd}_{timestamp}.bak` | Base de dados SQL (dados da app, contas, paths na BD) |
| `{Prefixo}_{Bd}_{timestamp}_uploads.zip` | Pasta `PirofafeData/Uploads/` (PDFs e documentos no disco; **cifrado** se `CifragemEmRepouso:Ativa=true`) |

| Aspeto | Detalhe |
|--------|---------|
| Agendamento | Hora local configurável (`Backups:HoraDiaria`, etc.) |
| Retenção | `Backups:RetencaoDias` — apaga `.bak` e o ZIP associado |
| Manual | `POST /api/admin/backups/run` (Admin) |
| Descarregar | `GET /api/admin/backups/{nome}/download` — `.bak` ou `_uploads.zip` (Admin) |
| Restaurar | `POST /api/admin/backups/restore` com `{ nomeFicheiro }` do `.bak` — `RESTORE DATABASE` + extração do ZIP de documentos (Admin) |

Backups antigos **só com `.bak`** (sem ZIP) ainda restauram a BD; documentos não são repostos.

### Permissões do SQL Server (instalação local portável)

Para o backup/restauro funcionar **à primeira** em qualquer máquina, sem ter de configurar permissões NTFS para a conta do serviço SQL Server na pasta `PirofafeData`:

- **Backup:** o `.bak` é escrito primeiro na **pasta de backups padrão da instância** (`SERVERPROPERTY('InstanceDefaultBackupPath')`), onde o SQL Server tem sempre permissões nativas. Depois, a **API (C#)** move o ficheiro para `PirofafeData/Backups`. Se o move falhar, o ficheiro órfão na pasta do SQL é apagado.
- **Restauro:** simétrico — a API copia o `.bak` (já decifrado, se aplicável) de volta para a pasta padrão do SQL antes do `RESTORE`, e apaga essa cópia temporária no fim.
- **Fallback:** se `InstanceDefaultBackupPath` for `NULL` (LocalDB / SQL Express, que correm sob a **mesma conta** da app e já têm acesso a `PirofafeData`), o sistema escreve/lê directamente no destino final — comportamento anterior. **Confirmado:** em LocalDB 2019 (15.x) a propriedade devolve `NULL` e o backup/restauro directo na pasta da app funciona, pois o motor corre como o utilizador que criou a pasta.
- **Discos diferentes (C:\ vs D:\):** quando a pasta do SQL e o `CaminhoRaizDados` estão em volumes distintos, o move usa automaticamente **Copy + Delete** (mover entre volumes não é atómico). No mesmo volume usa `File.Move` directo.
- **Temporários órfãos:** os `*.tmp` da cifragem atómica (em `Backups`) e os plaintext de restauro (em `TEMP`) são varridos no **arranque** do serviço e após cada backup (apaga só os com >1 h, para nunca tocar numa escrita em curso). Evita acumulação de lixo após queda de energia.

> O ZIP de documentos é sempre criado/lido pela API (não pelo SQL Server), por isso nunca sofreu deste problema de permissões.

---

## RPO e RTO (objetivos de recuperação)

Definições usadas na operação do PIROFAFE.

| Sigla | Significado | Pergunta que responde |
|-------|-------------|------------------------|
| **RPO** (Recovery Point Objective) | Ponto de recuperação — quanto **dado se perde no máximo** se houver falha agora | «Até onde voltamos no tempo?» |
| **RTO** (Recovery Time Objective) | Tempo de recuperação — quanto demora até a app voltar a ser **utilizável** após decisão de restaurar | «Quanto tempo até estar outra vez a trabalhar?» |

Isto **não** é alta disponibilidade (o sistema não falha “sem se notar”). É **backup + restauro manual** por um administrador.

### O que o sistema garante hoje (análise honesta)

| Mecanismo | Implementação | Efeito no RPO |
|-----------|---------------|---------------|
| Backup **automático** | `DatabaseBackupHostedService` — 1× por dia, hora local (`Backups:HoraDiaria` / `MinutoDiario`, omissão **19:00**) | Perda máxima de dados ≈ **24 horas** entre dois backups automáticos consecutivos (se a API esteve ligada e o job correu) |
| Backup **manual** | Definições → «Executar backup agora» (`POST /api/admin/backups/run`) | RPO **próximo de zero** até ao instante do backup (BD + `Uploads`) |
| Antes de **limpar dados** | UI sugere recuperar último backup se existir `.bak` em disco | Evita apagar sem rede de segurança; não substitui backup recente |
| **Retenção** | `Backups:RetencaoDias` (omissão **30** dias) | Permite escolher um ponto nos últimos 30 dias, não melhora o RPO do último backup |
| **Off-site / cloud** | Não implementado | Se o disco do servidor falhar, perdem-se BD, `Uploads` **e** `.bak` no mesmo sítio |

| Fase do restauro | Efeito no RTO (ordem de grandeza, BD de desenvolvimento / poucos GB) |
|------------------|-----------------------------------------------------------------------------|
| Administrador decide restaurar e inicia sessão Admin | Minutos (depende da pessoa) |
| `RESTORE DATABASE` (SQL Server) | ~5–30 min (tamanho da BD, disco, LocalDB vs servidor) |
| Extração do ZIP para `Uploads` | ~1–10 min (tamanho dos documentos) |
| Utilizadores voltam a fazer login (tokens/sessões invalidados pelo estado da BD) | ~5 min |
| **Total alvo (RTO)** | **~30–60 minutos** em desenvolvimento / instalação típica; produção com BD grande pode ser **horas** |

### Objetivos acordados (MVP)

Valores **alvo** com o desenho atual — não SLA contratual.

| Cenário | RPO alvo | RTO alvo | Como cumprir |
|---------|----------|----------|--------------|
| **Operação normal** (só backup automático) | ≤ **24 h** | ≤ **60 min** | Manter API ligada para o job diário; em falha, restaurar o `.bak` mais recente em Definições |
| **Antes de limpar dados, migração ou release crítica** | ≤ **5 min** | ≤ **60 min** | Backup **manual** imediato; confirmar entrada no histórico (BD + docs) |
| **Após «Limpar tudo» (Development)** | Depende do último `.bak` em disco (pode ser de **antes** do reset) | ≤ **60 min** | Criar novo admin → Definições → **Restaurar** o backup desejado (não apagar `.bak` se precisar desse ponto) |

**Janela de perda de dados (exemplo):** backup automático às 19:00. Falha às 18:00 do dia seguinte → no máximo perdem-se ~23 h de alterações desde o backup anterior. Falha às 19:01 → perda ≈ 24 h.

### Cenários de falha (o que cobre / não cobre)

| Cenário | Coberto? | Nota |
|---------|----------|------|
| Erro humano (apagar registo, limpar BD em dev) | ✅ Parcial | Restauro do último `.bak` + ZIP; backup manual prévio melhora RPO |
| Corrupção da BD | ✅ Parcial | Restauro do último backup **anterior** à corrupção |
| Disco do servidor / pasta `PirofafeData` perdido | ❌ | Backups no **mesmo** servidor; plano futuro: cópia **off-site** |
| API desligada semanas (job diário não corre) | ❌ | RPO degradado — último `.bak` pode estar velho |
| Necessidade de zero downtime | ❌ | `RESTORE` implica indisponibilidade durante o restauro |

### Testes de restauro (processo recomendado)

Backup sem teste de restauro é **não fiável**. Processo mínimo:

| Frequência | Quem | Passos |
|------------|------|--------|
| **Antes de release / go-live** | Admin (dev) | 1) Criar dado de teste + PDF em `Uploads` → 2) Backup manual → 3) Alterar/apagar dado → 4) Restaurar o `.bak` → 5) Confirmar dado e PDF |
| **Mensal** (se o sistema estiver em uso contínuo) | Admin | Repetir o mesmo em ambiente de teste ou após horário de baixo uso |
| **Após mudança de versão** (migrações EF) | Dev | Restauro de um `.bak` pré-migração numa cópia da BD de teste |

Registar data e resultado (ex.: linha na tabela abaixo ou issue «Restore test OK»).

| Data | Versão / commit | Backup usado | BD + docs OK? | Observações |
|------|-----------------|--------------|---------------|-------------|
| 2026-05-25 | `9baf5b3` | `db-backup_FinalprojContext_20260525_015203.bak` (+ `_uploads.zip`) | **Sim** | Script `scripts/test-restore-backup-rpo.ps1`: cliente + PDF → backup manual → DELETE → restore → cliente e PDF `%PDF` OK (~12 s). |
| 2026-06-09 | staging SQL | `db-backup_*` via pasta padrão do SQL | **Não testado** | Staging simétrico (backup/restauro via pasta padrão do SQL). Validar com `scripts/test-restore-backup-rpo.ps1` (API em Development) antes de marcar como OK. |

### Como melhorar RPO/RTO (evolução)

| Medida | Impacto principal |
|--------|-------------------|
| Backup manual antes de operações críticas | RPO ↓ |
| Aumentar frequência do job (ex. 12/12 h) — requer config/código | RPO ↓ |
| Cópia off-site dos ficheiros em `Backups/` | Sobrevivência se disco morrer (não reduz RPO por si) |
| Encriptação dos `.bak`/ZIP | Segurança, não RPO/RTO |
| BD de teste só para `RESTORE` ensaios | RTO ↓ (equipa treinada) |

**Resumo:** RPO até 24 h com backup automático diário; RPO próximo de zero com backup manual antes de operações críticas; RTO alvo ~1 h para restauro por um administrador. Cobre recuperação após erro operacional, não disaster recovery multi-sítio.

---

Configuração: secção **`Backups`** em `appsettings` ou variáveis `Backups__*`.

| Chave | Nota |
|-------|------|
| `UsarCompressao` | `false` por omissão. **LocalDB / SQL Express** não suportam `COMPRESSION` no `BACKUP DATABASE` — ativar só em SQL Server Standard+ em produção. |

**Produção:** considerar volume dedicado para `.bak` e cópias externas; monitorizar espaço em disco.

---

## Dados locais (`PirofafeData`)

Pastas criadas automaticamente no arranque da API (ignoradas pelo Git — ver `.gitignore`):

| Pasta | Conteúdo |
|-------|----------|
| `PirofafeData/Uploads/` | Documentos de clientes, funcionários, paióis, serviços (paths relativos na BD) |
| `PirofafeData/Backups/` | Cópias `.bak` da base de dados |

Configuração: secção **`DadosLocais`** em `appsettings` (`NomePastaDados`, `SubPastaDocumentos`, `SubPastaBackups`, `CaminhoRaizDados` opcional). **`UsarFallbackWwwroot`** deve permanecer `false` — uploads só em `PirofafeData/Uploads`; `wwwroot` da API é apenas `favicon.ico`.

### Caminhos portáteis (`CaminhoRaizDados` vs `NomePastaDados`)

O caminho físico final é sempre **`{âncora}/{NomePastaDados}/{Uploads|Backups}`**:

| Chave | Papel | Omissão |
|-------|-------|---------|
| `CaminhoRaizDados` | **Âncora** onde nasce a pasta de dados. Vazio → usa o `ContentRootPath` da API (junto ao projeto). Preenchido → tem de ser **caminho absoluto** (ex.: `D:\Pirofafe_Dados_Empresa`, `E:\dados`, ou um caminho POSIX em Linux). | `""` |
| `NomePastaDados` | Nome da pasta de dados criada **dentro** da âncora. | `PirofafeData` |
| `SubPastaDocumentos` / `SubPastaBackups` | Subpastas de uploads e `.bak`. | `Uploads` / `Backups` |

Exemplo — mover a instalação para outro disco:

```json
"DadosLocais": {
  "CaminhoRaizDados": "D:\\Pirofafe_Dados_Empresa",
  "NomePastaDados": "PirofafeData"
}
```

→ resolve para `D:\Pirofafe_Dados_Empresa\PirofafeData\Uploads` e `...\Backups`.

**Migrar entre PCs Windows da empresa:** 1) parar a API; 2) copiar a pasta `PirofafeData` (ou a raiz absoluta inteira) para o disco do PC novo; 3) ajustar `CaminhoRaizDados` no `appsettings` do PC novo para o novo caminho; 4) arrancar a API. No arranque, `ArquivosRaizService` **valida** que o caminho é absoluto e criável (caso contrário, falha cedo com erro claro) e **regista em `Information`** os caminhos finais de `UploadsRoot` e `BackupsRoot` resolvidos — útil para confirmar que o PC novo aponta para o sítio certo.

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
