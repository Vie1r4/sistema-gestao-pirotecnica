namespace Finalproj.Application.Features.Auth.Interfaces;

public interface IAuthPasswordResetService
{
    Task SendForgotPasswordEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword,
        string? confirmPassword,
        CancellationToken cancellationToken = default);
}
