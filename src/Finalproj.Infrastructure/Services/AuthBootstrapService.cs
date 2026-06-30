using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

public sealed class AuthBootstrapService(
    UserManager<IdentityUser> userManager,
    IIdentityUserLookupService identityUsers,
    IPasswordValidationService passwordValidation,
    IAuthTokenService tokenService,
    IOptions<BootstrapOptions> bootstrapOptions) : IAuthBootstrapService
{
    public bool IsBootstrapEnabled => bootstrapOptions.Value.AllowFirstUserRegistration;

    public Task<bool> AnyUsersExistAsync(CancellationToken cancellationToken = default) =>
        identityUsers.AnyUsersAsync(cancellationToken);

    public async Task<(bool Succeeded, string? Error, IReadOnlyList<string>? Details, AuthSessionTokens? Session)> RegisterFirstAdminAsync(
        string email,
        string password,
        string? nome,
        CancellationToken cancellationToken = default)
    {
        if (!IsBootstrapEnabled)
            return (false, "Bootstrap desativado.", null, null);

        if (await identityUsers.AnyUsersAsync(cancellationToken))
            return (false, "Já existem utilizadores no sistema. Utilize o início de sessão.", null, null);

        var passwordErrors = await passwordValidation.ValidateAsync(password, email, email, cancellationToken);
        if (passwordErrors.Count > 0)
            return (false, "A palavra-passe não cumpre os requisitos.", passwordErrors.ToList(), null);

        var user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            return (false, result.Errors.FirstOrDefault()?.Description ?? "Não foi possível criar a conta.", null, null);

        await userManager.AddToRoleAsync(user, "Admin");
        var roles = await userManager.GetRolesAsync(user);
        var displayName = nome?.Trim() ?? email;
        var session = await tokenService.IssueSessionAsync(user.Id!, email, displayName, roles, cancellationToken);
        return (true, null, null, session);
    }
}
