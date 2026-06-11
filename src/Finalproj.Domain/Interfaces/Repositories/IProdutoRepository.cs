namespace Finalproj.Domain.Interfaces.Repositories;

public interface IProdutoRepository
{
    Task<Produto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Produto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Produto entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Produto entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Produto entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Produto>> SearchAsync(
        string? pesquisa,
        string? classificacao,
        string? grupoCompatibilidade,
        string? filtroTecnico,
        string? calibre,
        CancellationToken cancellationToken = default);

    Task<Produto?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);
    Task<int> CountExistentesEmAsync(DateTime ateUtcExclusive, CancellationToken cancellationToken = default);
}

