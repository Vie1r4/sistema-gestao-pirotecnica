namespace Finalproj.Domain.Interfaces.Repositories;

public interface ICompiladoRepository
{
    Task<IReadOnlyList<Compilado>> ListAllWithItensProdutoAsync(CancellationToken cancellationToken = default);
    Task<Compilado?> GetByIdWithItensProdutoAsync(int id, CancellationToken cancellationToken = default);
    Task<Compilado?> FindTrackedByIdWithItensAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}

