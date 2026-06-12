using Finalproj.Application.Services.Interfaces;
using Finalproj.Domain.Constants;
using Microsoft.AspNetCore.Identity;

namespace Finalproj.Infrastructure.Services;

public sealed class IdentityRolesService(UserManager<IdentityUser> userManager) : IIdentityRolesService
{
    public async Task<IdentityRoleOperationResult> SetOperationalRolesAsync(
        string userId,
        IReadOnlyList<string> desiredRoles,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            return IdentityRoleOperationResult.Fail("Utilizador não encontrado.");

        var assigned = NormalizeDesiredRoles(desiredRoles);
        if (assigned.Count == 0)
            return IdentityRoleOperationResult.Fail("Selecione um cargo de acesso.");
        if (assigned.Count > 1)
            return IdentityRoleOperationResult.Fail("Selecione apenas um cargo de acesso por utilizador.");

        var desiredRole = assigned[0];
        var currentRoles = (await userManager.GetRolesAsync(user)).ToList();

        if (currentRoles.Contains(ConstantesRoles.Admin, StringComparer.OrdinalIgnoreCase)
            && !string.Equals(desiredRole, ConstantesRoles.Admin, StringComparison.OrdinalIgnoreCase))
        {
            var admins = await userManager.GetUsersInRoleAsync(ConstantesRoles.Admin);
            if (admins.Count <= 1 && admins.Any(a => a.Id == userId))
                return IdentityRoleOperationResult.Fail("Não pode remover o último administrador do sistema.");
        }

        var targetSet = new HashSet<string>(new[] { desiredRole }, StringComparer.OrdinalIgnoreCase);
        var currentSet = new HashSet<string>(currentRoles, StringComparer.OrdinalIgnoreCase);
        var rolesChanged = !targetSet.SetEquals(currentSet);

        if (!rolesChanged)
            return IdentityRoleOperationResult.Ok(rolesChanged: false);

        foreach (var role in ConstantesRoles.Todas)
        {
            var deveTer = string.Equals(role, desiredRole, StringComparison.OrdinalIgnoreCase);
            if (deveTer && !currentRoles.Contains(role))
                await userManager.AddToRoleAsync(user, role);
            else if (!deveTer && currentRoles.Contains(role))
                await userManager.RemoveFromRoleAsync(user, role);
        }

        return IdentityRoleOperationResult.Ok(
            rolesChanged: true,
            message: "Cargos atualizados.");
    }

    private static List<string> NormalizeDesiredRoles(IReadOnlyList<string> desiredRoles)
    {
        if (desiredRoles == null || desiredRoles.Count == 0)
            return [];

        return desiredRoles
            .Select(r => r.Trim())
            .Where(r => ConstantesRoles.ParaContaFuncionario.Contains(r, StringComparer.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

}
