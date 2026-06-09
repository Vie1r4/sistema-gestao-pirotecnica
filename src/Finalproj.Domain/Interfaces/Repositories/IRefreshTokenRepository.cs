namespace Finalproj.Domain.Interfaces.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(RefreshToken entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(RefreshToken entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(RefreshToken entity, CancellationToken cancellationToken = default);

    Task<RefreshToken?> FindActiveByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<RefreshToken?> FindActiveOrRevokedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RefreshToken>> ListActiveByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
}

