namespace Finalproj.Application.Features.Clientes.Interfaces;

public interface IClienteApplicationService
{
    Task<IReadOnlyList<Cliente>> SearchAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default);
    Task<Cliente?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default);
    Task<object?> GetDetailsAsync(int id, int historicoPagina, int historicoPageSize, CancellationToken cancellationToken = default);
    Task<Cliente> CreateAsync(Cliente cliente, IEnumerable<ClienteDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default);
    Task AddDocumentosExtrasAsync(int clienteId, IEnumerable<ClienteDocumentoExtra> documentosExtras, CancellationToken cancellationToken = default);
    Task<Cliente?> UpdateAsync(int id, Cliente cliente, IEnumerable<ClienteDocumentoExtra>? novosDocumentos = null, IReadOnlyCollection<int>? removerDocumentoIds = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<string?> GetDocumentoExtraPathForClienteAsync(int clienteId, int docId, CancellationToken cancellationToken = default);
}
