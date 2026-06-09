namespace Finalproj.Domain.Interfaces.Repositories;

public interface ISaidaPaiolRepository
{
    Task<SaidaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SaidaPaiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SaidaPaiol>> ListComEntradaPaiolReferenciadaAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SaidaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default);
    Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumSaidasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<SaidaPaiol?> FindUltimaSaidaParaRotaAsync(int encomendaId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<SaidaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
}

