using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Infrastructure.Repositories;
using Finalproj.Application.Features.Paiols.Services;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Constants;
using Finalproj.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace Finalproj.Tests.Domain;

public class SaidaPaiolApplicationServiceTests
{
    private static SaidaPaiolApplicationService CreateService(FinalprojContext ctx) =>
        new(
            new PaiolRepository(ctx),
            new ProdutoRepository(ctx),
            new EntradaPaiolRepository(ctx),
            new SaidaPaiolRepository(ctx),
            new UnitOfWork(ctx),
            new NoOpLogSistemaService()
        );

    [Fact]
    public async Task RegistarAsync_ConsomeStockPorFIFODeLotesMultiplos()
    {
        // Se pedirmos 10, e o lote A (mais antigo) tiver 4 e o lote B tiver 10:
        // Deve consumir 4 do lote A (esgotando-o) e 6 do lote B.
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out _);

        // Lote A (mais antigo - DataEntrada anterior)
        var entradaA = new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 4m,
            DataEntrada = DateTime.UtcNow.AddDays(-2),
            NumeroLote = "LOTE-A"
        };
        // Lote B (mais recente)
        var entradaB = new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 10m,
            DataEntrada = DateTime.UtcNow.AddDays(-1),
            NumeroLote = "LOTE-B"
        };
        ctx.EntradasPaiol.AddRange(entradaA, entradaB);
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);

        var model = new SaidaPaiolViewModel
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 10m
        };

        var roles = new[] { ConstantesRoles.Gestor };
        var result = await sut.RegistarAsync(model, "user-123", roles);

        Assert.Null(result.Erro);
        Assert.NotNull(result.Saida);

        var saidas = await ctx.SaidasPaiol.ToListAsync();
        Assert.Equal(2, saidas.Count);

        var saidaA = saidas.FirstOrDefault(s => s.EntradaPaiolId == entradaA.Id);
        Assert.NotNull(saidaA);
        Assert.Equal(4m, saidaA.Quantidade);

        var saidaB = saidas.FirstOrDefault(s => s.EntradaPaiolId == entradaB.Id);
        Assert.NotNull(saidaB);
        Assert.Equal(6m, saidaB.Quantidade);

        // Validar que o stock restante no Lote B é de 4 unidades
        var stockAtual = await ctx.EntradasPaiol
            .Where(e => e.PaiolId == paiolId && e.ProdutoId == produtoId)
            .Select(e => e.Quantidade - ctx.SaidasPaiol.Where(s => s.EntradaPaiolId == e.Id).Sum(s => s.Quantidade))
            .SumAsync();
        Assert.Equal(4m, stockAtual);
    }

    [Fact]
    public async Task RegistarAsync_StockInsuficienteNosLotes_RetornaErroERollback()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out _);

        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 5m,
            DataEntrada = DateTime.UtcNow,
            NumeroLote = "LOTE-UNICO"
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);

        var model = new SaidaPaiolViewModel
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 10m // pede mais do que existe
        };

        var roles = new[] { ConstantesRoles.Gestor };
        var result = await sut.RegistarAsync(model, "user-123", roles);

        Assert.NotNull(result.Erro);
        Assert.Contains("Quantidade indisponível", result.Erro);

        var saidas = await ctx.SaidasPaiol.ToListAsync();
        Assert.Empty(saidas); // transação cancelada
    }

    [Fact]
    public async Task RegistarAsync_QuantidadeNegativaOuZero_RetornaErro()
    {
        await using var ctx = TestDbContextFactory.Create();
        SeedProdutoPaiolCliente(ctx, out var produtoId, out var paiolId, out _);

        ctx.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 10m,
            DataEntrada = DateTime.UtcNow,
            NumeroLote = "LOTE-A"
        });
        await ctx.SaveChangesAsync();

        var sut = CreateService(ctx);

        var model = new SaidaPaiolViewModel
        {
            PaiolId = paiolId,
            ProdutoId = produtoId,
            Quantidade = 0m // quantidade inválida
        };

        var roles = new[] { ConstantesRoles.Gestor };
        var result = await sut.RegistarAsync(model, "user-123", roles);

        Assert.NotNull(result.Erro);
        Assert.Contains("superior a zero", result.Erro);

        var saidas = await ctx.SaidasPaiol.ToListAsync();
        Assert.Empty(saidas);
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
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = TestProdutoDefaults.GrupoCompatibilidade,
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
