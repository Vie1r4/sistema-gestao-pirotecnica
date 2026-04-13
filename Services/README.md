# Serviços da aplicação

As **interfaces** ficam na raiz (`Finalproj.Services`) e são usadas pelos controllers e por outros serviços. As **implementações** estão organizadas em:

## Domain (`Services/Domain/`)

Regras de negócio e lógica de domínio, com dependência apenas de dados (DbContext) e de outras interfaces de serviço:

- **EncomendaService** — preparação de encomendas (FIFO, validações de estado e acesso a paióis)
- **StockDisponivelService** — cálculo de stock disponível por produto (entradas − saídas − reservas)
- **ServicoService** — validações (responsável ADR+licença, equipa com licença), equipa, resumo de material, distâncias de segurança, dados para formulários Create/Edit e casos Criar/Atualizar serviço

## Infrastructure (`Services/Infrastructure/`)

Implementações que dependem de I/O, HTTP ou infraestrutura (ficheiros, email, Identity):

- **LogSistemaService** — auditoria (gravação em BD)
- **DocumentoStorageService** — guardar/apagar ficheiros em wwwroot
- **EmailSender** — envio de email (SMTP ou ficheiro)
- **IdentityErrorDescriberPt** — mensagens do Identity em português
- **DatabaseBackupHostedService** — backup agendado da base SQL Server (configuração `Backups`); ver `Docs/backend/BACKUPS-AUTOMATICOS.md`

## Raiz (`Services/`)

- Interfaces: `IEncomendaService`, `IStockDisponivelService`, `IServicoService`, `ILogSistemaService`, `IDocumentoStorageService`, `IEmailSender`
- Opções partilhadas: `DocumentosOptions`

A injeção de dependências em `Program.cs` regista as implementações pelos nomes completos (`Finalproj.Services.Domain.*`, `Finalproj.Services.Infrastructure.*`). Os controllers continuam a depender apenas das interfaces.
