namespace Finalproj.Domain.Interfaces.Repositories;

public interface IEncomendaRepository
{
    Task<Encomenda?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Encomenda entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Encomenda entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Encomenda entity, CancellationToken cancellationToken = default);

    Task<Encomenda?> GetByIdWithItensAndProdutosTrackedAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Carrega encomenda para preparação com lock de linha (SQL Server) dentro de transação activa.</summary>
    Task<Encomenda?> GetByIdWithItensAndProdutosForPreparacaoLockedAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> ListConcluidasComClienteExceptEncomendaIdsAsync(IReadOnlyCollection<int> encomendaIdsUsadas, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default);
    Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> CountGroupedByEstadoAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Encomenda> Items, int TotalRegistos)> ListPagedWithClienteAsync(
        string? estadoFiltro,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);

    Task<Encomenda?> GetByIdDetailNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteItensProdutoServicosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteItensProdutoNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithItensTrackedAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Encomenda>> ListAtivasComItensProdutoByClienteAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Encomenda> Items, int Total)> ListHistoricoClientePaginatedAsync(int clienteId, int pagina, int pageSize, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Encomenda>> ListRecentWithClienteAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> ListPendentesWithClienteAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(string MesKey, int Total)>> EncomendasPorMesUltimos6MesesAsync(CancellationToken cancellationToken = default);
}

