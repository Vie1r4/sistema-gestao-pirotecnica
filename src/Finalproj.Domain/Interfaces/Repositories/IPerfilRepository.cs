namespace Finalproj.Domain.Interfaces.Repositories;

public interface IPerfilRepository
{
    Task<Perfil?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Perfil entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Perfil entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Perfil entity, CancellationToken cancellationToken = default);

    Task<Perfil?> GetByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    Task<Perfil?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<string?> GetNomeByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Perfil>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<Perfil> entities);
}

