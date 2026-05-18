using Finalproj.Application.Features.Produtos.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Produtos.Services;

public sealed class ProdutoApplicationService(IProdutoRepository produtos, IUnitOfWork unitOfWork) : IProdutoApplicationService
{
    public Task<IReadOnlyList<Produto>> SearchAsync(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default) =>
        produtos.SearchAsync(pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);

    public Task<Produto?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        produtos.GetByIdAsync(id, cancellationToken);

    public async Task<Produto> CreateAsync(Produto produto, CancellationToken cancellationToken = default)
    {
        await produtos.AddAsync(produto, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return produto;
    }

    public async Task<Produto?> UpdateAsync(int id, Produto produto, CancellationToken cancellationToken = default)
    {
        if (id != produto.Id || !await produtos.ExistsAsync(id, cancellationToken))
            return null;
        await produtos.UpdateAsync(produto, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return produto;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var produto = await produtos.FindTrackedByIdAsync(id, cancellationToken);
        if (produto == null)
            return false;
        await produtos.DeleteAsync(produto, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
