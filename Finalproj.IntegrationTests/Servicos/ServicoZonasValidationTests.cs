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

public class ServicoZonasValidationTests : IntegrationTestBase
{
    [Fact]
    public async Task Create_ComMaterialExcedente_ReturnsBadRequest()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var produtoId = context.Produtos.Select(p => p.Id).First();

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            Nome = "Evento Teste",
            DataCriacao = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();
        context.EncomendaItems.Add(new EncomendaItem
        {
            EncomendaId = encomenda.Id,
            ProdutoId = produtoId,
            QuantidadePedida = 10m
        });
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var body = new
        {
            encomendaId = encomenda.Id,
            dataServico = DateTime.Today.ToString("yyyy-MM-dd"),
            publicoPrivado = "Público",
            zonas = new[]
            {
                new
                {
                    designacao = "Zona 1",
                    coordenadasLat = 41.5m,
                    coordenadasLng = -8.4m,
                    linhas = new[]
                    {
                        new
                        {
                            data = DateTime.Today.ToString("yyyy-MM-dd"),
                            produtoId,
                            quantidade = 15m,
                            horaInicio = "22:00:00",
                            horaFim = "22:30:00"
                        }
                    }
                }
            }
        };

        var response = await client.PostAsJsonAsync("/api/servicos", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var error = json.TryGetProperty("error", out var errProp) ? errProp.GetString() : null;
        Assert.Contains("excede", error ?? "", StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Create_SemCoordenadas_ReturnsBadRequest()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var produtoId = context.Produtos.Select(p => p.Id).First();

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            DataCriacao = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();
        context.EncomendaItems.Add(new EncomendaItem
        {
            EncomendaId = encomenda.Id,
            ProdutoId = produtoId,
            QuantidadePedida = 5m
        });
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Comercial);
        var body = new
        {
            encomendaId = encomenda.Id,
            dataServico = DateTime.Today.ToString("yyyy-MM-dd"),
            publicoPrivado = "Privado",
            zonas = new[]
            {
                new
                {
                    designacao = "Zona sem mapa",
                    linhas = new[]
                    {
                        new
                        {
                            data = DateTime.Today.ToString("yyyy-MM-dd"),
                            produtoId,
                            quantidade = 2m
                        }
                    }
                }
            }
        };

        var response = await client.PostAsJsonAsync("/api/servicos", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
