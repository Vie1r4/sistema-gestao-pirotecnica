using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Finalproj.Api.Helpers;

/// <summary>
/// Resolve utilizador para auditoria (logs). JWT não define <see cref="ClaimsIdentity.Name"/> —
/// usa Identity, claim «nome» ou email.
/// </summary>
public static class AuditUserResolver
{
    public static async Task<(string? UserId, string? UserName)> ResolveAsync(
        UserManager<IdentityUser> userManager,
        ClaimsPrincipal principal,
        CancellationToken cancellationToken = default)
    {
        var userId = userManager.GetUserId(principal);
        IdentityUser? user = null;
        if (!string.IsNullOrEmpty(userId))
            user = await userManager.FindByIdAsync(userId);
        user ??= await userManager.GetUserAsync(principal);

        userId ??= user?.Id;

        var userName = user?.UserName;
        if (string.IsNullOrWhiteSpace(userName))
            userName = principal.FindFirstValue("nome");
        if (string.IsNullOrWhiteSpace(userName))
            userName = principal.FindFirstValue(ClaimTypes.Email);

        return (userId, string.IsNullOrWhiteSpace(userName) ? null : userName.Trim());
    }
}
