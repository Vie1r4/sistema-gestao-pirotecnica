using Finalproj.Application.Features.Auth.DTOs;

namespace Finalproj.Application.Features.Auth.Interfaces;

public interface IAuthBootstrapService
{
    bool IsBootstrapEnabled { get; }

    Task<bool> AnyUsersExistAsync(CancellationToken cancellationToken = default);

    Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details, AuthSessionTokens? Session)> RegisterFirstAdminAsync(
        string email,
        string password,
        string? nome,
        CancellationToken cancellationToken = default);
}
