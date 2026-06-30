using System.Net;
using System.Net.Http.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.MsSql;
using Xunit;

namespace Finalproj.IntegrationTests.Encomendas;

/// <summary>
/// Dois pedidos paralelos de preparação sobre o mesmo lote: um sucede, o outro falha sem over-allocation.
/// Requer Docker (Testcontainers + SQL Server).
/// </summary>
[Trait("Category", "Docker")]
public sealed class FifoPreparacaoConcorrenciaTests : IAsyncLifetime
{
    private MsSqlContainer? _sql;
    private SqlServerWebApplicationFactory? _factory;
    private bool _dockerDisponivel = true;

    public async Task InitializeAsync()
    {
        try
        {
            _sql = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .Build();

            await _sql.StartAsync();
            _factory = new SqlServerWebApplicationFactory(_sql.GetConnectionString());
            await _factory.InitializeAsync();
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException or TimeoutException)
        {
            _dockerDisponivel = false;
        }
    }

    public async Task DisposeAsync()
    {
        if (_factory is not null)
            await _factory.DisposeAsync();
        if (_sql is not null)
            await _sql.DisposeAsync();
    }

    [SkippableFact]
    public async Task Post_RegistarPreparacao_Paralelo_SoUmaConsomeStockDisponivel()
    {
        Skip.IfNot(_dockerDisponivel, "Docker não disponível — teste de concorrência FIFO ignorado.");

        const decimal stockKg = 10m;
        const decimal pedidoKg = 8m;

        await using var scope = _factory!.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var (encomendaA, itemA, encomendaB, itemB, paiolId, entradaId) =
            await SeedDuasEncomendasAceitesComStockLimitadoAsync(context, stockKg, pedidoKg);

        var clientA = await _factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var clientB = await _factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);

        var bodyA = new[] { new { encomendaItemId = itemA, paiolId, quantidade = pedidoKg } };
        var bodyB = new[] { new { encomendaItemId = itemB, paiolId, quantidade = pedidoKg } };

        var taskA = clientA.PostAsJsonAsync($"/api/encomendas/{encomendaA}/registar-preparacao", bodyA);
        var taskB = clientB.PostAsJsonAsync($"/api/encomendas/{encomendaB}/registar-preparacao", bodyB);
        await Task.WhenAll(taskA, taskB);

        var responseA = await taskA;
        var responseB = await taskB;

        var statusCodes = new[] { responseA.StatusCode, responseB.StatusCode };
        Assert.Contains(HttpStatusCode.OK, statusCodes);
        Assert.Contains(HttpStatusCode.BadRequest, statusCodes);

        await using var verifyScope = _factory.Services.CreateAsyncScope();
        var verify = verifyScope.ServiceProvider.GetRequiredService<FinalprojContext>();

        var saidasLote = await verify.SaidasPaiol
            .AsNoTracking()
            .Where(s => s.EntradaPaiolId == entradaId)
            .ToListAsync();

        Assert.Single(saidasLote);
        Assert.True(saidasLote.Sum(s => s.Quantidade) <= stockKg);

        var preparadas = await verify.Encomendas
            .AsNoTracking()
            .Where(e => e.Id == encomendaA || e.Id == encomendaB)
            .CountAsync(e => e.Estado == ConstantesEncomenda.EM_PREPARACAO);

        Assert.Equal(1, preparadas);
    }

    private static async Task<(int EncomendaA, int ItemA, int EncomendaB, int ItemB, int PaiolId, int EntradaId)>
        SeedDuasEncomendasAceitesComStockLimitadoAsync(FinalprojContext context, decimal stockKg, decimal pedidoKg)
    {
        var produto = context.Produtos.First();
        var cliente = context.Clientes.First();

        var paiol = new Paiol
        {
            Nome = "Paiol FIFO Concorrência",
            Localizacao = "Braga",
            LimiteMLE = 1000m,
            PerfilRisco = "1.1G",
            Estado = ConstantesPaiol.EstadoAtivo,
            NumeroLicenca = "LIC-FIFO-CONC",
            DataValidadeLicenca = DateTime.UtcNow.Date.AddYears(1),
        };
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        context.PaiolAcessos.Add(new PaiolAcesso
        {
            PaiolId = paiol.Id,
            RoleName = ConstantesRoles.Gestor,
        });

        var entrada = new EntradaPaiol
        {
            PaiolId = paiol.Id,
            ProdutoId = produto.Id,
            Quantidade = stockKg,
            DataEntrada = DateTime.UtcNow.AddDays(-2),
            DataFabrico = DateTime.UtcNow.AddDays(-3),
            NumeroLote = "LOTE-CONC-001",
        };
        context.EntradasPaiol.Add(entrada);

        var encomendaA = new Encomenda
        {
            ClienteId = cliente.Id,
            Estado = ConstantesEncomenda.ACEITE,
            DataCriacao = DateTime.UtcNow,
            DataAceite = DateTime.UtcNow,
        };
        var encomendaB = new Encomenda
        {
            ClienteId = cliente.Id,
            Estado = ConstantesEncomenda.ACEITE,
            DataCriacao = DateTime.UtcNow,
            DataAceite = DateTime.UtcNow,
        };
        context.Encomendas.AddRange(encomendaA, encomendaB);
        await context.SaveChangesAsync();

        var itemA = new EncomendaItem
        {
            EncomendaId = encomendaA.Id,
            ProdutoId = produto.Id,
            QuantidadePedida = pedidoKg,
        };
        var itemB = new EncomendaItem
        {
            EncomendaId = encomendaB.Id,
            ProdutoId = produto.Id,
            QuantidadePedida = pedidoKg,
        };
        context.EncomendaItems.AddRange(itemA, itemB);
        await context.SaveChangesAsync();

        return (encomendaA.Id, itemA.Id, encomendaB.Id, itemB.Id, paiol.Id, entrada.Id);
    }
}
