using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Finalproj.Tests;

public class StockDisponivelServiceTests
{
    private static FinalprojContext CriarContexto()
    {
        var options = new DbContextOptionsBuilder<FinalprojContext>()
            .UseInMemoryDatabase(databaseName: "StockTest_" + Guid.NewGuid().ToString("N"))
            .Options;
        return new FinalprojContext(options);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_SemDados_DevolveVazio()
    {
        await using var context = CriarContexto();
        var service = new StockDisponivelService(context);
        var resultado = await service.ObterStockDisponivelPorProdutoAsync();
        Assert.NotNull(resultado);
        Assert.Empty(resultado);
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_EntradasMenosSaidas_CalculaCorretamente()
    {
        await using var context = CriarContexto();
        var produto = new Produto { Nome = "P1", NEMPorUnidade = 1, FamiliaRisco = "1.3", GrupoCompatibilidade = "G" };
        var paiol = new Paiol { Nome = "Paiol1", LimiteMLE = 1000, PerfilRisco = "1.3G", Estado = "Ativo" };
        context.Produtos.Add(produto);
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        context.EntradasPaiol.Add(new EntradaPaiol { PaiolId = paiol.Id, ProdutoId = produto.Id, Quantidade = 100, DataEntrada = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var service = new StockDisponivelService(context);
        var resultado = await service.ObterStockDisponivelPorProdutoAsync();
        Assert.Equal(100, resultado.GetValueOrDefault(produto.Id));

        context.SaidasPaiol.Add(new SaidaPaiol { PaiolId = paiol.Id, ProdutoId = produto.Id, Quantidade = 30, DataSaida = DateTime.UtcNow });
        await context.SaveChangesAsync();

        resultado = await service.ObterStockDisponivelPorProdutoAsync();
        Assert.Equal(70, resultado.GetValueOrDefault(produto.Id));
    }

    [Fact]
    public async Task ObterStockDisponivelPorProdutoAsync_ReservaReduzDisponivel()
    {
        await using var context = CriarContexto();
        var cliente = new Cliente { Nome = "C1", NIF = "123456789" };
        var produto = new Produto { Nome = "P1", NEMPorUnidade = 1, FamiliaRisco = "1.3", GrupoCompatibilidade = "G" };
        var paiol = new Paiol { Nome = "P1", LimiteMLE = 1000, PerfilRisco = "1.3G", Estado = "Ativo" };
        context.Clientes.Add(cliente);
        context.Produtos.Add(produto);
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        context.EntradasPaiol.Add(new EntradaPaiol { PaiolId = paiol.Id, ProdutoId = produto.Id, Quantidade = 100, DataEntrada = DateTime.UtcNow });
        var encomenda = new Encomenda { ClienteId = cliente.Id, Estado = ConstantesEncomenda.PENDENTE, DataCriacao = DateTime.UtcNow };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();
        context.Reservas.Add(new Reserva { EncomendaId = encomenda.Id, ProdutoId = produto.Id, Quantidade = 40 });
        await context.SaveChangesAsync();

        var service = new StockDisponivelService(context);
        var resultado = await service.ObterStockDisponivelPorProdutoAsync();
        Assert.Equal(60, resultado.GetValueOrDefault(produto.Id));
    }

    [Fact]
    public async Task ObterStockDisponivelAsync_ProdutoInexistente_DevolveZero()
    {
        await using var context = CriarContexto();
        var service = new StockDisponivelService(context);
        var resultado = await service.ObterStockDisponivelAsync(99999);
        Assert.Equal(0, resultado);
    }
}
