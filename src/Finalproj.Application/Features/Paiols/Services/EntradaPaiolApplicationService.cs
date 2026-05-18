using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Paiols.Services;

public sealed class EntradaPaiolApplicationService(
    IPaiolAcessoRepository acessos,
    IPaiolRepository paiois,
    IProdutoRepository produtos,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IUnitOfWork unitOfWork) : IEntradaPaiolApplicationService
{
    public async Task<(IReadOnlyList<Paiol> Paiois, IReadOnlyList<Produto> Produtos)> GetFormularioAsync(IReadOnlyCollection<string> roles, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
    {
        var ids = await acessos.ListPaiolIdsByRoleNamesAsync(roles, cancellationToken);
        var paioisAcesso = (await paiois.ListByIdsOrderedAsync(ids, cancellationToken))
            .Where(p => p.Estado == ConstantesPaiol.EstadoAtivo)
            .ToList();
        var produtosFiltrados = await produtos.SearchAsync(null, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);
        return (paioisAcesso, produtosFiltrados);
    }

    public async Task<(EntradaPaiol? Entrada, Paiol? Paiol, Produto? Produto, decimal MleTotalApos, IReadOnlyList<string> Erros, IReadOnlyList<string> Avisos)> RegistarAsync(EntradaPaiolViewModel model, string? userId, CancellationToken cancellationToken = default)
    {
        var paiol = await paiois.FindTrackedByIdAsync(model.PaiolId, cancellationToken);
        var produto = await produtos.FindTrackedByIdAsync(model.ProdutoId, cancellationToken);
        if (paiol == null || produto == null)
            return (null, paiol, produto, 0, ["Paiol ou produto inválido."], []);
        if (paiol.Estado != ConstantesPaiol.EstadoAtivo)
            return (null, paiol, produto, 0, ["O paiol está em manutenção e não pode receber carga."], []);

        var entradasPaiol = await entradas.ListForPreparacaoByPaiolIdsWithIncludesAsync([paiol.Id], cancellationToken);
        var saidasPaiol = (await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync([paiol.Id], cancellationToken)).ToDictionary(x => x.ProdutoId, x => x.Total);
        var produtosNoPaiol = entradasPaiol
            .GroupBy(e => e.ProdutoId)
            .Select(g =>
            {
                var p = g.First().Produto;
                var quantidade = g.Sum(e => e.Quantidade) - saidasPaiol.GetValueOrDefault(g.Key);
                return new ProdutoNoPaiolDto
                {
                    Divisao = p.FamiliaRisco ?? "",
                    Grupo = string.IsNullOrWhiteSpace(p.GrupoCompatibilidade) ? "G" : p.GrupoCompatibilidade.Trim().ToUpperInvariant(),
                    Quantidade = Math.Max(0, quantidade),
                    NEMPorUnidade = p.NEMPorUnidade
                };
            })
            .Where(p => p.Quantidade > 0)
            .ToList();
        var mleAtual = produtosNoPaiol.Sum(p => p.Quantidade * p.NEMPorUnidade);
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, model.Quantidade, produtosNoPaiol, mleAtual, model.DataValidade);
        if (!resultado.Aprovado)
            return (null, paiol, produto, 0, resultado.Erros.Select(e => $"[{e.Codigo}] {e.Mensagem}").ToList(), resultado.Avisos.Select(a => a.Mensagem).ToList());

        var entrada = new EntradaPaiol
        {
            PaiolId = paiol.Id,
            ProdutoId = produto.Id,
            Quantidade = model.Quantidade,
            DataEntrada = DateTime.UtcNow,
            FuncionarioRegistouUserId = userId,
            NumeroLote = string.IsNullOrWhiteSpace(model.NumeroLote) ? null : model.NumeroLote.Trim(),
            DataFabrico = model.DataFabrico,
            DataValidade = model.DataValidade
        };
        await entradas.AddAsync(entrada, cancellationToken);
        if (!string.IsNullOrEmpty(resultado.DivisaoDominanteResultante))
            paiol.DivisaoDominante = resultado.DivisaoDominanteResultante;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (entrada, paiol, produto, mleAtual + model.Quantidade * produto.NEMPorUnidade, [], resultado.Avisos.Select(a => a.Mensagem).ToList());
    }
}
