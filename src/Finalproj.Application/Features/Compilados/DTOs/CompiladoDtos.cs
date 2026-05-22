using Finalproj.Domain.Entities;

namespace Finalproj.Application.Features.Compilados.DTOs;

public sealed class CompiladoItemResponseDto
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public string ProdutoNome { get; set; } = string.Empty;
    public decimal QuantidadePorUnidade { get; set; }
}

public sealed class CompiladoResponseDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public List<CompiladoItemResponseDto> Itens { get; set; } = new();
}

public sealed class CompiladoItemInputDto
{
    public int ProdutoId { get; set; }
    public decimal QuantidadePorUnidade { get; set; }
}

public sealed class SaveCompiladoDto
{
    public string Nome { get; set; } = string.Empty;
    public List<CompiladoItemInputDto> Itens { get; set; } = new();
}

public static class CompiladoResponseDtoMapping
{
    public static CompiladoResponseDto Map(Compilado c) => new()
    {
        Id = c.Id,
        Nome = c.Nome,
        Itens = c.Itens.Select(i => new CompiladoItemResponseDto
        {
            Id = i.Id,
            ProdutoId = i.ProdutoId,
            ProdutoNome = i.Produto?.Nome ?? string.Empty,
            QuantidadePorUnidade = i.QuantidadePorUnidade
        }).ToList()
    };
}
