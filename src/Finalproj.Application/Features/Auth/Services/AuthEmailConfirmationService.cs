using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Email;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Application.Features.Auth.Services;

public sealed class AuthEmailConfirmationService(
    IConfiguration configuration,
    IAuthIdentityGateway identityGateway,
    IAuthTokenService tokenService,
    IEmailSender emailSender) : IAuthEmailConfirmationService
{
    public async Task SendConfirmationEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await identityGateway.FindByEmailAsync(email, cancellationToken);
        if (user == null || user.EmailConfirmed)
            return;

        var token = await identityGateway.GenerateEmailConfirmationTokenAsync(user.UserId, cancellationToken);
        var encoded = Base64UrlTokenCodec.Encode(token);
        var confirmUrl = AuthFrontendLinks.ConfirmEmail(configuration, user.UserId, encoded);
        var (subject, html) = AuthEmailTemplates.EmailConfirmation(confirmUrl);
        await emailSender.SendEmailAsync(email, subject, html);
    }

    public async Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details, AuthSessionTokens? Session)> ConfirmEmailAsync(
        string userId,
        string code,
        CancellationToken cancellationToken = default)
    {
        var user = await identityGateway.FindByIdAsync(userId, cancellationToken);
        if (user == null)
            return (false, "Utilizador não encontrado.", null, null);

        var decodedCode = Base64UrlTokenCodec.DecodeToStringOrRaw(code);

        var okToken = await identityGateway.VerifyEmailConfirmationTokenAsync(userId, decodedCode, cancellationToken);
        if (!okToken)
            return (false, "Link inválido ou expirado. Peça um novo email de confirmação.", null, null);

        if (!user.EmailConfirmed)
        {
            var result = await identityGateway.ConfirmEmailAsync(userId, decodedCode, cancellationToken);
            if (!result.Succeeded)
                return (false, "Não foi possível confirmar o email.", result.Errors, null);
        }

        var session = await tokenService.IssueSessionAsync(userId, cancellationToken);
        return (true, null, null, session);
    }
}
