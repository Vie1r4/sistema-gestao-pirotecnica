using Finalproj.Application.Features.Auth.DTOs;

namespace Finalproj.Application.Features.Auth.Interfaces;

public interface IAuthTokenService
{
    int RefreshTokenExpirationDays { get; }

    Task<AuthSessionTokens> IssueSessionAsync(string userId, CancellationToken cancellationToken = default);

    Task<AuthSessionTokens> IssueSessionAsync(
        string userId,
        string email,
        string nome,
        IList<string> roles,
        CancellationToken cancellationToken = default);

    Task<AuthTokenRefreshResult> RefreshAsync(string? rawRefreshToken, CancellationToken cancellationToken = default);

    Task RevokeRefreshTokenIfPresentAsync(string? rawRefreshToken, CancellationToken cancellationToken = default);
}
