using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Funcionarios;

public class FuncionarioEditCredencialTests : IntegrationTestBase
{
    [Fact]
    public async Task Put_Edit_PersisteNumeroCredencialEValidadeComLicenca()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var funcionarioId = TestDataSeeder.GetSeedFuncionarioId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var validade = DateTime.UtcNow.Date.AddYears(1).ToString("yyyy-MM-dd");

        using var form = new MultipartFormDataContent
        {
            { new StringContent(funcionarioId.ToString()), "Funcionario.Id" },
            { new StringContent("Funcionário Seed"), "Funcionario.NomeCompleto" },
            { new StringContent("3412"), "Funcionario.NumeroCredencial" },
            { new StringContent(validade), "Funcionario.DataValidadeLicencaOperador" },
            { new StringContent(ConstantesRoles.Comercial), "Funcionario.Cargo" },
            { new StringContent("false"), "RegistarCartaoCidadao" },
            { new StringContent("true"), "RegistarLicencaOperador" },
            { new StringContent("false"), "CriarConta" },
            { new StringContent("false"), "RemoverCartaoCidadao" },
            { new StringContent("false"), "RemoverDocumentoADDR" },
            { new StringContent("false"), "RemoverLicencaOperador" },
            { new StringContent("false"), "RemoverOutrosAntigo" },
        };

        var fileBytes = Encoding.UTF8.GetBytes("%PDF-1.4 licenca teste");
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        form.Add(fileContent, "LicencaOperadorFicheiro", "licenca.pdf");

        var putResponse = await client.PutAsync($"/api/funcionarios/{funcionarioId}", form);
        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/funcionarios/{funcionarioId}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var json = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        var item = json.GetProperty("item");
        var cred = item.TryGetProperty("numeroCredencial", out var camel)
            ? camel.GetString()
            : item.GetProperty("NumeroCredencial").GetString();
        Assert.Equal("3412", cred);
        Assert.True(item.TryGetProperty("dataValidadeLicencaOperador", out _) ||
                    item.TryGetProperty("DataValidadeLicencaOperador", out _));
    }
}
