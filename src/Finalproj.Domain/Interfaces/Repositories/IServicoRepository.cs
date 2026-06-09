namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoRepository
{
    Task<Servico?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Servico>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Servico entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Servico entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Servico entity, CancellationToken cancellationToken = default);

    Task<bool> ExistsParaEncomendaAsync(int encomendaId, int? excludeServicoId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetEncomendaIdsAssociadasAsync(int? excludeServicoId, CancellationToken cancellationToken = default);
    Task<Servico?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Servico> Items, int Total)> ListPagedWithIncludesAsync(
        int? clienteId,
        DateTime? dataDesde,
        DateTime? dataAteExclusive,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);

    Task<Servico?> GetByIdFullGraphNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Servico?> GetByIdWithZonasTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(int Id, string Nome)>> ListClientesIdNomeOrderedAsync(CancellationToken cancellationToken = default);
}

