using System.Text;
using Finalproj.Application.Features.Clientes.Interfaces;
using Finalproj.Application.Features.Clientes.Services;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Interfaces.Repositories;
using Xunit;

namespace Finalproj.Tests.Clientes;

public sealed class ClienteImportServiceTests
{
    [Fact]
    public async Task ImportarCsvAsync_CsvInvalido_RetornaErroGlobal()
    {
        var repo = new FakeClienteRepository();
        var app = new FakeClienteApplicationService();
        var sut = new ClienteImportService(repo, app);

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("apenas uma linha sem cabeçalho reconhecível"));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.Erros);
        Assert.Single(result.Linhas);
        Assert.Equal("erro", result.Linhas[0].Estado);
        Assert.NotNull(result.Linhas[0].Mensagem);
    }

    [Fact]
    public async Task ImportarCsvAsync_LinhaInactiva_Ignora()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"INACTIVO?"
            "1";"Cliente Inactivo";"111111111";"Sim"
            """;

        var sut = CreateSut(out _);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.TotalLinhas);
        Assert.Equal(1, result.Ignorados);
        Assert.Equal(0, result.Importados);
        Assert.Equal("ignorado", result.Linhas[0].Estado);
    }

    [Fact]
    public async Task ImportarCsvAsync_LinhaValida_Importa()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"INACTIVO?"
            "1";"Cliente Novo Lda";"222222222";"Não"
            """;

        var sut = CreateSut(out var app);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.Importados);
        Assert.Equal("importado", result.Linhas[0].Estado);
        Assert.Equal("Cliente Novo Lda", result.Linhas[0].Nome);
        Assert.Single(app.Created);
        Assert.Equal("222222222", app.Created[0].NIF);
    }

    [Fact]
    public async Task ImportarCsvAsync_NifDuplicadoModoIgnorar_Ignora()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"INACTIVO?"
            "1";"Duplicado SA";"333333333";"Não"
            """;

        var existente = new Cliente { Id = 7, Nome = "Existente", NIF = "333333333" };
        var repo = new FakeClienteRepository
        {
            NifMap = new Dictionary<string, int> { ["333333333"] = 7 },
            TrackedById = new Dictionary<int, Cliente> { [7] = existente }
        };
        var app = new FakeClienteApplicationService();
        var sut = new ClienteImportService(repo, app);

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.Ignorados);
        Assert.Equal("ignorado", result.Linhas[0].Estado);
        Assert.Equal(7, result.Linhas[0].ClienteId);
        Assert.Empty(app.Created);
    }

    [Fact]
    public async Task ImportarCsvAsync_NifDuplicadoModoAtualizar_Atualiza()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"INACTIVO?"
            "1";"Cliente Atualizado";"444444444";"Não"
            """;

        var existente = new Cliente { Id = 9, Nome = "Antigo", NIF = "444444444" };
        var repo = new FakeClienteRepository
        {
            NifMap = new Dictionary<string, int> { ["444444444"] = 9 },
            TrackedById = new Dictionary<int, Cliente> { [9] = existente }
        };
        var app = new FakeClienteApplicationService();
        var sut = new ClienteImportService(repo, app);

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "atualizar");

        Assert.Equal(1, result.Atualizados);
        Assert.Equal("atualizado", result.Linhas[0].Estado);
        Assert.Single(app.Updated);
        Assert.Equal(9, app.Updated[0].Id);
        Assert.Equal("Cliente Atualizado", app.Updated[0].Entity.Nome);
    }

    [Fact]
    public async Task ImportarCsvAsync_NomeExcedeLimite_RegistaErro()
    {
        var nomeLongo = new string('A', 201);
        var csv = $"""
            "CÓDIGO";"NOME";"NIF";"INACTIVO?"
            "1";"{nomeLongo}";"555555555";"Não"
            """;

        var sut = CreateSut(out _);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.Erros);
        Assert.Equal("erro", result.Linhas[0].Estado);
        Assert.Contains("200 caracteres", result.Linhas[0].Mensagem!, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ImportarCsvAsync_TipoInvalido_RegistaErro()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"TIPO";"INACTIVO?"
            "1";"Cliente Tipo";"666666666";"Invalido";"Não"
            """;

        var sut = CreateSut(out _);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = await sut.ImportarCsvAsync(stream, "ignorar");

        Assert.Equal(1, result.Erros);
        Assert.Contains("Tipo inválido", result.Linhas[0].Mensagem!, StringComparison.Ordinal);
    }

    private static ClienteImportService CreateSut(out FakeClienteApplicationService app)
    {
        app = new FakeClienteApplicationService();
        return new ClienteImportService(new FakeClienteRepository(), app);
    }

    private sealed class FakeClienteRepository : IClienteRepository
    {
        public Dictionary<string, int> NifMap { get; init; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<int, Cliente> TrackedById { get; init; } = new();

        public Task<Dictionary<string, int>> ListActiveNifToIdMapAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(NifMap);

        public Task<Cliente?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult(TrackedById.TryGetValue(id, out var c) ? c : null);

        public Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
            GetByIdWithDocumentosTrackedAsync(id, cancellationToken);

        public Task<IReadOnlyList<Cliente>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Cliente>>([]);

        public Task AddAsync(Cliente entity, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task UpdateAsync(Cliente entity, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task DeleteAsync(Cliente entity, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<IReadOnlyList<Cliente>> SearchOrderedAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Cliente>>([]);

        public Task<Cliente?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
            GetByIdWithDocumentosTrackedAsync(id, cancellationToken);

        public Task<IReadOnlyList<Cliente>> ListOrderedForSelectAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Cliente>>([]);

        public Task<int> CountAsync(CancellationToken cancellationToken = default) => Task.FromResult(0);

        public Task<int> CountDisponiveisEmAsync(DateTime ateUtcExclusive, CancellationToken cancellationToken = default) =>
            Task.FromResult(0);
    }

    private sealed class FakeClienteApplicationService : IClienteApplicationService
    {
        private int _nextId = 100;
        public List<Cliente> Created { get; } = [];
        public List<(int Id, Cliente Entity)> Updated { get; } = [];

        public Task<Cliente> CreateAsync(
            Cliente cliente,
            IEnumerable<ClienteDocumentoExtra>? documentosExtras = null,
            CancellationToken cancellationToken = default)
        {
            cliente.Id = _nextId++;
            Created.Add(cliente);
            return Task.FromResult(cliente);
        }

        public Task<Cliente?> UpdateAsync(
            int id,
            Cliente cliente,
            IEnumerable<ClienteDocumentoExtra>? novosDocumentos = null,
            IReadOnlyCollection<int>? removerDocumentoIds = null,
            CancellationToken cancellationToken = default)
        {
            Updated.Add((id, cliente));
            return Task.FromResult<Cliente?>(cliente);
        }

        public Task<IReadOnlyList<Cliente>> SearchAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Cliente>>([]);

        public Task<Cliente?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default) =>
            Task.FromResult<Cliente?>(null);

        public Task<object?> GetDetailsAsync(int id, int historicoPagina, int historicoPageSize, CancellationToken cancellationToken = default) =>
            Task.FromResult<object?>(null);

        public Task AddDocumentosExtrasAsync(int clienteId, IEnumerable<ClienteDocumentoExtra> documentosExtras, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default) => Task.FromResult(false);

        public Task<string?> GetDocumentoExtraPathForClienteAsync(int clienteId, int docId, CancellationToken cancellationToken = default) =>
            Task.FromResult<string?>(null);
    }
}
