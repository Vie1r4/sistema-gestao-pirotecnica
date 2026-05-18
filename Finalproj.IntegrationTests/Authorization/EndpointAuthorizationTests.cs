using System.Net;
using Finalproj.Domain.Constants;
using Finalproj.IntegrationTests.Infrastructure;
using Xunit;

namespace Finalproj.IntegrationTests.Authorization;

public class EndpointAuthorizationTests : IntegrationTestBase
{
    [Theory]
    [InlineData("GET", "/api/admin/utilizadores", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/admin/utilizadores", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/admin/utilizadores", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/admin/utilizadores", ConstantesRoles.Gestor, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/admin/utilizadores", ConstantesRoles.Admin, HttpStatusCode.OK)]
    [InlineData("GET", "/api/funcionarios", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/funcionarios", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/funcionarios", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/funcionarios", ConstantesRoles.Gestor, HttpStatusCode.OK)]
    [InlineData("GET", "/api/funcionarios", ConstantesRoles.Admin, HttpStatusCode.OK)]
    [InlineData("GET", "/api/clientes", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/clientes", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/clientes", ConstantesRoles.Comercial, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/clientes", ConstantesRoles.Gestor, HttpStatusCode.OK)]
    [InlineData("GET", "/api/clientes", ConstantesRoles.Admin, HttpStatusCode.OK)]
    [InlineData("GET", "/api/encomendas", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/encomendas", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/encomendas", ConstantesRoles.Comercial, HttpStatusCode.OK)]
    [InlineData("GET", "/api/encomendas", ConstantesRoles.Gestor, HttpStatusCode.OK)]
    [InlineData("GET", "/api/produtos", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/produtos", ConstantesRoles.Armazem, HttpStatusCode.OK)]
    [InlineData("GET", "/api/produtos", ConstantesRoles.Comercial, HttpStatusCode.OK)]
    [InlineData("GET", "/api/paiol", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/paiol", ConstantesRoles.Armazem, HttpStatusCode.OK)]
    [InlineData("GET", "/api/servicos", null, HttpStatusCode.Unauthorized)]
    [InlineData("GET", "/api/servicos", ConstantesRoles.Armazem, HttpStatusCode.Forbidden)]
    [InlineData("GET", "/api/servicos", ConstantesRoles.Comercial, HttpStatusCode.OK)]
    public async Task Endpoint_ReturnsExpectedStatus(
        string method,
        string url,
        string? role,
        HttpStatusCode expectedStatus)
    {
        HttpClient client;
        if (role == null)
            client = Factory.CreateClient();
        else
            client = await Factory.CreateAuthenticatedClientAsync(role);

        var response = await client.SendAuthorizedAsync(new HttpMethod(method), url);
        Assert.Equal(expectedStatus, response.StatusCode);
    }
}
