using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Servicos;

public class ServicoDistanciasSegurancaSyncTests : IntegrationTestBase
{
    [Fact]
    public async Task Create_ComDuasZonas_SincronizaDistanciasPeloMaximoDoCatalogo()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);

        var produto80 = new Produto
        {
            Nome = "Produto 80m",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            DistanciaSegurancaPublico_m = 80
        };
        var produto120 = new Produto
        {
            Nome = "Produto 120m",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            DistanciaSegurancaPublico_m = 120
        };
        TestProdutoDefaults.ApplyRequiredFields(produto80);
        TestProdutoDefaults.ApplyRequiredFields(produto120);
        context.Produtos.AddRange(produto80, produto120);
        await context.SaveChangesAsync();

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            Nome = "Evento distâncias",
            DataCriacao = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();
        context.EncomendaItems.AddRange(
            new EncomendaItem { EncomendaId = encomenda.Id, ProdutoId = produto80.Id, QuantidadePedida = 2m },
            new EncomendaItem { EncomendaId = encomenda.Id, ProdutoId = produto120.Id, QuantidadePedida = 2m });
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var hoje = DateTime.Today.ToString("yyyy-MM-dd");
        var body = new
        {
            encomendaId = encomenda.Id,
            dataServico = hoje,
            publicoPrivado = "Público",
            zonas = new[]
            {
                new
                {
                    designacao = "Zona A",
                    coordenadasLat = 41.5m,
                    coordenadasLng = -8.4m,
                    linhas = new[]
                    {
                        new { data = hoje, produtoId = produto80.Id, quantidade = 1m, horaInicio = "22:00:00", horaFim = "22:15:00" },
                        new { data = hoje, produtoId = produto120.Id, quantidade = 1m, horaInicio = "22:15:00", horaFim = "22:30:00" }
                    }
                },
                new
                {
                    designacao = "Zona B",
                    coordenadasLat = 41.51m,
                    coordenadasLng = -8.41m,
                    linhas = new[]
                    {
                        new { data = hoje, produtoId = produto80.Id, quantidade = 1m, horaInicio = "23:00:00", horaFim = "23:15:00" }
                    }
                }
            }
        };

        var createResponse = await client.PostAsJsonAsync("/api/servicos", body);
        Assert.True(createResponse.StatusCode is HttpStatusCode.OK or HttpStatusCode.Created);
        var createJson = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var servicoId = createJson.GetProperty("servico").GetProperty("id").GetInt32();

        var detailResponse = await client.GetAsync($"/api/servicos/{servicoId}");
        detailResponse.EnsureSuccessStatusCode();
        var detail = await detailResponse.Content.ReadFromJsonAsync<JsonElement>();
        var servico = detail.GetProperty("servico");

        Assert.Equal(120, servico.GetProperty("raioPublico").GetInt32());

        var zonas = servico.GetProperty("zonasLancamento").EnumerateArray().ToList();
        Assert.Equal(2, zonas.Count);

        var zonaA = zonas.First(z => z.GetProperty("designacao").GetString() == "Zona A");
        Assert.Equal(120, zonaA.GetProperty("raioPublico").GetInt32());
        foreach (var d in zonaA.GetProperty("distanciasSeguranca").EnumerateArray())
        {
            Assert.Equal(120, d.GetProperty("distanciaMinima_m").GetInt32());
            Assert.Equal(120, d.GetProperty("distanciaMedida_m").GetInt32());
        }

        var zonaB = zonas.First(z => z.GetProperty("designacao").GetString() == "Zona B");
        Assert.Equal(80, zonaB.GetProperty("raioPublico").GetInt32());
        foreach (var d in zonaB.GetProperty("distanciasSeguranca").EnumerateArray())
        {
            Assert.Equal(80, d.GetProperty("distanciaMinima_m").GetInt32());
            Assert.Equal(80, d.GetProperty("distanciaMedida_m").GetInt32());
        }

        foreach (var d in servico.GetProperty("distanciasSeguranca").EnumerateArray())
        {
            Assert.Equal(120, d.GetProperty("distanciaMinima_m").GetInt32());
            Assert.Equal(120, d.GetProperty("distanciaMedida_m").GetInt32());
        }
    }
}
