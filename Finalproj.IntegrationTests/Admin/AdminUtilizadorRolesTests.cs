using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Admin;

public class AdminUtilizadorRolesTests : IntegrationTestBase
{
    [Fact]
    public async Task Put_EditarUtilizador_BloqueiaRemoverUltimoAdmin()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Admin);
        await using var scope = Factory.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var admin = await userManager.FindByEmailAsync("admin-test@pirofafe.pt");
        Assert.NotNull(admin);

        var body = new
        {
            id = admin.Id,
            userName = admin.UserName,
            email = admin.Email,
            funcionarioId = (int?)null,
            roles = ConstantesRoles.Todas.Select(r => new
            {
                nome = r,
                atribuido = r == ConstantesRoles.Gestor,
            }).ToArray(),
        };

        var response = await client.PutAsJsonAsync($"/api/admin/utilizadores/{admin.Id}", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var error = json.TryGetProperty("error", out var err) ? err.GetString() : null;
        Assert.Contains("último administrador", error ?? "", StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Put_EditarUtilizador_RejeitaMultiplasRoles()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Admin);
        await using var scope = Factory.Services.CreateAsyncScope();
        var (gestor, _) = await TestDataSeeder.EnsureUserAsync(
            scope.ServiceProvider, "gestor-test@pirofafe.pt", ConstantesRoles.Gestor);

        var body = new
        {
            id = gestor.Id,
            userName = gestor.UserName,
            email = gestor.Email,
            funcionarioId = (int?)null,
            roles = ConstantesRoles.Todas.Select(r => new
            {
                nome = r,
                atribuido = r is ConstantesRoles.Gestor or ConstantesRoles.Comercial,
            }).ToArray(),
        };

        var response = await client.PutAsJsonAsync($"/api/admin/utilizadores/{gestor.Id}", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
