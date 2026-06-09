namespace Finalproj.Domain.Interfaces.Repositories;

public interface IClienteRepository
{
    Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cliente>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Cliente entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cliente entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Cliente entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Cliente>> SearchOrderedAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default);
    Task<Cliente?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<Cliente?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cliente>> ListOrderedForSelectAsync(CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
}

