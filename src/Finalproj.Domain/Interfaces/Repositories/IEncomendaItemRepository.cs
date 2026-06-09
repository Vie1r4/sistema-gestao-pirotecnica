namespace Finalproj.Domain.Interfaces.Repositories;

public interface IEncomendaItemRepository
{
    Task AddAsync(EncomendaItem entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<EncomendaItem> entities);
    Task<IReadOnlyList<EncomendaItem>> ListByEncomendaIdWithProdutoNoTrackingAsync(int encomendaId, CancellationToken cancellationToken = default);
}

