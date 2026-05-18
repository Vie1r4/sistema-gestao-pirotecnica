using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Finalproj.IntegrationTests.Infrastructure;

public static class TestDataSeeder
{
    public const string DefaultPassword = "Teste123!Aa";

    public static async Task SeedAsync(IServiceProvider sp)
    {
        var context = sp.GetRequiredService<FinalprojContext>();
        if (!context.Produtos.Any())
        {
            context.Produtos.Add(new Produto
            {
                Nome = "Produto Teste",
                NEMPorUnidade = 1m,
                FamiliaRisco = "1.1G",
                GrupoCompatibilidade = "G"
            });
            await context.SaveChangesAsync();
        }

        var produtoId = context.Produtos.Select(p => p.Id).First();
        if (!context.Paiol.Any())
        {
            var paiol = new Paiol
            {
                Nome = "Paiol Teste",
                Localizacao = "Lisboa",
                LimiteMLE = 1000m,
                PerfilRisco = "1.1G",
                Estado = ConstantesPaiol.EstadoAtivo
            };
            context.Paiol.Add(paiol);
            await context.SaveChangesAsync();

            context.PaiolAcessos.Add(new PaiolAcesso
            {
                PaiolId = paiol.Id,
                RoleName = ConstantesRoles.Armazem
            });
            await context.SaveChangesAsync();
        }

        if (!context.Clientes.Any())
        {
            context.Clientes.Add(new Cliente { Nome = "Cliente Teste", Email = "cliente@teste.pt", NIF = "123456789" });
            await context.SaveChangesAsync();
        }
    }

    public static async Task<(IdentityUser User, string Password)> EnsureUserAsync(
        IServiceProvider sp,
        string email,
        string role)
    {
        var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new IdentityUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(user, DefaultPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
            await userManager.AddToRoleAsync(user, role);
        }
        else if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }

        return (user, DefaultPassword);
    }
}
