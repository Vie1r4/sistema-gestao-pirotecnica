using Finalproj.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Data
{
    public static class SeedRoles
    {
        /// <summary>Email e role para cada conta de teste por cargo. Só criados se o email ainda não existir.</summary>
        private static readonly (string Email, string Role)[] ContasPorCargo =
        {
            ("admin@pirofafe.pt", ConstantesRoles.Admin),
            ("gestor@pirofafe.pt", ConstantesRoles.Gestor),
            ("comercial@pirofafe.pt", ConstantesRoles.Comercial),
            ("armazem@pirofafe.pt", ConstantesRoles.Armazem),
        };

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

            // Criar uma conta por cargo (se o email ainda não existir)
            await CriarContasPorCargoAsync(serviceProvider, userManager);
        }

        private static async Task CriarContasPorCargoAsync(IServiceProvider serviceProvider, UserManager<IdentityUser> userManager)
        {
            var config = serviceProvider.GetService<IConfiguration>();
            var enabled = string.Equals(config?["SeedUsers:Enabled"]?.Trim(), "true", StringComparison.OrdinalIgnoreCase);
            if (!enabled)
                return;

            var password = config?["SeedUsers:Password"]?.Trim();
            if (string.IsNullOrEmpty(password))
                return;

            foreach (var (email, role) in ContasPorCargo)
            {
                var existing = await userManager.FindByEmailAsync(email);
                if (existing != null)
                    continue;

                var user = new IdentityUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(user, password);
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(user, role);
            }

            var adminEmail = config?["SeedUsers:AdminEmail"]?.Trim();
            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                var userMax = await userManager.FindByEmailAsync(adminEmail);
                if (userMax != null)
                {
                    if (!await userManager.IsInRoleAsync(userMax, ConstantesRoles.Admin))
                        await userManager.AddToRoleAsync(userMax, ConstantesRoles.Admin);
                    foreach (var roleName in ConstantesRoles.Todas)
                    {
                        if (roleName != ConstantesRoles.Admin && !await userManager.IsInRoleAsync(userMax, roleName))
                            await userManager.AddToRoleAsync(userMax, roleName);
                    }
                }
            }
        }
    }
}
