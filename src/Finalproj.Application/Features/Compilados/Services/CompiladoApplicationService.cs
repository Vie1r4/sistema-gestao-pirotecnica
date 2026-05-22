using Finalproj.Application.Features.Compilados.DTOs;
using Finalproj.Application.Features.Compilados.Interfaces;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Compilados.Services;

public sealed class CompiladoApplicationService(
    ICompiladoRepository compilados,
    IProdutoRepository produtos,
    IUnitOfWork unitOfWork) : ICompiladoApplicationService
{
    public async Task<IReadOnlyList<CompiladoResponseDto>> ListAsync(CancellationToken cancellationToken = default)
    {
        var lista = await compilados.ListAllWithItensProdutoAsync(cancellationToken);
        return lista.Select(CompiladoResponseDtoMapping.Map).ToList();
    }

    public async Task<CompiladoResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var c = await compilados.GetByIdWithItensProdutoAsync(id, cancellationToken);
        return c == null ? null : CompiladoResponseDtoMapping.Map(c);
    }

    public async Task<(CompiladoResponseDto? Result, string? Error)> CreateAsync(SaveCompiladoDto input, CancellationToken cancellationToken = default)
    {
        var erro = await ValidarInputAsync(input, cancellationToken);
        if (erro != null)
            return (null, erro);

        var entity = new Compilado
        {
            Nome = input.Nome.Trim(),
            Itens = input.Itens.Select(i => new CompiladoItem
            {
                ProdutoId = i.ProdutoId,
                QuantidadePorUnidade = i.QuantidadePorUnidade
            }).ToList()
        };
        await compilados.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var criado = await compilados.GetByIdWithItensProdutoAsync(entity.Id, cancellationToken);
        return (criado == null ? null : CompiladoResponseDtoMapping.Map(criado), null);
    }

    public async Task<(CompiladoResponseDto? Result, string? Error)> UpdateAsync(int id, SaveCompiladoDto input, CancellationToken cancellationToken = default)
    {
        var entity = await compilados.FindTrackedByIdWithItensAsync(id, cancellationToken);
        if (entity == null)
            return (null, null);

        var erro = await ValidarInputAsync(input, cancellationToken);
        if (erro != null)
            return (null, erro);

        entity.Nome = input.Nome.Trim();
        entity.Itens.Clear();
        foreach (var i in input.Itens)
        {
            entity.Itens.Add(new CompiladoItem
            {
                CompiladoId = id,
                ProdutoId = i.ProdutoId,
                QuantidadePorUnidade = i.QuantidadePorUnidade
            });
        }
        await compilados.UpdateAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var atualizado = await compilados.GetByIdWithItensProdutoAsync(id, cancellationToken);
        return (atualizado == null ? null : CompiladoResponseDtoMapping.Map(atualizado), null);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await compilados.FindTrackedByIdWithItensAsync(id, cancellationToken);
        if (entity == null)
            return false;
        await compilados.DeleteAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<(IReadOnlyDictionary<int, decimal> Expansao, string? Error)> ExpandirAsync(
        int compiladoId,
        decimal quantidadeCompilado,
        CancellationToken cancellationToken = default)
    {
        if (quantidadeCompilado <= 0)
            return (new Dictionary<int, decimal>(), "A quantidade deve ser positiva.");

        var c = await compilados.GetByIdWithItensProdutoAsync(compiladoId, cancellationToken);
        if (c == null)
            return (new Dictionary<int, decimal>(), "Compilado não encontrado.");
        if (c.Itens.Count == 0)
            return (new Dictionary<int, decimal>(), "O compilado não tem produtos definidos.");

        var expansao = new Dictionary<int, decimal>();
        foreach (var item in c.Itens)
        {
            var q = quantidadeCompilado * item.QuantidadePorUnidade;
            expansao[item.ProdutoId] = expansao.GetValueOrDefault(item.ProdutoId) + q;
        }
        return (expansao, null);
    }

    private async Task<string?> ValidarInputAsync(SaveCompiladoDto input, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input.Nome))
            return "O nome do compilado é obrigatório.";
        if (input.Nome.Trim().Length > 200)
            return "O nome não pode exceder 200 caracteres.";
        if (input.Itens == null || input.Itens.Count == 0)
            return "Adicione pelo menos um produto ao compilado.";

        var produtoIds = new HashSet<int>();
        foreach (var item in input.Itens)
        {
            if (item.QuantidadePorUnidade <= 0)
                return "Todas as quantidades por unidade devem ser positivas.";
            if (!produtoIds.Add(item.ProdutoId))
                return "Não pode repetir o mesmo produto no compilado.";
            if (!await produtos.ExistsAsync(item.ProdutoId, cancellationToken))
                return $"Produto com id {item.ProdutoId} não encontrado.";
        }
        return null;
    }
}
