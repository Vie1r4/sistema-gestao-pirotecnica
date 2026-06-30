namespace Finalproj.Application.Features.Auth.DTOs;

public sealed record AuthTokenRefreshResult(
    bool Succeeded,
    string? Error,
    string? AccessToken = null,
    string? RefreshTokenPlain = null,
    int ExpiresInSeconds = 0)
{
    public static AuthTokenRefreshResult MissingToken() =>
        new(false, "Refresh token em falta.");

    public static AuthTokenRefreshResult Invalid() =>
        new(false, "Refresh token inválido ou expirado.");

    public static AuthTokenRefreshResult UserNotFound() =>
        new(false, "Utilizador não encontrado.");

    public static AuthTokenRefreshResult Success(string accessToken, string refreshTokenPlain, int expiresInSeconds) =>
        new(true, null, accessToken, refreshTokenPlain, expiresInSeconds);
}
