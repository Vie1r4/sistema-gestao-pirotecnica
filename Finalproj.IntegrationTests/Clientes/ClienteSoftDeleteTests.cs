using System.Net;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Clientes;

/// <summary>
/// Eliminação lógica de clientes: ficha removida das listagens, histórico de encomendas mantém o nome.
/// </summary>
public class ClienteSoftDeleteTests : IntegrationTestBase
{
    [Fact]
    public async Task Delete_ClienteComEncomenda_SoftDelete_MantemNomeNaEncomenda()
    {
        int clienteId;
        int encomendaId;

        await using (var scope = Factory.Services.CreateAsyncScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
            var cliente = new Cliente
            {
                Nome = "Cliente Histórico Demo",
                TipoCliente = "Empresa",
                DataRegisto = DateTime.UtcNow,
            };
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();
            clienteId = cliente.Id;

            var encomenda = new Encomenda
            {
                ClienteId = clienteId,
                Estado = ConstantesEncomenda.CONCLUIDA,
                DataCriacao = DateTime.UtcNow,
                DataConclusao = DateTime.UtcNow,
            };
            context.Encomendas.Add(encomenda);
            await context.SaveChangesAsync();
            encomendaId = encomenda.Id;
        }

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var deleteResponse = await client.DeleteAsync($"/api/clientes/{clienteId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getCliente = await client.GetAsync($"/api/clientes/{clienteId}");
        Assert.Equal(HttpStatusCode.NotFound, getCliente.StatusCode);

        var encResponse = await client.GetAsync($"/api/encomendas/{encomendaId}");
        encResponse.EnsureSuccessStatusCode();
        var json = await encResponse.Content.ReadAsStringAsync();
        Assert.Contains("Cliente Histórico Demo", json, StringComparison.Ordinal);
        Assert.Contains("\"disponivel\":false", json, StringComparison.OrdinalIgnoreCase);

        await using var verifyScope = Factory.Services.CreateAsyncScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteDb = await verifyContext.Clientes.FirstOrDefaultAsync(c => c.Id == clienteId);
        Assert.NotNull(clienteDb);
        Assert.NotNull(clienteDb!.EliminadoEm);
        Assert.Equal("Cliente Histórico Demo", clienteDb.Nome);
    }
}
