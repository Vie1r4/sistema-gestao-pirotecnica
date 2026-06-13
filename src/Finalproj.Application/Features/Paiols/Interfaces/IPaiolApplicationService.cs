using Finalproj.Application.Features.Paiols.DTOs;

namespace Finalproj.Application.Features.Paiols.Interfaces;

public interface IPaiolApplicationService
{
    Task<IReadOnlyList<int>> GetPaiolIdsComAcessoAsync(bool podeVerTodos, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListByAccessAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListAllOrderedAsync(CancellationToken cancellationToken = default);
    Task<Paiol?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PaiolComOcupacaoResponseDto>> ListComOcupacaoAsync(IReadOnlyCollection<int>? paiolIds = null, CancellationToken cancellationToken = default);
    Task<object> GetStockCatalogoAsync(IReadOnlyCollection<int> paiolIds, string? pesquisa, string? classificacao, string? categoria, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default);
    Task<object> GetMovimentosAsync(IReadOnlyCollection<int> paiolIds, string? tipo, int? paiolId, int pagina, int itensPorPagina, IReadOnlyDictionary<string, string> nomesUtilizadores, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetMovimentoUserIdsAsync(IReadOnlyCollection<int> paiolIds, string? tipo, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
    Task<object?> GetConteudoAsync(int id, CancellationToken cancellationToken = default);
    Task<object?> GetDetailsDataAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetCargosAcessoAsync(int paiolId, CancellationToken cancellationToken = default);
    Task<Paiol> CreateAsync(Paiol paiol, IReadOnlyCollection<string>? cargosAcesso = null, IEnumerable<PaiolDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default);
    Task<Paiol?> UpdateAsync(int id, Paiol paiol, IReadOnlyCollection<string>? cargosAcesso = null, IEnumerable<PaiolDocumentoExtra>? documentosExtras = null, IReadOnlyCollection<int>? removerDocumentoIds = null, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<Dictionary<string, decimal>> GetStockPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<string?> GetDocumentoExtraPathForPaiolAsync(int paiolId, int docId, CancellationToken cancellationToken = default);
}
