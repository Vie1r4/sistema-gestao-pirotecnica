using Finalproj.Application.Features.Produtos.DTOs;
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
        produto.DataRegisto ??= DateTime.UtcNow;
        await produtos.AddAsync(produto, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return produto;
    }

    public async Task<Produto?> UpdateAsync(int id, UpdateProdutoRequestDto request, CancellationToken cancellationToken = default)
    {
        if (id != request.Id || !await produtos.ExistsAsync(id, cancellationToken))
            return null;
        var existente = await produtos.FindTrackedByIdAsync(id, cancellationToken);
        if (existente == null)
            return null;
        existente.Nome = request.Nome;
        existente.NEMPorUnidade = request.NEMPorUnidade;
        existente.FamiliaRisco = request.FamiliaRisco;
        existente.Unidade = request.Unidade;
        existente.FiltroTecnico = request.FiltroTecnico;
        existente.Calibre = request.Calibre;
        existente.Categoria = request.Categoria;
        existente.GrupoCompatibilidade = request.GrupoCompatibilidade;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return existente;
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
