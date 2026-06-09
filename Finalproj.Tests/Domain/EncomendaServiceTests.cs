using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Infrastructure.Repositories;
using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Features.Encomendas.Services;
using Finalproj.Tests.TestHelpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Finalproj.Tests.Domain;

public class EncomendaServiceTests
{
    private static EncomendaService CreateSut(FinalprojContext ctx) =>
        new(new EncomendaRepository(ctx), new EntradaPaiolRepository(ctx), new SaidaPaiolRepository(ctx), new UnitOfWork(ctx), new NoOpLogSistemaService());

    [Fact]
    public async Task RegistarPreparacaoAsync_EncomendaInexistente_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            9999,
            "u1",
            new[] { 1 },
            new List<RetiradaPreparacaoInput>(),
            "User");

        Assert.False(ok);
        Assert.Equal("Encomenda não encontrada.", erro);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_NaoAceite_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, _) = await SeedEncomendaComStockAsync(
            ctx,
            estado: ConstantesEncomenda.PENDENTE);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.False(ok);
        Assert.Equal("Apenas encomendas aceites podem ser preparadas.", erro);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_ItemNaoPertenceEncomenda_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, _, paiolId, _, _) = await SeedEncomendaComStockAsync(ctx);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = 99_999, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.False(ok);
        Assert.Equal("Dados de preparação inválidos (item não pertence à encomenda).", erro);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_SemAcessoAoPaiol_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, _) = await SeedEncomendaComStockAsync(ctx);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            Array.Empty<int>(),
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.False(ok);
        Assert.Equal("Não tem acesso a um dos paióis selecionados.", erro);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_SomaRetiradasDiferentePedido_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, nomeProduto, _) = await SeedEncomendaComStockAsync(ctx);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 7m },
            },
            "User");

        Assert.False(ok);
        Assert.NotNull(erro);
        Assert.Contains(nomeProduto, erro, StringComparison.Ordinal);
        Assert.Contains("10", erro, StringComparison.Ordinal);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_StockInsuficienteNoPaiol_Falha()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, nomeProduto, _) = await SeedEncomendaComStockAsync(
            ctx,
            quantidadeEntrada: 3m,
            quantidadePedida: 10m);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.False(ok);
        Assert.NotNull(erro);
        Assert.Contains("Stock insuficiente", erro, StringComparison.OrdinalIgnoreCase);
        Assert.Contains(nomeProduto, erro, StringComparison.Ordinal);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_CoordenadorSemCred_FalhaAntesFifo()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, _) = await SeedEncomendaComStockAsync(ctx, coordenadorCred: null);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.False(ok);
        Assert.NotNull(erro);
        Assert.Contains(ConstantesEncomenda.CodigoCoordenadorSemCred, erro, StringComparison.Ordinal);

        var enc = await ctx.Encomendas.AsNoTracking().FirstAsync(e => e.Id == encId);
        Assert.Equal(ConstantesEncomenda.ACEITE, enc.Estado);
        Assert.Empty(await ctx.SaidasPaiol.Where(s => s.EncomendaId == encId).ToListAsync());
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_CoordenadorComCred_Sucesso()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, _) = await SeedEncomendaComStockAsync(ctx, coordenadorCred: "3412");
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.True(ok, erro);
        var enc = await ctx.Encomendas.AsNoTracking().FirstAsync(e => e.Id == encId);
        Assert.Equal(ConstantesEncomenda.EM_PREPARACAO, enc.Estado);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_Sucesso_AtualizaEstadoECriaSaidas()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, _) = await SeedEncomendaComStockAsync(ctx);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 10m },
            },
            "User");

        Assert.True(ok, erro);
        Assert.Null(erro);

        var enc = await ctx.Encomendas.AsNoTracking().FirstAsync(e => e.Id == encId);
        Assert.Equal(ConstantesEncomenda.EM_PREPARACAO, enc.Estado);
        Assert.Equal("u1", enc.FuncionarioPreparouUserId);

        var saidas = await ctx.SaidasPaiol.Where(s => s.EncomendaId == encId).ToListAsync();
        Assert.Single(saidas);
        Assert.Equal(10m, saidas[0].Quantidade);
        Assert.NotNull(saidas[0].EntradaPaiolId);
    }

    [Fact]
    public async Task RegistarPreparacaoAsync_Fifo_ConsomeLotesMaisAntigosPrimeiro()
    {
        await using var ctx = TestDbContextFactory.Create();
        var (encId, itemId, paiolId, _, produtoId) = await SeedEncomendaComStockAsync(
            ctx,
            quantidadePedida: 5m,
            duasEntradasFifo: true);
        var sut = CreateSut(ctx);

        var (ok, erro) = await sut.RegistarPreparacaoAsync(
            encId,
            "u1",
            new[] { paiolId },
            new List<RetiradaPreparacaoInput>
            {
                new() { EncomendaItemId = itemId, PaiolId = paiolId, Quantidade = 5m },
            },
            "User");

        Assert.True(ok, erro);
        var saidas = await ctx.SaidasPaiol.Where(s => s.EncomendaId == encId).OrderBy(s => s.Id).ToListAsync();
        Assert.Equal(2, saidas.Count);
        Assert.Equal(3m, saidas[0].Quantidade);
        Assert.Equal(2m, saidas[1].Quantidade);

        var entradas = await ctx.EntradasPaiol
            .Where(e => e.PaiolId == paiolId && e.ProdutoId == produtoId)
            .OrderBy(e => e.DataFabrico ?? e.DataEntrada)
            .ThenBy(e => e.DataEntrada)
            .ToListAsync();
        Assert.Equal(2, entradas.Count);
        Assert.Equal(entradas[0].Id, saidas[0].EntradaPaiolId);
        Assert.Equal(entradas[1].Id, saidas[1].EntradaPaiolId);
    }

    private static async Task<(int encId, int itemId, int paiolId, string nomeProduto, int produtoId)> SeedEncomendaComStockAsync(
        FinalprojContext ctx,
        string estado = ConstantesEncomenda.ACEITE,
        decimal quantidadePedida = 10m,
        decimal quantidadeEntrada = 10m,
        bool duasEntradasFifo = false,
        string? coordenadorCred = "skip")
    {
        var c = new Cliente { Nome = "C-test", TipoCliente = "Particular" };
        ctx.Clientes.Add(c);
        var prod = new Produto
        {
            Nome = "Prod-Fifo",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.3G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = TestProdutoDefaults.GrupoCompatibilidade,
        };
        ctx.Produtos.Add(prod);
        var paiol = new Paiol
        {
            Nome = "P-test",
            LimiteMLE = 10_000m,
            PerfilRisco = "1.3G",
            Estado = ConstantesPaiol.EstadoAtivo,
        };
        ctx.Paiol.Add(paiol);

        Funcionario? coord = null;
        if (coordenadorCred != "skip")
        {
            coord = new Funcionario
            {
                NomeCompleto = "Coordenador Teste",
                Email = $"coord-{Guid.NewGuid():N}@teste.pt",
                Cargo = ConstantesRoles.Gestor,
                NIF = "111222333",
                NumeroCredencial = coordenadorCred,
            };
            ctx.Funcionarios.Add(coord);
        }

        await ctx.SaveChangesAsync();

        var enc = new Encomenda
        {
            ClienteId = c.Id,
            Estado = estado,
            DataCriacao = DateTime.UtcNow,
            CoordenadorPirotecnicoId = coord?.Id,
        };
        ctx.Encomendas.Add(enc);
        await ctx.SaveChangesAsync();

        var item = new EncomendaItem
        {
            EncomendaId = enc.Id,
            ProdutoId = prod.Id,
            QuantidadePedida = quantidadePedida,
        };
        ctx.EncomendaItems.Add(item);

        if (duasEntradasFifo)
        {
            ctx.EntradasPaiol.Add(new EntradaPaiol
            {
                PaiolId = paiol.Id,
                ProdutoId = prod.Id,
                Quantidade = 3m,
                DataEntrada = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                DataFabrico = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            });
            ctx.EntradasPaiol.Add(new EntradaPaiol
            {
                PaiolId = paiol.Id,
                ProdutoId = prod.Id,
                Quantidade = 10m,
                DataEntrada = new DateTime(2020, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                DataFabrico = new DateTime(2020, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            });
        }
        else
        {
            ctx.EntradasPaiol.Add(new EntradaPaiol
            {
                PaiolId = paiol.Id,
                ProdutoId = prod.Id,
                Quantidade = quantidadeEntrada,
                DataEntrada = DateTime.UtcNow,
            });
        }

        await ctx.SaveChangesAsync();
        return (enc.Id, item.Id, paiol.Id, prod.Nome, prod.Id);
    }
}
