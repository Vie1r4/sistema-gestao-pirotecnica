using System.Net;
using System.Net.Http.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Encomendas;

/// <summary>
/// Ponto 7: validação antecipada do n.º CRED do coordenador pirotécnico antes de «Em preparação».
/// </summary>
public class EncomendaPreparacaoCoordenadorCredTests : IntegrationTestBase
{
    [Fact]
    public async Task Post_RegistarPreparacao_CoordenadorSemCred_RetornaBadRequestSemAlterarEstadoNemStock()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var (encomendaId, itemId, paiolId, _) = await SeedEncomendaAceiteComStockAsync(
            context,
            numeroCredencial: null);

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.PostAsJsonAsync(
            $"/api/encomendas/{encomendaId}/registar-preparacao",
            new[]
            {
                new { encomendaItemId = itemId, paiolId, quantidade = 5m },
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var jsonText = await response.Content.ReadAsStringAsync();
        Assert.Contains(ConstantesEncomenda.CodigoCoordenadorSemCred, jsonText, StringComparison.Ordinal);

        await using var verifyScope = Factory.Services.CreateAsyncScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var enc = await verifyContext.Encomendas.AsNoTracking().SingleAsync(e => e.Id == encomendaId);
        Assert.Equal(ConstantesEncomenda.ACEITE, enc.Estado);
        Assert.Equal(0, verifyContext.SaidasPaiol.Count(s => s.EncomendaId == encomendaId));
    }

    [Fact]
    public async Task Post_RegistarPreparacao_CoordenadorComCred_AvancaParaEmPreparacao()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var (encomendaId, itemId, paiolId, _) = await SeedEncomendaAceiteComStockAsync(
            context,
            numeroCredencial: "3412");

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.PostAsJsonAsync(
            $"/api/encomendas/{encomendaId}/registar-preparacao",
            new[]
            {
                new { encomendaItemId = itemId, paiolId, quantidade = 5m },
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await using var verifyScope = Factory.Services.CreateAsyncScope();
        var verifyContext = verifyScope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var enc = await verifyContext.Encomendas.AsNoTracking().SingleAsync(e => e.Id == encomendaId);
        Assert.Equal(ConstantesEncomenda.EM_PREPARACAO, enc.Estado);
        Assert.True(verifyContext.SaidasPaiol.Any(s => s.EncomendaId == encomendaId));
    }

    private static async Task<(int EncomendaId, int ItemId, int PaiolId, int CoordenadorId)> SeedEncomendaAceiteComStockAsync(
        FinalprojContext context,
        string? numeroCredencial)
    {
        var produto = context.Produtos.First();
        var cliente = context.Clientes.First();

        var paiol = new Paiol
        {
            Nome = "Paiol Prep CRED Teste",
            Localizacao = "Braga",
            LimiteMLE = 1000m,
            PerfilRisco = "1.1G",
            Estado = ConstantesPaiol.EstadoAtivo,
            NumeroLicenca = "LIC-PREP-001",
            DataValidadeLicenca = DateTime.UtcNow.Date.AddYears(1),
        };
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        context.PaiolAcessos.Add(new PaiolAcesso
        {
            PaiolId = paiol.Id,
            RoleName = ConstantesRoles.Gestor,
        });

        var coordenador = new Funcionario
        {
            NomeCompleto = "Coordenador Prep Teste",
            Email = $"coord-prep-{Guid.NewGuid():N}@teste.pt",
            Cargo = ConstantesRoles.Gestor,
            NIF = "555666777",
            NumeroCredencial = numeroCredencial,
        };
        context.Funcionarios.Add(coordenador);
        await context.SaveChangesAsync();

        var encomenda = new Encomenda
        {
            ClienteId = cliente.Id,
            Estado = ConstantesEncomenda.ACEITE,
            DataCriacao = DateTime.UtcNow,
            DataAceite = DateTime.UtcNow,
            CoordenadorPirotecnicoId = coordenador.Id,
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();

        var item = new EncomendaItem
        {
            EncomendaId = encomenda.Id,
            ProdutoId = produto.Id,
            QuantidadePedida = 5m,
        };
        context.EncomendaItems.Add(item);

        context.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiol.Id,
            ProdutoId = produto.Id,
            Quantidade = 20m,
            DataEntrada = DateTime.UtcNow,
            NumeroLote = "LOTE-PREP-001",
        });

        await context.SaveChangesAsync();
        return (encomenda.Id, item.Id, paiol.Id, coordenador.Id);
    }
}
