namespace Finalproj.Application.Features.Auth.Interfaces;

public interface IAuthAccountInfoService
{
    Task<string> GetNomeUtilizadorAsync(string userId, CancellationToken cancellationToken = default);
    Task<string> CreateRefreshTokenAsync(string userId, int expirationDays, Func<string, string> hashToken, CancellationToken cancellationToken = default);
    Task<RefreshToken?> GetActiveRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
}
