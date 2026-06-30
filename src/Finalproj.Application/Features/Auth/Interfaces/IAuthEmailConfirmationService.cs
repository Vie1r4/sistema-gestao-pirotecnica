using Finalproj.Application.Features.Auth.DTOs;

namespace Finalproj.Application.Features.Auth.Interfaces;

public interface IAuthEmailConfirmationService
{
    Task SendConfirmationEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details, AuthSessionTokens? Session)> ConfirmEmailAsync(
        string userId,
        string code,
        CancellationToken cancellationToken = default);
}
