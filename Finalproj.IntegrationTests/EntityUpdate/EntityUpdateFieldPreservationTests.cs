using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.EntityUpdate;

/// <summary>
/// Garante que PUT de edição não apaga campos read-only/calculados omitidos do formulário.
/// </summary>
public class EntityUpdateFieldPreservationTests : IntegrationTestBase
{
    [Fact]
    public async Task Put_Paiol_PreservaDivisaoDominante()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var paiol = new Paiol
        {
            Nome = "Paiol Divisão Teste",
            Localizacao = "Fafe",
            LimiteMLE = 500m,
            PerfilRisco = "1.3",
            Estado = ConstantesPaiol.EstadoAtivo,
            DivisaoDominante = "1.3G",
        };
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var fd = new MultipartFormDataContent
        {
            { new StringContent(paiol.Id.ToString()), "Paiol.Id" },
            { new StringContent("Paiol Divisão Renomeado"), "Paiol.Nome" },
            { new StringContent("Fafe"), "Paiol.Localizacao" },
            { new StringContent("500"), "Paiol.LimiteMLE" },
            { new StringContent("1.3"), "Paiol.PerfilRisco" },
            { new StringContent(ConstantesPaiol.EstadoAtivo), "Paiol.Estado" },
            { new StringContent("Admin"), "CargosAcesso" },
        };

        var putResponse = await client.PutAsync($"/api/paiol/{paiol.Id}", fd);
        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/paiol/{paiol.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var json = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        var item = json.GetProperty("paiol");
        var divisao = item.TryGetProperty("divisaoDominante", out var camel)
            ? camel.GetString()
            : item.GetProperty("DivisaoDominante").GetString();
        Assert.Equal("1.3G", divisao);
    }

    [Fact]
    public async Task Put_Produto_PreservaDataRegisto()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var dataRegisto = new DateTime(2025, 6, 15, 10, 0, 0, DateTimeKind.Utc);
        var produto = new Produto
        {
            Nome = "Produto Data Registo",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = "G",
            DataRegisto = dataRegisto,
        };
        context.Produtos.Add(produto);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var body = new
        {
            id = produto.Id,
            nome = "Produto Data Registo Renomeado",
            nemPorUnidade = 1m,
            familiaRisco = "1.1G",
            filtroTecnico = TestProdutoDefaults.FiltroTecnico,
            calibre = TestProdutoDefaults.Calibre,
            categoria = TestProdutoDefaults.Categoria,
            grupoCompatibilidade = "G",
        };

        var putResponse = await client.PutAsJsonAsync($"/api/produtos/{produto.Id}", body);
        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/produtos/{produto.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var json = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        var item = json.TryGetProperty("item", out var wrapped) ? wrapped : json;
        var dataStr = item.TryGetProperty("dataRegisto", out var camel)
            ? camel.GetString()
            : item.GetProperty("DataRegisto").GetString();
        Assert.NotNull(dataStr);
        Assert.Contains("2025-06-15", dataStr, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Put_Produto_IgnoraDataRegistoMaliciosaNoPayload()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var dataRegisto = new DateTime(2025, 6, 15, 10, 0, 0, DateTimeKind.Utc);
        var produto = new Produto
        {
            Nome = "Produto Data Registo Maliciosa",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = "G",
            DataRegisto = dataRegisto,
        };
        context.Produtos.Add(produto);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var body = new
        {
            id = produto.Id,
            nome = "Produto Data Registo Maliciosa Renomeado",
            nemPorUnidade = 1m,
            familiaRisco = "1.1G",
            filtroTecnico = TestProdutoDefaults.FiltroTecnico,
            calibre = TestProdutoDefaults.Calibre,
            categoria = TestProdutoDefaults.Categoria,
            grupoCompatibilidade = "G",
            dataRegisto = "1900-01-01T00:00:00Z",
        };

        var putResponse = await client.PutAsJsonAsync($"/api/produtos/{produto.Id}", body);
        Assert.Equal(HttpStatusCode.OK, putResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/produtos/{produto.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var json = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        var item = json.TryGetProperty("item", out var wrapped) ? wrapped : json;
        var dataStr = item.TryGetProperty("dataRegisto", out var camel)
            ? camel.GetString()
            : item.GetProperty("DataRegisto").GetString();
        Assert.NotNull(dataStr);
        Assert.Contains("2025-06-15", dataStr, StringComparison.Ordinal);
        Assert.DoesNotContain("1900", dataStr, StringComparison.Ordinal);
    }
}
