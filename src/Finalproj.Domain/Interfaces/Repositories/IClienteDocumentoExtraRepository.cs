namespace Finalproj.Domain.Interfaces.Repositories;

public interface IClienteDocumentoExtraRepository
{
    Task<IReadOnlyList<ClienteDocumentoExtra>> ListByClienteAndIdsAsync(int clienteId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<ClienteDocumentoExtra?> GetByClienteAndIdNoTrackingAsync(int clienteId, int id, CancellationToken cancellationToken = default);
    Task<ClienteDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(ClienteDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ClienteDocumentoExtra> entities);
}

