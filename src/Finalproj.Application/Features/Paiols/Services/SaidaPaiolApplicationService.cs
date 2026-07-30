using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Paiols.Services;

public sealed class SaidaPaiolApplicationService(
    IPaiolRepository paiois,
    IProdutoRepository produtos,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IUnitOfWork unitOfWork,
    ILogSistemaService logSistema) : ISaidaPaiolApplicationService
{
    public async Task<(Paiol? Paiol, Produto? Produto, decimal StockDisponivel, bool TemAcesso)> GetFormularioAsync(int paiolId, int produtoId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var paiol = await paiois.GetByIdAsync(paiolId, cancellationToken);
        var produto = await produtos.GetByIdAsync(produtoId, cancellationToken);
        return (paiol, produto, await StockAsync(paiolId, produtoId, cancellationToken), paiol != null);
    }

    public async Task<(SaidaPaiol? Saida, Paiol? Paiol, Produto? Produto, string? Erro, decimal StockDisponivel, bool TemAcesso)> RegistarAsync(SaidaPaiolViewModel model, string? userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var dados = await GetFormularioAsync(model.PaiolId, model.ProdutoId, roles, cancellationToken);
        if (!dados.TemAcesso)
            return (null, dados.Paiol, dados.Produto, "Sem acesso ao paiol.", dados.StockDisponivel, false);
        if (dados.Paiol == null || dados.Produto == null)
            return (null, dados.Paiol, dados.Produto, "Paiol ou produto inválido.", dados.StockDisponivel, true);
        if (model.Quantidade <= 0)
            return (null, dados.Paiol, dados.Produto, "A quantidade deve ser superior a zero.", dados.StockDisponivel, true);
        if (model.Quantidade > dados.StockDisponivel)
            return (null, dados.Paiol, dados.Produto, $"Quantidade indisponível. Stock atual neste paiol: {dados.StockDisponivel:N2}.", dados.StockDisponivel, true);

        await using var transaction = await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var entradasComSaldo = await entradas.ListComSaldoParaPreparacaoLockedAsync(
                [model.PaiolId],
                [model.ProdutoId],
                cancellationToken);

            var restantePorEntrada = entradasComSaldo.ToDictionary(e => e.Id, e => e.QuantidadeRestante);
            var falta = model.Quantidade;
            var logsPendentes = new List<(int ProdutoId, string? NumeroLote, decimal Quantidade, int PaiolId, string? PaiolNome)>();
            SaidaPaiol? primeiraSaida = null;

            foreach (var ent in entradasComSaldo)
            {
                if (falta <= 0) break;
                var rest = restantePorEntrada.GetValueOrDefault(ent.Id, 0m);
                if (rest <= 0) continue;

                var qty = Math.Min(falta, rest);
                var saida = new SaidaPaiol
                {
                    PaiolId = ent.PaiolId,
                    ProdutoId = ent.ProdutoId,
                    Quantidade = qty,
                    DataSaida = DateTime.UtcNow,
                    EntradaPaiolId = ent.Id,
                    FuncionarioRetirouUserId = userId
                };

                await saidas.AddAsync(saida, cancellationToken);
                primeiraSaida ??= saida;

                restantePorEntrada[ent.Id] = rest - qty;
                falta -= qty;

                logsPendentes.Add((ent.ProdutoId, ent.NumeroLote, qty, ent.PaiolId, ent.PaiolNome));
            }

            if (falta > 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                return (null, dados.Paiol, dados.Produto, "Stock insuficiente nos lotes do paiol selecionado para cobrir a saída.", dados.StockDisponivel, true);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            foreach (var log in logsPendentes)
            {
                await logSistema.RegistarAsync("SAIDA_STOCK", userId, null, new
                {
                    produto_id = log.ProdutoId,
                    numero_lote = log.NumeroLote,
                    quantidade_retirada_kg = log.Quantidade,
                    paiol_id = log.PaiolId,
                    paiol_nome = log.PaiolNome,
                    saida_manual = true
                }, cancellationToken);
            }

            return (primeiraSaida, dados.Paiol, dados.Produto, null, dados.StockDisponivel, true);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<decimal> StockAsync(int paiolId, int produtoId, CancellationToken cancellationToken)
    {
        var entradasProduto = await entradas.SumEntradasByPaiolProdutoForPaiolIdsAsync([paiolId], cancellationToken);
        var saidasProduto = await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync([paiolId], cancellationToken);
        return entradasProduto.Where(e => e.ProdutoId == produtoId).Sum(e => e.Total) - saidasProduto.Where(s => s.ProdutoId == produtoId).Sum(s => s.Total);
    }
}
