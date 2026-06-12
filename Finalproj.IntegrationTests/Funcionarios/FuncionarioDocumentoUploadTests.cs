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

public class FuncionarioDocumentoUploadTests : IntegrationTestBase
{
    private static ByteArrayContent MinimalPdfFileContent()
    {
        var bytes = Encoding.ASCII.GetBytes("%PDF-1.4\n%%EOF\n");
        var content = new ByteArrayContent(bytes);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        return content;
    }

    [Fact]
    public async Task Put_Edit_PersisteCartaoCidadao()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var funcionarioId = TestDataSeeder.GetSeedFuncionarioId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);

        var form = new MultipartFormDataContent
        {
            { new StringContent(funcionarioId.ToString()), "Funcionario.Id" },
            { new StringContent("Funcionário Seed"), "Funcionario.NomeCompleto" },
            { new StringContent(ConstantesRoles.Comercial), "Funcionario.Cargo" },
            { new StringContent("false"), "CriarConta" },
            { new StringContent("false"), "RemoverCartaoCidadao" },
            { new StringContent("false"), "RemoverDocumentoADDR" },
            { new StringContent("false"), "RemoverLicencaOperador" },
            { new StringContent("false"), "RemoverOutrosAntigo" },
        };
        form.Add(MinimalPdfFileContent(), "CartaoCidadaoFicheiro", "cc.pdf");

        var putResponse = await client.PutAsync($"/api/funcionarios/{funcionarioId}", form);
        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/funcionarios/{funcionarioId}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var json = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        var item = json.GetProperty("item");
        var hasCc = item.TryGetProperty("hasCartaoCidadao", out var camel)
            ? camel.GetBoolean()
            : item.GetProperty("HasCartaoCidadao").GetBoolean();
        Assert.True(hasCc);
    }
}
