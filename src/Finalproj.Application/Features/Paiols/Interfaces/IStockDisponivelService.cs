namespace Finalproj.Application.Features.Paiols.Interfaces;

// Stock disponível = entradas - saídas - reservas (encomendas em curso)
public interface IStockDisponivelService
{
    Task<Dictionary<int, decimal>> ObterStockDisponivelPorProdutoAsync(CancellationToken cancellationToken = default);
    Task<decimal> ObterStockDisponivelAsync(int produtoId, CancellationToken cancellationToken = default);
}
