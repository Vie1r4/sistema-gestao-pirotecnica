using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Paiols.Services;

/// <summary>
/// Regras de domínio para stock: quantidade disponível por produto (entradas - saídas - reservas de encomendas em curso).
/// </summary>
public class StockDisponivelService : IStockDisponivelService
{
    private readonly IEntradaPaiolRepository _entradaPaiolRepository;
    private readonly ISaidaPaiolRepository _saidaPaiolRepository;
    private readonly IReservaRepository _reservaRepository;

    public StockDisponivelService(
        IEntradaPaiolRepository entradaPaiolRepository,
        ISaidaPaiolRepository saidaPaiolRepository,
        IReservaRepository reservaRepository)
    {
        _entradaPaiolRepository = entradaPaiolRepository;
        _saidaPaiolRepository = saidaPaiolRepository;
        _reservaRepository = reservaRepository;
    }

    /// <inheritdoc />
    public async Task<Dictionary<int, decimal>> ObterStockDisponivelPorProdutoAsync(CancellationToken cancellationToken = default)
    {
        var entradas = await _entradaPaiolRepository.SumQuantidadePorProdutoAsync(cancellationToken);
        var saidas = await _saidaPaiolRepository.SumQuantidadePorProdutoAsync(cancellationToken);
        var reservas = await _reservaRepository.SumQuantidadePorProdutoParaEstadosComReservaAsync(cancellationToken);

        var resultado = new Dictionary<int, decimal>();
        foreach (var kv in entradas)
            resultado[kv.Key] = kv.Value;
        foreach (var kv in saidas)
            resultado[kv.Key] = resultado.GetValueOrDefault(kv.Key) - kv.Value;
        foreach (var kv in reservas)
            resultado[kv.Key] = resultado.GetValueOrDefault(kv.Key) - kv.Value;

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
