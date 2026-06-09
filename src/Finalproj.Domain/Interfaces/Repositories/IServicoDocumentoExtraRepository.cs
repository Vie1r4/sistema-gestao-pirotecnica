namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoDocumentoExtraRepository
{
    Task<IReadOnlyList<ServicoDocumentoExtra>> ListByServicoAndIdsAsync(int servicoId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<ServicoDocumentoExtra?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ServicoDocumentoExtra> entities);
}

