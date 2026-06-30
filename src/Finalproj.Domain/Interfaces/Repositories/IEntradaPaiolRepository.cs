namespace Finalproj.Domain.Interfaces.Repositories;

public interface IEntradaPaiolRepository
{

    Task<EntradaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EntradaPaiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntradaPaiol>> ListForPreparacaoByPaiolIdsWithIncludesAsync(IReadOnlyList<int> paiolIds, CancellationToken cancellationToken = default);
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Stock disponível por produto: saldo restante por entrada (não esgotada) menos saídas sem lote (EntradaPaiolId nulo).
    /// </summary>
    Task<Dictionary<int, decimal>> SumSaldoDisponivelPorProdutoAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Entradas com saldo &gt; 0 nos paióis indicados, ordenadas FIFO (data fabrico, depois data entrada).
    /// Com lock pessimista em SQL Server — usar dentro de transacção em <see cref="EncomendaService.RegistarPreparacaoAsync"/>.
    /// </summary>
    Task<IReadOnlyList<EntradaPaiolSaldoPreparacao>> ListComSaldoParaPreparacaoLockedAsync(
        IReadOnlyList<int> paiolIds,
        IReadOnlyCollection<int>? produtoIds = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntradaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default);
    Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumEntradasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<EntradaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
}
