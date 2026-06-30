using Finalproj.Application.Features.Auth.Email;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Application.Features.Auth.Services;

public sealed class AuthPasswordResetService(
    IConfiguration configuration,
    IAuthIdentityGateway identityGateway,
    IEmailSender emailSender,
    IPasswordValidationService passwordValidation) : IAuthPasswordResetService
{
    public async Task SendForgotPasswordEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await identityGateway.FindByEmailAsync(email, cancellationToken);
        if (user == null)
            return;

        var token = await identityGateway.GeneratePasswordResetTokenAsync(user.UserId, cancellationToken);
        var encoded = Base64UrlTokenCodec.Encode(token);
        var link = AuthFrontendLinks.PasswordReset(configuration, email, encoded);
        var (subject, html) = AuthEmailTemplates.PasswordReset(link);
        await emailSender.SendEmailAsync(email, subject, html);
    }

    public async Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details)> ResetPasswordAsync(
        string email,
        string token,
        string newPassword,
        string? confirmPassword,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(confirmPassword) && newPassword != confirmPassword)
            return (false, "A palavra-passe e a confirmação não coincidem.", null);

        var user = await identityGateway.FindByEmailAsync(email, cancellationToken);
        if (user == null)
            return (false, "Pedido inválido.", null);

        var passwordErrors = await passwordValidation.ValidateAsync(newPassword, user.UserName, user.Email, cancellationToken);
        if (passwordErrors.Count > 0)
            return (false, "A palavra-passe não cumpre os requisitos.", passwordErrors.ToList());

        string decodedToken;
        try
        {
            decodedToken = PasswordResetTokenDecoder.Decode(token);
        }
        catch (FormatException)
        {
            return (false, "Token inválido ou expirado. Peça um novo link em «Esqueci-me da palavra-passe».", null);
        }

        var result = await identityGateway.ResetPasswordAsync(user.UserId, decodedToken, newPassword, cancellationToken);
        if (!result.Succeeded)
        {
            var invalidToken = result.Errors.Any(d =>
                d.Contains("Invalid token", StringComparison.OrdinalIgnoreCase)
                || d.Contains("inválido", StringComparison.OrdinalIgnoreCase));
            return (false,
                invalidToken
                    ? "Token inválido ou expirado. Peça um novo link em «Esqueci-me da palavra-passe»."
                    : "Não foi possível redefinir a palavra-passe.",
                result.Errors);
        }

        if (!user.EmailConfirmed)
            await identityGateway.SetEmailConfirmedAsync(user.UserId, true, cancellationToken);

        return (true, null, null);
    }
}
