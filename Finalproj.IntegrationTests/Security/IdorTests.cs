using System.Net;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Security;

public class IdorTests : IntegrationTestBase
{
    [Fact]
    public async Task DownloadDocumentoFuncionario_OutroUtilizador_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();

        var funcA = new Funcionario { NomeCompleto = "Func A", Email = "func-a@teste.pt", Cargo = ConstantesRoles.Comercial };
        var funcB = new Funcionario { NomeCompleto = "Func B", Email = "func-b@teste.pt", Cargo = ConstantesRoles.Comercial };
        context.Funcionarios.AddRange(funcA, funcB);
        await context.SaveChangesAsync();

        funcB.UserId = "outro-utilizador-id";
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/funcionarios/{funcB.Id}/documentos?tipo=cc");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminUtilizadores_Gestor_Returns403()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.GetAsync("/api/admin/utilizadores");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Servicos_Lista_Armazem_Returns403()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync("/api/servicos");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
