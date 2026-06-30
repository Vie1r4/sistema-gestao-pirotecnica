using Finalproj.Application.Features.Auth.DTOs;

namespace Finalproj.Application.Features.Auth.Interfaces;

/// <summary>Operações Identity necessárias aos fluxos de auth (implementado na Infrastructure).</summary>
public interface IAuthIdentityGateway
{
    Task<AuthUserSnapshot?> FindByIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<AuthUserSnapshot?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IList<string>> GetRolesAsync(string userId, CancellationToken cancellationToken = default);
    Task<string> GeneratePasswordResetTokenAsync(string userId, CancellationToken cancellationToken = default);
    Task<AuthIdentityResult> ResetPasswordAsync(string userId, string token, string newPassword, CancellationToken cancellationToken = default);
    Task<bool> VerifyEmailConfirmationTokenAsync(string userId, string token, CancellationToken cancellationToken = default);
    Task<AuthIdentityResult> ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default);
    Task<string> GenerateEmailConfirmationTokenAsync(string userId, CancellationToken cancellationToken = default);
    Task SetEmailConfirmedAsync(string userId, bool confirmed, CancellationToken cancellationToken = default);
}
