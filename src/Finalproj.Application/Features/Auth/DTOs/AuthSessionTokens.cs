namespace Finalproj.Application.Features.Auth.DTOs;

public sealed record AuthSessionTokens(
    string AccessToken,
    string RefreshTokenPlain,
    int ExpiresInSeconds,
    string Email,
    string NomeExibir,
    IList<string> Roles);
