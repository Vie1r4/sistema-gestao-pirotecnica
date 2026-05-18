namespace Finalproj.Application.Features.Produtos.Interfaces;

public interface IProdutoApplicationService
{
    Task<IReadOnlyList<Produto>> SearchAsync(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default);
    Task<Produto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Produto> CreateAsync(Produto produto, CancellationToken cancellationToken = default);
    Task<Produto?> UpdateAsync(int id, Produto produto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
