namespace Finalproj.Domain.Interfaces.Repositories;

public interface IPaiolDocumentoExtraRepository
{
    Task<IReadOnlyList<PaiolDocumentoExtra>> ListByPaiolAndIdsAsync(int paiolId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<PaiolDocumentoExtra?> GetByPaiolAndIdNoTrackingAsync(int paiolId, int id, CancellationToken cancellationToken = default);
    Task<PaiolDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(PaiolDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<PaiolDocumentoExtra> entities);
}

