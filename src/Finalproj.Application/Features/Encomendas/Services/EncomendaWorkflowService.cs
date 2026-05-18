using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Features.Encomendas.Interfaces;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Application.Features.Produtos.DTOs;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Encomendas.Services;

public sealed class EncomendaWorkflowService(
    IEncomendaRepository encomendas,
    IClienteRepository clientes,
    IProdutoRepository produtos,
    IEncomendaItemRepository itens,
    IReservaRepository reservas,
    IPaiolAcessoRepository acessos,
    IPaiolRepository paiois,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IStockDisponivelService stockDisponivel,
    IUnitOfWork unitOfWork) : IEncomendaWorkflowService
{
    public async Task<object> ListAsync(string? estado, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        var (items, total) = await encomendas.ListPagedWithClienteAsync(estado, pagina, itensPorPagina, cancellationToken);
        var totaisPorEstado = await encomendas.CountGroupedByEstadoAsync(cancellationToken);
        return new
        {
            items = items.Select(EncomendaResponseDtoMapping.MapToList).ToList(),
            estado = estado ?? string.Empty,
            estadosParaFiltro = ConstantesEncomenda.TodosEstados,
            totaisPorEstado,
            totalGeral = totaisPorEstado.Values.Sum(),
            paginaAtual = pagina,
            itensPorPagina,
            totalRegistos = total
        };
    }

    public Task<Encomenda?> GetDetailAsync(int id, CancellationToken cancellationToken = default) =>
        encomendas.GetByIdWithClienteItensProdutoServicosNoTrackingAsync(id, cancellationToken);

    public async Task<EncomendaDetailResponseDto?> GetDetailDtoAsync(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.GetByIdWithClienteItensProdutoNoTrackingAsync(id, cancellationToken);
        return encomenda == null ? null : EncomendaResponseDtoMapping.MapToDetail(encomenda);
    }

    public async Task<object> GetCreateDataAsync(int? clienteId, CancellationToken cancellationToken = default) => new
    {
        clientes = (await clientes.ListOrderedForSelectAsync(cancellationToken)).Select(c => new EncomendaClienteResumoDto { Id = c.Id, Nome = c.Nome }).ToList(),
        model = new EncomendaCriarViewModel { ClienteId = clienteId ?? 0 }
    };

    public async Task<bool> ClienteExistsAsync(int clienteId, CancellationToken cancellationToken = default) =>
        await clientes.GetByIdAsync(clienteId, cancellationToken) != null;

    public async Task<object?> GetAdicionarItensDataAsync(int clienteId, string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, IReadOnlyList<EncomendaItemCriarViewModel> itensRascunho, CancellationToken cancellationToken = default)
    {
        var cliente = await clientes.GetByIdAsync(clienteId, cancellationToken);
        if (cliente == null)
            return null;
        var produtosFiltrados = (await produtos.SearchAsync(pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken)).Select(ProdutoResponseDtoMapping.Map).ToList();
        return new
        {
            cliente = new EncomendaClienteResumoDto { Id = cliente.Id, Nome = cliente.Nome },
            clienteId,
            pesquisa = pesquisa ?? string.Empty,
            classificacao = classificacao ?? string.Empty,
            grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
            filtroTecnico = filtroTecnico ?? string.Empty,
            calibre = calibre ?? string.Empty,
            produtosFiltrados,
            itensRascunho,
            model = new EncomendaCriarViewModel { ClienteId = clienteId, Itens = itensRascunho.ToList() }
        };
    }

    public Task<Produto?> GetProdutoAsync(int produtoId, CancellationToken cancellationToken = default) =>
        produtos.GetByIdAsync(produtoId, cancellationToken);

    public async Task<Encomenda?> SubmeterAsync(int clienteId, DateTime? dataEntrega, string? observacoes, IReadOnlyList<EncomendaItemCriarViewModel> draftItens, CancellationToken cancellationToken = default)
    {
        if (await clientes.GetByIdAsync(clienteId, cancellationToken) == null || draftItens.Count == 0)
            return null;
        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.PENDENTE,
            DataCriacao = DateTime.UtcNow,
            DataEntrega = dataEntrega,
            Observacoes = string.IsNullOrWhiteSpace(observacoes) ? null : observacoes.Trim()[..Math.Min(2000, observacoes.Trim().Length)]
        };
        await encomendas.AddAsync(encomenda, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        foreach (var item in draftItens)
        {
            await itens.AddAsync(new EncomendaItem { EncomendaId = encomenda.Id, ProdutoId = item.ProdutoId, QuantidadePedida = item.Quantidade }, cancellationToken);
            await reservas.AddAsync(new Reserva { EncomendaId = encomenda.Id, ProdutoId = item.ProdutoId, Quantidade = item.Quantidade }, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return encomenda;
    }

    public async Task<(Encomenda? Encomenda, string? Erro)> UpdateAsync(int id, EditEncomendaDto input, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.GetByIdWithItensTrackedAsync(id, cancellationToken);
        if (encomenda == null)
            return (null, null);
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
            return (encomenda, "Apenas encomendas Pendente ou Aceite podem ser editadas.");
        if (input.Itens == null || input.Itens.Count == 0)
            return (encomenda, "A encomenda tem de ter pelo menos um item com quantidade positiva.");
        foreach (var item in input.Itens)
        {
            if (item.Quantidade < 0.0001m)
                return (encomenda, "A quantidade deve ser positiva.");
            if (!await produtos.ExistsAsync(item.ProdutoId, cancellationToken))
                return (encomenda, $"Produto com id {item.ProdutoId} não encontrado.");
        }
        encomenda.DataEntrega = input.DataEntrega;
        var obs = input.Observacoes?.Trim();
        encomenda.Observacoes = string.IsNullOrWhiteSpace(obs) ? null : obs.Length > 2000 ? obs[..2000] : obs;
        reservas.RemoveRange(await reservas.ListByEncomendaIdTrackedAsync(id, cancellationToken));
        itens.RemoveRange(encomenda.Itens);
        foreach (var item in input.Itens)
        {
            await itens.AddAsync(new EncomendaItem { EncomendaId = id, ProdutoId = item.ProdutoId, QuantidadePedida = item.Quantidade }, cancellationToken);
            await reservas.AddAsync(new Reserva { EncomendaId = id, ProdutoId = item.ProdutoId, Quantidade = item.Quantidade }, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (encomenda, null);
    }

    public async Task<(Encomenda? Encomenda, string? Erro)> AceitarAsync(int id, string? userId, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.FindTrackedByIdAsync(id, cancellationToken);
        if (encomenda == null) return (null, null);
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE) return (encomenda, "Apenas encomendas pendentes podem ser aceites.");
        encomenda.Estado = ConstantesEncomenda.ACEITE;
        encomenda.FuncionarioAceiteUserId = userId;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (encomenda, null);
    }

    public async Task<(Encomenda? Encomenda, string? Erro)> RejeitarAsync(int id, string? motivo, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.GetByIdWithItensTrackedAsync(id, cancellationToken);
        if (encomenda == null) return (null, null);
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE) return (encomenda, "Apenas encomendas pendentes ou aceites podem ser rejeitadas.");
        encomenda.Estado = ConstantesEncomenda.REJEITADA;
        encomenda.MotivoRejeicao = string.IsNullOrWhiteSpace(motivo) ? null : motivo.Trim();
        reservas.RemoveRange(await reservas.ListByEncomendaIdTrackedAsync(id, cancellationToken));
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (encomenda, null);
    }

    public async Task<object?> PrepararDataAsync(int id, IReadOnlyCollection<string> rolesDoUtilizador, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.GetByIdWithClienteItensProdutoNoTrackingAsync(id, cancellationToken);
        if (encomenda == null)
            return null;
        if (encomenda.Estado != ConstantesEncomenda.ACEITE)
            return new { error = "Apenas encomendas aceites podem ser preparadas." };
        var idsPaiois = await acessos.ListPaiolIdsByRoleNamesAsync(rolesDoUtilizador, cancellationToken);
        var paioisComAcesso = await paiois.ListByIdsOrderedAsync(idsPaiois, cancellationToken);
        return new
        {
            encomenda = EncomendaResponseDtoMapping.MapToDetail(encomenda),
            stockPorProduto = await stockDisponivel.ObterStockDisponivelPorProdutoAsync(cancellationToken),
            paióis = paioisComAcesso.Select(PaiolResponseDtoMapping.Map).ToList(),
            stockPaiolProduto = await GetStockPaiolProdutoAsync(idsPaiois, cancellationToken)
        };
    }

    public Task<IReadOnlyList<int>> GetPaiolIdsComAcessoAsync(IReadOnlyCollection<string> rolesDoUtilizador, CancellationToken cancellationToken = default) =>
        acessos.ListPaiolIdsByRoleNamesAsync(rolesDoUtilizador, cancellationToken);

    private async Task<Dictionary<string, decimal>> GetStockPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken)
    {
        var stock = new Dictionary<string, decimal>();
        foreach (var e in await entradas.SumEntradasByPaiolProdutoForPaiolIdsAsync(paiolIds, cancellationToken))
            stock[$"{e.PaiolId}_{e.ProdutoId}"] = e.Total;
        foreach (var s in await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync(paiolIds, cancellationToken))
        {
            var key = $"{s.PaiolId}_{s.ProdutoId}";
            stock[key] = Math.Max(0, stock.GetValueOrDefault(key) - s.Total);
        }
        return stock;
    }

    public async Task<(Encomenda? Encomenda, string? Erro)> ConcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await encomendas.FindTrackedByIdAsync(id, cancellationToken);
        if (encomenda == null) return (null, null);
        if (encomenda.Estado != ConstantesEncomenda.EM_PREPARACAO) return (encomenda, "Apenas encomendas em preparação podem ser concluídas.");
        encomenda.Estado = ConstantesEncomenda.CONCLUIDA;
        encomenda.DataConclusao = DateTime.UtcNow;
        reservas.RemoveRange(await reservas.ListByEncomendaIdTrackedAsync(id, cancellationToken));
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (encomenda, null);
    }
}
