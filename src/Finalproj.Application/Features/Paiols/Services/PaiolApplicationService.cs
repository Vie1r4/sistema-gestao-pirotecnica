using Finalproj.Application.Features.Produtos.DTOs;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Paiols.Services;

public sealed class PaiolApplicationService(
    IPaiolRepository paiois,
    IPaiolAcessoRepository acessos,
    IPaiolDocumentoExtraRepository documentos,
    IProdutoRepository produtos,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IUnitOfWork unitOfWork) : IPaiolApplicationService
{
    public Task<IReadOnlyList<int>> GetPaiolIdsComAcessoAsync(bool podeVerTodos, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default) =>
        podeVerTodos ? acessos.ListAllPaiolIdsAsync(cancellationToken) : acessos.ListPaiolIdsByRoleNamesAsync(roles, cancellationToken);

    public Task<IReadOnlyList<Paiol>> ListByAccessAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default) =>
        paiois.ListByIdsOrderedAsync(paiolIds, cancellationToken);

    public Task<IReadOnlyList<Paiol>> ListAllOrderedAsync(CancellationToken cancellationToken = default) =>
        paiois.ListAllOrderedAsync(cancellationToken);

    public Task<Paiol?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default) =>
        includeDocumentos ? paiois.GetByIdWithDocumentosTrackedAsync(id, cancellationToken) : paiois.GetByIdAsync(id, cancellationToken);

    public async Task<IReadOnlyList<PaiolComOcupacaoResponseDto>> ListComOcupacaoAsync(IReadOnlyCollection<int>? paiolIds = null, CancellationToken cancellationToken = default)
    {
        var lista = paiolIds == null ? await paiois.ListAllOrderedAsync(cancellationToken) : await paiois.ListByIdsOrderedAsync(paiolIds, cancellationToken);
        var ocupacao = await CalcularOcupacaoPorPaiolAsync(lista, cancellationToken);
        return lista.Select(p => new PaiolComOcupacaoResponseDto
        {
            Paiol = PaiolResponseDtoMapping.Map(p),
            MleAtual = ocupacao.GetValueOrDefault(p.Id).MleAtual,
            PercentagemOcupacao = ocupacao.GetValueOrDefault(p.Id).PercentagemOcupacao
        }).ToList();
    }

    public async Task<object> GetStockCatalogoAsync(IReadOnlyCollection<int> paiolIds, string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
    {
        var stockPorProduto = await ObterStockFisicoPorProdutoAsync(paiolIds, cancellationToken);
        var lista = await produtos.SearchAsync(pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);
        return new
        {
            items = lista.Select(ProdutoResponseDtoMapping.Map).ToList(),
            stockPorProduto,
            pesquisa = pesquisa ?? string.Empty,
            classificacao = classificacao ?? string.Empty,
            grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
            filtroTecnico = filtroTecnico ?? string.Empty,
            calibre = calibre ?? string.Empty
        };
    }

    public async Task<IReadOnlyList<string>> GetMovimentoUserIdsAsync(IReadOnlyCollection<int> paiolIds, string? tipo, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        if (tipo == "Entradas")
        {
            var (items, _) = await entradas.ListPagedWithPaiolProdutoAsync(paiolIds, paiolId, pagina, itensPorPagina, cancellationToken);
            return items.Where(e => !string.IsNullOrEmpty(e.FuncionarioRegistouUserId)).Select(e => e.FuncionarioRegistouUserId!).Distinct().ToList();
        }
        if (tipo == "Saidas")
        {
            var (items, _) = await saidas.ListPagedWithPaiolProdutoAsync(paiolIds, paiolId, pagina, itensPorPagina, cancellationToken);
            return items.Where(s => !string.IsNullOrEmpty(s.FuncionarioRetirouUserId)).Select(s => s.FuncionarioRetirouUserId!).Distinct().ToList();
        }
        return [];
    }

    public async Task<object> GetMovimentosAsync(IReadOnlyCollection<int> paiolIds, string? tipo, int? paiolId, int pagina, int itensPorPagina, IReadOnlyDictionary<string, string> nomesUtilizadores, CancellationToken cancellationToken = default)
    {
        var paioisAcesso = await paiois.ListByIdsOrderedAsync(paiolIds, cancellationToken);
        var paioisNomes = paioisAcesso.Select(p => new PaiolListagemNomeDto { Id = p.Id, Nome = p.Nome }).ToList();
        if (string.IsNullOrEmpty(tipo))
            return new { paióis = paioisNomes, paiolIdFiltro = paiolId, tipo = tipo ?? string.Empty, entradas = new List<EntradaPaiolMovimentoDto>(), saidas = new List<SaidaPaiolMovimentoDto>(), paginaAtual = pagina, totalRegistos = 0, itensPorPagina };
        if (tipo == "Entradas")
        {
            var (items, total) = await entradas.ListPagedWithPaiolProdutoAsync(paiolIds, paiolId, pagina, itensPorPagina, cancellationToken);
            return new { paióis = paioisNomes, paiolIdFiltro = paiolId, tipo, entradas = items.Select(e => ArmazemResponseDtoMapping.MapEntradaMovimento(e, nomesUtilizadores)).ToList(), saidas = new List<SaidaPaiolMovimentoDto>(), nomesUtilizadoresEntradas = nomesUtilizadores, paginaAtual = pagina, totalRegistos = total, itensPorPagina };
        }
        var (saidasItems, totalSaidas) = await saidas.ListPagedWithPaiolProdutoAsync(paiolIds, paiolId, pagina, itensPorPagina, cancellationToken);
        return new { paióis = paioisNomes, paiolIdFiltro = paiolId, tipo, entradas = new List<EntradaPaiolMovimentoDto>(), saidas = saidasItems.Select(s => ArmazemResponseDtoMapping.MapSaidaMovimento(s, nomesUtilizadores)).ToList(), nomesUtilizadoresSaidas = nomesUtilizadores, paginaAtual = pagina, totalRegistos = totalSaidas, itensPorPagina };
    }

    public async Task<object?> GetConteudoAsync(int id, CancellationToken cancellationToken = default)
    {
        var paiol = await paiois.GetByIdAsync(id, cancellationToken);
        if (paiol == null)
            return null;
        var carga = await GetCargaAsync(id, cancellationToken);
        return new { paiol = PaiolResponseDtoMapping.Map(paiol), carga };
    }

    public async Task<object?> GetDetailsDataAsync(int id, CancellationToken cancellationToken = default)
    {
        var paiol = await paiois.GetByIdWithDocumentosTrackedAsync(id, cancellationToken);
        if (paiol == null)
            return null;
        var carga = await GetCargaAsync(id, cancellationToken);
        var cargosAcesso = await acessos.ListRoleNamesByPaiolIdAsync(id, cancellationToken);
        return new { paiol = PaiolResponseDtoMapping.Map(paiol), nemAtual = carga.Sum(x => x.NEMTotal), carga, cargosAcesso };
    }

    public Task<IReadOnlyList<string>> GetCargosAcessoAsync(int paiolId, CancellationToken cancellationToken = default) =>
        acessos.ListRoleNamesByPaiolIdAsync(paiolId, cancellationToken);

    public async Task<Paiol> CreateAsync(Paiol paiol, IReadOnlyCollection<string>? cargosAcesso = null, IEnumerable<PaiolDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default)
    {
        await paiois.AddAsync(paiol, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await RecriarAcessosAsync(paiol.Id, cargosAcesso, cancellationToken);
        foreach (var doc in documentosExtras ?? Enumerable.Empty<PaiolDocumentoExtra>())
        {
            doc.PaiolId = paiol.Id;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return paiol;
    }

    public async Task<Paiol?> UpdateAsync(int id, Paiol paiol, IReadOnlyCollection<string>? cargosAcesso = null, IEnumerable<PaiolDocumentoExtra>? documentosExtras = null, IReadOnlyCollection<int>? removerDocumentoIds = null, CancellationToken cancellationToken = default)
    {
        if (id != paiol.Id || !await paiois.ExistsAsync(id, cancellationToken))
            return null;
        var existente = await paiois.FindTrackedByIdAsync(id, cancellationToken);
        if (existente == null)
            return null;
        existente.Nome = paiol.Nome;
        existente.Localizacao = paiol.Localizacao;
        existente.CoordenadasLat = paiol.CoordenadasLat;
        existente.CoordenadasLng = paiol.CoordenadasLng;
        existente.LimiteMLE = paiol.LimiteMLE;
        existente.PerfilRisco = paiol.PerfilRisco;
        existente.Estado = paiol.Estado;
        existente.DataValidadeLicenca = paiol.DataValidadeLicenca;
        existente.NumeroLicenca = paiol.NumeroLicenca;
        // DivisaoDominante é calculada pelo stock — nunca sobrescrever com o payload do formulário.
        if (removerDocumentoIds?.Count > 0)
            documentos.RemoveRange(await documentos.ListByPaiolAndIdsAsync(id, removerDocumentoIds, cancellationToken));
        await RecriarAcessosAsync(id, cargosAcesso, cancellationToken);
        foreach (var doc in documentosExtras ?? Enumerable.Empty<PaiolDocumentoExtra>())
        {
            doc.PaiolId = id;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return existente;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var paiol = await paiois.FindTrackedByIdAsync(id, cancellationToken);
        if (paiol == null)
            return false;
        await paiois.DeleteAsync(paiol, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<Dictionary<string, decimal>> GetStockPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default)
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

    public async Task<string?> GetDocumentoExtraPathForPaiolAsync(int paiolId, int docId, CancellationToken cancellationToken = default) =>
        (await documentos.GetByPaiolAndIdNoTrackingAsync(paiolId, docId, cancellationToken))?.Caminho;

    private async Task<Dictionary<int, (decimal MleAtual, decimal PercentagemOcupacao)>> CalcularOcupacaoPorPaiolAsync(IEnumerable<Paiol> paioisLista, CancellationToken cancellationToken)
    {
        var ids = paioisLista.Select(p => p.Id).ToList();
        var result = new Dictionary<int, (decimal, decimal)>();
        if (ids.Count == 0)
            return result;
        var limites = paioisLista.ToDictionary(p => p.Id, p => p.LimiteMLE);
        var entradasLista = await entradas.ListForPreparacaoByPaiolIdsWithIncludesAsync(ids, cancellationToken);
        var saidasPorPaiolProduto = await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync(ids, cancellationToken);
        foreach (var id in ids)
        {
            var stock = entradasLista.Where(e => e.PaiolId == id).GroupBy(e => e.ProdutoId).ToDictionary(g => g.Key, g => g.Sum(e => e.Quantidade));
            foreach (var s in saidasPorPaiolProduto.Where(s => s.PaiolId == id))
                stock[s.ProdutoId] = stock.GetValueOrDefault(s.ProdutoId) - s.Total;
            var mleAtual = stock.Where(kv => kv.Value > 0).Sum(kv => kv.Value * (entradasLista.First(e => e.PaiolId == id && e.ProdutoId == kv.Key).Produto?.NEMPorUnidade ?? 0));
            var limite = limites[id];
            result[id] = (mleAtual, limite > 0 ? mleAtual / limite * 100 : 0);
        }
        return result;
    }

    private async Task<Dictionary<int, decimal>> ObterStockFisicoPorProdutoAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken)
    {
        var stock = new Dictionary<int, decimal>();
        foreach (var e in await entradas.SumEntradasByPaiolProdutoForPaiolIdsAsync(paiolIds, cancellationToken))
            stock[e.ProdutoId] = stock.GetValueOrDefault(e.ProdutoId) + e.Total;
        foreach (var s in await saidas.SumSaidasByPaiolProdutoForPaiolIdsAsync(paiolIds, cancellationToken))
            stock[s.ProdutoId] = stock.GetValueOrDefault(s.ProdutoId) - s.Total;
        return stock;
    }

    private async Task<List<CargaPaiolItem>> GetCargaAsync(int paiolId, CancellationToken cancellationToken)
    {
        var stock = await GetStockPaiolProdutoAsync([paiolId], cancellationToken);
        var produtosTodos = (await produtos.GetAllAsync(cancellationToken)).ToDictionary(p => p.Id);
        return stock
            .Where(kv => kv.Value > 0)
            .Select(kv => produtosTodos.TryGetValue(int.Parse(kv.Key.Split('_')[1]), out var p)
                ? new CargaPaiolItem { ProdutoId = p.Id, ProdutoNome = p.Nome, Quantidade = kv.Value, NEMPorUnidade = p.NEMPorUnidade, Divisao = p.FamiliaRisco ?? "" }
                : null)
            .Where(x => x != null)
            .Cast<CargaPaiolItem>()
            .ToList();
    }

    private async Task RecriarAcessosAsync(int paiolId, IReadOnlyCollection<string>? cargosAcesso, CancellationToken cancellationToken)
    {
        var existentes = await acessos.ListByPaiolIdTrackedAsync(paiolId, cancellationToken);
        acessos.RemoveRange(existentes);
        foreach (var role in cargosAcesso ?? Array.Empty<string>())
        {
            if (ConstantesPaiol.CargosDisponiveis.Contains(role))
                await acessos.AddAsync(new PaiolAcesso { PaiolId = paiolId, RoleName = role }, cancellationToken);
        }
    }
}
