# Testes unitários — domínio (encomendas e stock)

## Localização

| Projeto | Caminho |
|---------|---------|
| **Finalproj.Tests** | `Finalproj.Tests/` (na raiz do repositório, ao lado de `Finalproj.csproj`) |

Estrutura:

```
Finalproj.Tests/
├── Finalproj.Tests.csproj
├── TestHelpers/
│   ├── TestDbContextFactory.cs    # EF Core InMemory isolado por nome
│   └── NoOpLogSistemaService.cs   # ILogSistemaService sem efeitos (preparação de encomenda)
└── Domain/
    ├── EncomendaServiceTests.cs   # RegistarPreparacaoAsync: validações, FIFO, estado
    └── StockDisponivelServiceTests.cs  # entradas, saídas, reservas, piso zero
```

## Como correr

Na raiz do repositório (com .NET 8 SDK):

```bash
dotnet test Finalproj.Tests/Finalproj.Tests.csproj
```

Ou, com a solução aberta:

```bash
dotnet test Finalproj.sln
```

**CI:** o workflow [`.github/workflows/dotnet-tests.yml`](../../.github/workflows/dotnet-tests.yml) corre estes testes em PR/push (branches `main` / `next`) quando mudam ficheiros do backend ou de `Finalproj.Tests/`.

## Abordagem

- **xUnit** + **Microsoft.EntityFrameworkCore.InMemory** — os serviços (`EncomendaService`, `StockDisponivelService`) dependem de `FinalprojContext`; os testes usam uma base **em memória** por execução, com dados mínimos (cliente, produto, paiol, encomenda, entradas).
- **Não** substituem testes de integração contra SQL Server; cobrem as regras de **domínio** e o fluxo **FIFO** na preparação.
- `ILogSistemaService` é um **no-op** para não acumular linhas de auditoria nos testes.

## Extensão futura

- Testes de integração com **SQLite** ou **SQL Server** de teste para diferenças de tradução LINQ.
- Casos adicionais: saídas pré-existentes que reduzem stock por lote, múltiplos produtos na mesma encomenda.
