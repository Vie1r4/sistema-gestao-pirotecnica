namespace Finalproj.Domain.Interfaces.Repositories;

public interface IPaiolRepository
{
    Task<Paiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Paiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Paiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Paiol entity, CancellationToken cancellationToken = default);

    Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default);
    Task<int> CountAtivosExistentesEmAsync(DateTime ateUtcExclusive, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListByIdsOrderedAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListAllOrderedAsync(CancellationToken cancellationToken = default);
    Task<Paiol?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Paiol?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}

