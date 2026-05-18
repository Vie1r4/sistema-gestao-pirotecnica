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

        if (!context.Funcionarios.Any())
        {
            context.Funcionarios.Add(new Funcionario
            {
                NomeCompleto = "Funcionário Seed",
                Email = "func-seed@teste.pt",
                Cargo = ConstantesRoles.Comercial,
                NIF = "987654321"
            });
            await context.SaveChangesAsync();
        }

        if (context.Paiol.Count() < 2)
        {
            context.Paiol.Add(new Paiol
            {
                Nome = "Paiol Sem Acesso",
                Localizacao = "Porto",
                LimiteMLE = 500m,
                PerfilRisco = "1.1G",
                Estado = ConstantesPaiol.EstadoAtivo
            });
            await context.SaveChangesAsync();
        }
    }

    public static int GetSeedFuncionarioId(IServiceProvider sp) =>
        sp.GetRequiredService<FinalprojContext>().Funcionarios.Select(f => f.Id).First();

    public static int GetSeedPaiolSemAcessoId(IServiceProvider sp)
    {
        var context = sp.GetRequiredService<FinalprojContext>();
        var comAcesso = context.PaiolAcessos.Select(a => a.PaiolId).Distinct().ToHashSet();
        return context.Paiol.Where(p => !comAcesso.Contains(p.Id)).Select(p => p.Id).First();
    }

    public static int GetSeedClienteId(IServiceProvider sp) =>
        sp.GetRequiredService<FinalprojContext>().Clientes.Select(c => c.Id).First();

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
