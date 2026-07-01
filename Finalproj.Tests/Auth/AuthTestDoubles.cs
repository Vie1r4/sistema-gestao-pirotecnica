using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Tests.Auth;

internal sealed class RecordingEmailSender : IEmailSender
{
    public List<(string Email, string Subject, string Html)> Sent { get; } = [];

    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        Sent.Add((email, subject, htmlMessage));
        return Task.CompletedTask;
    }
}

internal sealed class FakePasswordValidation : IPasswordValidationService
{
    public IReadOnlyList<string> Errors { get; set; } = [];

    public Task<IReadOnlyList<string>> ValidateAsync(
        string password,
        string? userName,
        string? email,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(Errors);
}

internal sealed class ConfigurableIdentityGateway : IAuthIdentityGateway
{
    public Dictionary<string, AuthUserSnapshot> UsersById { get; } = new();
    public Dictionary<string, AuthUserSnapshot> UsersByEmail { get; } = new();
    public string ResetToken { get; set; } = "identity-reset-token";
    public string ConfirmToken { get; set; } = "identity-confirm-token";
    public bool VerifyEmailOk { get; set; } = true;
    public AuthIdentityResult ResetPasswordResult { get; set; } = AuthIdentityResult.Ok();
    public AuthIdentityResult ConfirmEmailResult { get; set; } = AuthIdentityResult.Ok();
    public bool EmailConfirmedAfterReset { get; set; }

    public Task<AuthUserSnapshot?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(UsersById.TryGetValue(userId, out var user) ? user : null);

    public Task<AuthUserSnapshot?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        Task.FromResult(UsersByEmail.TryGetValue(email.ToLowerInvariant(), out var user)
            ? user
            : UsersByEmail.Values.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));

    public Task<IList<string>> GetRolesAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult<IList<string>>([]);

    public Task<string> GeneratePasswordResetTokenAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(ResetToken);

    public Task<AuthIdentityResult> ResetPasswordAsync(
        string userId,
        string token,
        string newPassword,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(ResetPasswordResult);

    public Task<bool> VerifyEmailConfirmationTokenAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(VerifyEmailOk);

    public Task<AuthIdentityResult> ConfirmEmailAsync(
        string userId,
        string token,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(ConfirmEmailResult);

    public Task<string> GenerateEmailConfirmationTokenAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(ConfirmToken);

    public Task SetEmailConfirmedAsync(string userId, bool confirmed, CancellationToken cancellationToken = default)
    {
        if (confirmed)
            EmailConfirmedAfterReset = true;
        return Task.CompletedTask;
    }
}

internal sealed class FakeAuthTokenService : IAuthTokenService
{
    public int RefreshTokenExpirationDays => 7;

    public AuthSessionTokens Session { get; set; } = new(
        "access-token",
        "refresh-token",
        3600,
        "user@teste.pt",
        "Utilizador Teste",
        ["Admin"]);

    public Task<AuthSessionTokens> IssueSessionAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(Session);

    public Task<AuthSessionTokens> IssueSessionAsync(
        string userId,
        string email,
        string nome,
        IList<string> roles,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(Session with { Email = email, NomeExibir = nome, Roles = roles });

    public Task<AuthTokenRefreshResult> RefreshAsync(string? rawRefreshToken, CancellationToken cancellationToken = default) =>
        Task.FromResult(AuthTokenRefreshResult.Invalid());

    public Task RevokeRefreshTokenIfPresentAsync(string? rawRefreshToken, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}

internal static class AuthTestConfiguration
{
    public static IConfiguration Create() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Frontend:BaseUrl"] = "http://localhost:3000",
            })
            .Build();
}
