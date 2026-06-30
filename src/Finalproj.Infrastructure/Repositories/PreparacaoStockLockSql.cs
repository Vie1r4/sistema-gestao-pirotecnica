using Finalproj.Domain.ReadModels;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Repositories;

/// <summary>Leituras FIFO com lock pessimista (SQL Server) para preparação de encomendas.</summary>
internal static class PreparacaoStockLockSql
{
    internal sealed class SaldoRow
    {
        public int Id { get; set; }
        public int PaiolId { get; set; }
        public int ProdutoId { get; set; }
        public decimal QuantidadeRestante { get; set; }
        public DateTime DataEntrada { get; set; }
        public DateTime? DataFabrico { get; set; }
        public string? NumeroLote { get; set; }
        public string? PaiolNome { get; set; }
    }

    internal sealed class IdRow
    {
        public int Id { get; set; }
    }

    public static async Task<bool> TryLockEncomendaAsync(
        FinalprojContext context,
        int encomendaId,
        CancellationToken cancellationToken)
    {
        if (!context.Database.IsSqlServer())
            return true;

        var rows = await context.Database
            .SqlQueryRaw<IdRow>(
                "SELECT e.Id FROM Encomendas e WITH (UPDLOCK, HOLDLOCK) WHERE e.Id = {0}",
                encomendaId)
            .ToListAsync(cancellationToken);

        return rows.Count > 0;
    }

    public static async Task<IReadOnlyList<EntradaPaiolSaldoPreparacao>> ListSaldoFifoLockedAsync(
        FinalprojContext context,
        IReadOnlyList<int> paiolIds,
        IReadOnlyCollection<int> produtoIds,
        CancellationToken cancellationToken)
    {
        if (paiolIds.Count == 0)
            return [];

        if (!context.Database.IsSqlServer())
            return await ListSaldoFifoLinQAsync(context, paiolIds, produtoIds, cancellationToken);

        var parameters = new List<object>();
        var paiolIn = BuildInClause(paiolIds, parameters);
        var produtoFilter = produtoIds.Count == 0
            ? "1 = 1"
            : $"e.ProdutoId IN ({BuildInClause(produtoIds, parameters)})";

        var sql = $"""
            SELECT
                e.Id,
                e.PaiolId,
                e.ProdutoId,
                e.Quantidade - ISNULL(s.TotalSaidas, 0) AS QuantidadeRestante,
                e.DataEntrada,
                e.DataFabrico,
                e.NumeroLote,
                p.Nome AS PaiolNome
            FROM EntradasPaiol e WITH (UPDLOCK, HOLDLOCK)
            INNER JOIN Paiol p ON p.Id = e.PaiolId
            OUTER APPLY (
                SELECT SUM(sp.Quantidade) AS TotalSaidas
                FROM SaidasPaiol sp
                WHERE sp.EntradaPaiolId = e.Id
            ) s
            WHERE e.PaiolId IN ({paiolIn})
              AND {produtoFilter}
              AND e.Quantidade - ISNULL(s.TotalSaidas, 0) > 0
            ORDER BY COALESCE(e.DataFabrico, e.DataEntrada), e.DataEntrada
            """;

        var rows = await context.Database.SqlQueryRaw<SaldoRow>(sql, parameters.ToArray()).ToListAsync(cancellationToken);

        return rows.Select(r => new EntradaPaiolSaldoPreparacao
        {
            Id = r.Id,
            PaiolId = r.PaiolId,
            ProdutoId = r.ProdutoId,
            QuantidadeRestante = r.QuantidadeRestante,
            DataEntrada = r.DataEntrada,
            DataFabrico = r.DataFabrico,
            NumeroLote = r.NumeroLote,
            PaiolNome = r.PaiolNome
        }).ToList();
    }

    private static async Task<IReadOnlyList<EntradaPaiolSaldoPreparacao>> ListSaldoFifoLinQAsync(
        FinalprojContext context,
        IReadOnlyList<int> paiolIds,
        IReadOnlyCollection<int> produtoIds,
        CancellationToken cancellationToken)
    {
        var query = context.EntradasPaiol.AsNoTracking().Where(e => paiolIds.Contains(e.PaiolId));
        if (produtoIds.Count > 0)
            query = query.Where(e => produtoIds.Contains(e.ProdutoId));

        return await query
            .Select(e => new EntradaPaiolSaldoPreparacao
            {
                Id = e.Id,
                PaiolId = e.PaiolId,
                ProdutoId = e.ProdutoId,
                QuantidadeRestante = e.Quantidade - (context.SaidasPaiol
                    .Where(s => s.EntradaPaiolId == e.Id)
                    .Sum(s => (decimal?)s.Quantidade) ?? 0m),
                DataEntrada = e.DataEntrada,
                DataFabrico = e.DataFabrico,
                NumeroLote = e.NumeroLote,
                PaiolNome = e.Paiol.Nome
            })
            .Where(x => x.QuantidadeRestante > 0)
            .OrderBy(x => x.DataFabrico ?? x.DataEntrada)
            .ThenBy(x => x.DataEntrada)
            .ToListAsync(cancellationToken);
    }

    private static string BuildInClause(IReadOnlyCollection<int> ids, List<object> parameters)
    {
        if (ids.Count == 0)
            return "NULL";

        var parts = new List<string>(ids.Count);
        foreach (var id in ids)
        {
            parts.Add($"{{{parameters.Count}}}");
            parameters.Add(id);
        }

        return string.Join(", ", parts);
    }
}
