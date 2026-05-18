using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Paiols.Services;

public sealed class SaidaPaiolApplicationService(
    IPaiolAcessoRepository acessos,
    IPaiolRepository paiois,
    IProdutoRepository produtos,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IUnitOfWork unitOfWork) : ISaidaPaiolApplicationService
{
    public async Task<(Paiol? Paiol, Produto? Produto, decimal StockDisponivel, bool TemAcesso)> GetFormularioAsync(int paiolId, int produtoId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var idsAcesso = await acessos.ListPaiolIdsByRoleNamesAsync(roles, cancellationToken);
        var paiol = await paiois.GetByIdAsync(paiolId, cancellationToken);
        var produto = await produtos.GetByIdAsync(produtoId, cancellationToken);
        return (paiol, produto, await StockAsync(paiolId, produtoId, cancellationToken), idsAcesso.Contains(paiolId));
    }

    public async Task<(SaidaPaiol? Saida, Paiol? Paiol, Produto? Produto, string? Erro, decimal StockDisponivel, bool TemAcesso)> RegistarAsync(SaidaPaiolViewModel model, string? userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default)
    {
        var dados = await GetFormularioAsync(model.PaiolId, model.ProdutoId, roles, cancellationToken);
        if (!dados.TemAcesso)
            return (null, dados.Paiol, dados.Produto, "Sem acesso ao paiol.", dados.StockDisponivel, false);
        if (dados.Paiol == null || dados.Produto == null)
            return (null, dados.Paiol, dados.Produto, "Paiol ou produto inválido.", dados.StockDisponivel, true);
        if (model.Quantidade > dados.StockDisponivel)
            return (null, dados.Paiol, dados.Produto, $"Quantidade indisponível. Stock atual neste paiol: {dados.StockDisponivel:N2}.", dados.StockDisponivel, true);
        var saida = new SaidaPaiol
        {
            PaiolId = model.PaiolId,
            ProdutoId = model.ProdutoId,
            Quantidade = model.Quantidade,
            DataSaida = DateTime.UtcNow,
            FuncionarioRetirouUserId = userId
        };
        await saidas.AddAsync(saida, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (saida, dados.Paiol, dados.Produto, null, dados.StockDisponivel, true);
    }

    private async Task<decimal> StockAsync(int paiolId, int produtoId, CancellationToken cancellationToken)
    {
        var entradasProduto = await entradas.SumEntradasByPaiolProdutoForPaiolIdsAsync([paiolId], cancellationToken);
        var saidasProduto = await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync([paiolId], cancellationToken);
        return entradasProduto.Where(e => e.ProdutoId == produtoId).Sum(e => e.Total) - saidasProduto.Where(s => s.ProdutoId == produtoId).Sum(s => s.Total);
    }
}
