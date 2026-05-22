using Finalproj.Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Finalproj.Infrastructure.Services;

/// <summary>
/// Usa <see cref="UserManager{IdentityUser}.PasswordValidators"/> — mesma política que login e reset.
/// </summary>
public sealed class IdentityPasswordValidationService(UserManager<IdentityUser> userManager) : IPasswordValidationService
{
    public async Task<IReadOnlyList<string>> ValidateAsync(
        string password,
        string? userName = null,
        string? email = null,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = new IdentityUser
        {
            UserName = string.IsNullOrWhiteSpace(userName) ? "validate@local" : userName.Trim(),
            Email = string.IsNullOrWhiteSpace(email) ? "validate@local" : email.Trim()
        };

        var errors = new List<string>();
        foreach (var validator in userManager.PasswordValidators)
        {
            var result = await validator.ValidateAsync(userManager, user, password);
            if (!result.Succeeded)
                errors.AddRange(result.Errors.Select(e => e.Description));
        }

        return errors;
    }
}
