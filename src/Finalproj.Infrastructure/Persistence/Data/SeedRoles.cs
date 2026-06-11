using Finalproj.Domain.Constants;
using Microsoft.AspNetCore.Identity;

namespace Finalproj.Infrastructure.Persistence.Data;

/// <summary>
/// Garante roles ASP.NET Identity no arranque. Não cria utilizadores nem dados de negócio.
/// </summary>
public static class SeedRoles
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var roleName in ConstantesRoles.Todas)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
                await roleManager.CreateAsync(new IdentityRole(roleName));
        }

        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();

        // Migrar utilizadores com role "Técnico" para "Gestor" (cargo renomeado)
        if (await roleManager.RoleExistsAsync("Técnico"))
        {
            var usersTecnico = await userManager.GetUsersInRoleAsync("Técnico");
            if (!await roleManager.RoleExistsAsync(ConstantesRoles.Gestor))
                await roleManager.CreateAsync(new IdentityRole(ConstantesRoles.Gestor));
            foreach (var u in usersTecnico)
            {
                await userManager.RemoveFromRoleAsync(u, "Técnico");
                if (!await userManager.IsInRoleAsync(u, ConstantesRoles.Gestor))
                    await userManager.AddToRoleAsync(u, ConstantesRoles.Gestor);
            }
            var roleTecnico = await roleManager.FindByNameAsync("Técnico");
            if (roleTecnico != null)
                await roleManager.DeleteAsync(roleTecnico);
        }

        var users = userManager.Users.ToList();
        if (users.Count > 0)
        {
            var algumAdmin = await userManager.GetUsersInRoleAsync(ConstantesRoles.Admin);
            if (algumAdmin.Count == 0)
                await userManager.AddToRoleAsync(users[0], ConstantesRoles.Admin);
        }
    }
}
