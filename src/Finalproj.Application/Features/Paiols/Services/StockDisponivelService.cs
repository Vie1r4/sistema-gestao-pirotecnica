using Finalproj.Application.Features.Paiols.Interfaces;



namespace Finalproj.Application.Features.Paiols.Services;



/// <summary>

/// Regras de domínio para stock: quantidade disponível por produto (saldo por lote não esgotado − saídas avulsas − reservas).

/// </summary>

public class StockDisponivelService : IStockDisponivelService

{

    private readonly IEntradaPaiolRepository _entradaPaiolRepository;

    private readonly IReservaRepository _reservaRepository;



    public StockDisponivelService(

        IEntradaPaiolRepository entradaPaiolRepository,

        IReservaRepository reservaRepository)

    {

        _entradaPaiolRepository = entradaPaiolRepository;

        _reservaRepository = reservaRepository;

    }



    /// <inheritdoc />

    public async Task<Dictionary<int, decimal>> ObterStockDisponivelPorProdutoAsync(CancellationToken cancellationToken = default)

    {

        var saldoPorProduto = await _entradaPaiolRepository.SumSaldoDisponivelPorProdutoAsync(cancellationToken);

        var reservas = await _reservaRepository.SumQuantidadePorProdutoParaEstadosComReservaAsync(cancellationToken);



        var resultado = new Dictionary<int, decimal>();

        foreach (var kv in saldoPorProduto)

            resultado[kv.Key] = kv.Value;

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


