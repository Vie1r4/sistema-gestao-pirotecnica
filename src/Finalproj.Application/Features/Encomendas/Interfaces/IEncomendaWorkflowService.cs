using Finalproj.Application.Features.Encomendas.DTOs;

namespace Finalproj.Application.Features.Encomendas.Interfaces;

public interface IEncomendaWorkflowService
{
    Task<object> ListAsync(string? estado, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetDetailAsync(int id, CancellationToken cancellationToken = default);
    Task<EncomendaDetailResponseDto?> GetDetailDtoAsync(int id, CancellationToken cancellationToken = default);
    Task<object> GetCreateDataAsync(int? clienteId, CancellationToken cancellationToken = default);
    Task<bool> ClienteExistsAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<object?> GetAdicionarItensDataAsync(int clienteId, string? pesquisa, string? classificacao, string? categoria, string? filtroTecnico, string? calibre, IReadOnlyList<EncomendaItemCriarViewModel> itensRascunho, CancellationToken cancellationToken = default);
    Task<Produto?> GetProdutoAsync(int produtoId, CancellationToken cancellationToken = default);
    Task<Encomenda?> SubmeterAsync(int clienteId, string? nome, DateTime? dataEntrega, string? observacoes, IReadOnlyList<EncomendaItemCriarViewModel> itens, CancellationToken cancellationToken = default);
    Task<(Encomenda? Encomenda, string? Erro)> UpdateAsync(int id, EditEncomendaDto input, CancellationToken cancellationToken = default);
    Task<(Encomenda? Encomenda, string? Erro)> AceitarAsync(int id, string? userId, CancellationToken cancellationToken = default);
    Task<(Encomenda? Encomenda, string? Erro)> RejeitarAsync(int id, string? motivo, CancellationToken cancellationToken = default);
    Task<object?> PrepararDataAsync(int id, IReadOnlyCollection<string> rolesDoUtilizador, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetPaiolIdsComAcessoAsync(IReadOnlyCollection<string> rolesDoUtilizador, CancellationToken cancellationToken = default);
    Task<(Encomenda? Encomenda, string? Erro)> ConcluirAsync(int id, CancellationToken cancellationToken = default);
}
