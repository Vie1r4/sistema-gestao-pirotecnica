using System.Net;
using System.Net.Http.Json;
using Finalproj.Domain.Constants;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Authorization;

/// <summary>
/// Matriz 401/403 para métodos de mutação (POST/PUT/DELETE).
/// </summary>
public class EndpointMutationAuthorizationTests : IntegrationTestBase
{
    [Theory]
    [InlineData("POST", "/api/funcionarios", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/funcionarios", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/funcionarios", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/clientes", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/clientes", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/clientes", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/encomendas/submeter", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/encomendas/submeter", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/paiol", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/paiol", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/paiol", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/produtos", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/produtos", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/produtos", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("POST", "/api/servicos", null, HttpStatusCode.Unauthorized)]
    [InlineData("POST", "/api/servicos", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    public async Task Mutation_Endpoint_ReturnsExpectedStatus(
        string method,
        string url,
        string? role,
        HttpStatusCode expectedStatus)
    {
        HttpClient client = role == null
            ? Factory.CreateClient()
            : await Factory.CreateAuthenticatedClientAsync(role);

        var content = url.Contains("submeter", StringComparison.OrdinalIgnoreCase)
            ? AuthClientExtensions.EmptyJsonContent()
            : AuthClientExtensions.EmptyMultipartContent();

        var response = await client.SendAuthorizedAsync(new HttpMethod(method), url, content);
        Assert.Equal(expectedStatus, response.StatusCode);
    }

    [Fact]
    public async Task Delete_AdminUtilizador_Gestor_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var (user, _) = await TestDataSeeder.EnsureUserAsync(
            scope.ServiceProvider,
            "delete-target@pirofafe.pt",
            ConstantesRoles.Comercial);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.SendAuthorizedAsync(HttpMethod.Delete, $"/api/admin/utilizadores/{user.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Funcionario_Armazem_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var funcionarioId = TestDataSeeder.GetSeedFuncionarioId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.SendAuthorizedAsync(HttpMethod.Delete, $"/api/funcionarios/{funcionarioId}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Put_Funcionario_Comercial_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var funcionarioId = TestDataSeeder.GetSeedFuncionarioId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Comercial);
        var response = await client.SendAuthorizedAsync(
            HttpMethod.Put,
            $"/api/funcionarios/{funcionarioId}",
            AuthClientExtensions.EmptyMultipartContent());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Post_Funcionarios_Gestor_NotForbidden()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.SendAuthorizedAsync(
            HttpMethod.Post,
            "/api/funcionarios",
            AuthClientExtensions.EmptyMultipartContent());
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Delete_AdminUtilizador_Admin_NotForbidden()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var (user, _) = await TestDataSeeder.EnsureUserAsync(
            scope.ServiceProvider,
            "delete-admin-ok@pirofafe.pt",
            ConstantesRoles.Comercial);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Admin);
        var response = await client.SendAuthorizedAsync(HttpMethod.Delete, $"/api/admin/utilizadores/{user.Id}");
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Post_EncomendasSubmeter_Comercial_NotForbidden()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Comercial);
        var response = await client.SendAuthorizedAsync(
            HttpMethod.Post,
            "/api/encomendas/submeter",
            JsonContent.Create(new { clienteId, dataEntrega = (DateTime?)null, observacoes = "" }));
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
