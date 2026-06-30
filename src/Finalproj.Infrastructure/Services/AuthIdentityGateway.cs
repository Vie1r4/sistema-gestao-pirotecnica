using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Finalproj.Infrastructure.Services;

public sealed class AuthIdentityGateway(UserManager<IdentityUser> userManager) : IAuthIdentityGateway
{
    private readonly UserManager<IdentityUser> _userManager = userManager;

    public async Task<AuthUserSnapshot?> FindByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user == null ? null : Map(user);
    }

    public async Task<AuthUserSnapshot?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user == null ? null : Map(user);
    }

    public async Task<IList<string>> GetRolesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user == null ? Array.Empty<string>() : await _userManager.GetRolesAsync(user);
    }

    public async Task<string> GeneratePasswordResetTokenAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        return await _userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<AuthIdentityResult> ResetPasswordAsync(
        string userId,
        string token,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded
            ? AuthIdentityResult.Ok()
            : AuthIdentityResult.Fail(result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<bool> VerifyEmailConfirmationTokenAsync(string userId, string token, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return false;
        var provider = _userManager.Options.Tokens.EmailConfirmationTokenProvider;
        return await _userManager.VerifyUserTokenAsync(user, provider, "EmailConfirmation", token);
    }

    public async Task<AuthIdentityResult> ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        var result = await _userManager.ConfirmEmailAsync(user, token);
        return result.Succeeded
            ? AuthIdentityResult.Ok()
            : AuthIdentityResult.Fail(result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<string> GenerateEmailConfirmationTokenAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    public async Task SetEmailConfirmedAsync(string userId, bool confirmed, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        user.EmailConfirmed = confirmed;
        await _userManager.UpdateAsync(user);
    }

    private static AuthUserSnapshot Map(IdentityUser user) =>
        new(user.Id!, user.Email ?? user.UserName ?? "", user.UserName ?? "", user.EmailConfirmed);
}
