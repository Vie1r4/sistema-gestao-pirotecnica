using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services.Domain;
using Finalproj.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Finalproj.Tests.Domain;

public class StockDisponivelServiceTests
{
    private static StockDisponivelService CreateService(FinalprojContext ctx) => new(ctx);

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_SemDados_DevolveDicionarioVazioOuZeros()
    {
        await using var ctx = TestDbContextFactory.Create();
        var sut = CreateService(ctx);

        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_SoEntradas_DevolveTotalEntradas()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out var clienteId);
        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 100m,
            DataEntrada = DateTime.UtcNow,
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        Assert.Equal(100m, result[produtoId]);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_EntradasMenosSaidas()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out _);
        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 100m,
            DataEntrada = DateTime.UtcNow,
        });
        ctx.SaidasPaiol.Add(new SaidaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 30m,
            DataSaida = DateTime.UtcNow,
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        Assert.Equal(70m, result[produtoId]);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_DescontaReservasDeEncomendasEmCurso()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out var clienteId);
        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 100m,
            DataEntrada = DateTime.UtcNow,
        });
        var enc = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.ACEITE,
            DataCriacao = DateTime.UtcNow,
        };
        ctx.Encomendas.Add(enc);
        await ctx.SaveChangesAsync();
        ctx.Reservas.Add(new Reserva
        {
            EncomendaId = enc.Id,
            ProdutoId = produtoId,
            Quantidade = 25m,
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        Assert.Equal(75m, result[produtoId]);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_EncomendaConcluida_NaoDescontaReserva()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out var clienteId);
        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 50m,
            DataEntrada = DateTime.UtcNow,
        });
        var enc = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            DataCriacao = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow,
        };
        ctx.Encomendas.Add(enc);
        await ctx.SaveChangesAsync();
        ctx.Reservas.Add(new Reserva
        {
            EncomendaId = enc.Id,
            ProdutoId = produtoId,
            Quantidade = 40m,
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        // EstadosComReserva não inclui Concluída — reserva órfã na BD não entra na query; stock = entradas.
        Assert.Equal(50m, result[produtoId]);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_ResultadoNegativo_EhCorrigidoParaZero()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out var clienteId);
        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 10m,
            DataEntrada = DateTime.UtcNow,
        });
        var enc = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.PENDENTE,
            DataCriacao = DateTime.UtcNow,
        };
        ctx.Encomendas.Add(enc);
        await ctx.SaveChangesAsync();
        ctx.Reservas.Add(new Reserva
        {
            EncomendaId = enc.Id,
            ProdutoId = produtoId,
            Quantidade = 100m,
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);
        var result = await sut.ObterStockDisponivelPorProdutoAsync();

        Assert.Equal(0m, result[produtoId]);
    }

    [Fact]
    public async Task ObterStockDisponivelAsync_ProdutoInexistente_DevolveZero()
    {
        await using var ctx = TestDbContextFactory.Create();
        var sut = CreateService(ctx);
        var q = await sut.ObterStockDisponivelAsync(999_999);
        Assert.Equal(0m, q);
    }

    private static void SeedProdutoPaiolCliente(FinalprojContext ctx, out int produtoId, out int paiolId, out int clienteId)
    {
        var c = new Cliente { Nome = "Cliente Teste", TipoCliente = "Particular" };
        ctx.Clientes.Add(c);
        var p = new Produto
        {
            Nome = "Produto T",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.3G",
        };
        ctx.Produtos.Add(p);
        var paiol = new Paiol
        {
            Nome = "Paiol T",
            LimiteMLE = 10_000m,
            PerfilRisco = "1.3G",
            Estado = ConstantesPaiol.EstadoAtivo,
        };
        ctx.Paiol.Add(paiol);
        ctx.SaveChanges();
        produtoId = p.Id;
        paiolId = paiol.Id;
        clienteId = c.Id;
    }
}
