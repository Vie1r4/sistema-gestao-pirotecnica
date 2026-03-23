using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Services.Domain;

/// <summary>
/// Regras de domínio para stock: quantidade disponível por produto (entradas - saídas - reservas de encomendas em curso).
/// </summary>
public class StockDisponivelService : IStockDisponivelService
{
    private readonly FinalprojContext _context;

    public StockDisponivelService(FinalprojContext context) => _context = context;

    /// <inheritdoc />
    public async Task<Dictionary<int, decimal>> ObterStockDisponivelPorProdutoAsync(CancellationToken cancellationToken = default)
    {
        var entradas = await _context.EntradasPaiol
            .GroupBy(e => e.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(e => e.Quantidade) })
            .ToListAsync(cancellationToken);

        var saidas = await _context.SaidasPaiol
            .GroupBy(s => s.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(s => s.Quantidade) })
            .ToListAsync(cancellationToken);

        var reservas = await _context.Reservas
            .Include(r => r.Encomenda)
            .Where(r => ConstantesEncomenda.EstadosComReserva.Contains(r.Encomenda.Estado))
            .GroupBy(r => r.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(r => r.Quantidade) })
            .ToListAsync(cancellationToken);

        var resultado = new Dictionary<int, decimal>();
        foreach (var e in entradas)
            resultado[e.ProdutoId] = e.Total;
        foreach (var s in saidas)
            resultado[s.ProdutoId] = resultado.GetValueOrDefault(s.ProdutoId) - s.Total;
        foreach (var r in reservas)
            resultado[r.ProdutoId] = resultado.GetValueOrDefault(r.ProdutoId) - r.Total;

        var chaves = resultado.Keys.ToList();
        foreach (var pid in chaves)
        {
            if (resultado[pid] < 0)
                resultado[pid] = 0;
        }

        return resultado;
    }

    /// <inheritdoc />
    public async Task<decimal> ObterStockDisponivelAsync(int produtoId, CancellationToken cancellationToken = default)
    {
        var porProduto = await ObterStockDisponivelPorProdutoAsync(cancellationToken);
        return porProduto.GetValueOrDefault(produtoId, 0);
    }
}
