using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Persistence.Data;

/// <summary>
/// Dados de demonstração para gráficos de analytics (apenas Development).
/// </summary>
public static class DemoAnalyticsSeeder
{
    public const string YoY2025Marker = "SEED-DEMO-YOY-2025";

    /// <summary>
    /// Cria 5 encomendas por mês em 2025 (60 total) se ainda não existirem.
    /// </summary>
    public static async Task SeedYoY2025Async(FinalprojContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Encomendas.AnyAsync(e => e.Observacoes == YoY2025Marker, cancellationToken))
            return;

        var clienteId = await EnsureClienteAsync(context, cancellationToken);
        var produtoId = await EnsureProdutoAsync(context, cancellationToken);

        var encomendas = new List<Encomenda>();
        for (var mes = 1; mes <= 12; mes++)
        {
            for (var i = 0; i < 5; i++)
            {
                var dia = Math.Min(1 + i * 5, 28);
                encomendas.Add(new Encomenda
                {
                    ClienteId = clienteId,
                    Nome = $"Demo gráfico 2025-{mes:D2}-{i + 1}",
                    Estado = ConstantesEncomenda.CONCLUIDA,
                    DataCriacao = new DateTime(2025, mes, dia, 12, 0, 0, DateTimeKind.Utc),
                    DataConclusao = new DateTime(2025, mes, dia, 14, 0, 0, DateTimeKind.Utc),
                    Observacoes = YoY2025Marker,
                    Itens =
                    [
                        new EncomendaItem { ProdutoId = produtoId, QuantidadePedida = 1 }
                    ]
                });
            }
        }

        context.Encomendas.AddRange(encomendas);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<int> EnsureClienteAsync(FinalprojContext context, CancellationToken cancellationToken)
    {
        var existente = await context.Clientes
            .Where(c => c.EliminadoEm == null)
            .Select(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (existente > 0)
            return existente;

        var cliente = new Cliente
        {
            Nome = "Cliente Demo Gráficos",
            Email = "demo-graficos@pirofafe.local",
            NIF = "500000001"
        };
        context.Clientes.Add(cliente);
        await context.SaveChangesAsync(cancellationToken);
        return cliente.Id;
    }

    private static async Task<int> EnsureProdutoAsync(FinalprojContext context, CancellationToken cancellationToken)
    {
        var existente = await context.Produtos.Select(p => p.Id).FirstOrDefaultAsync(cancellationToken);
        if (existente > 0)
            return existente;

        var produto = new Produto
        {
            Nome = "Produto Demo Gráficos",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.3G",
            FiltroTecnico = "Demo",
            Calibre = "Demo",
            Categoria = "Demo",
            GrupoCompatibilidade = "G",
            DistanciaSegurancaPublico_m = 50
        };
        context.Produtos.Add(produto);
        await context.SaveChangesAsync(cancellationToken);
        return produto.Id;
    }
}
