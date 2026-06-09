using System.ComponentModel.DataAnnotations;

namespace Finalproj.Application.Features.Produtos.DTOs;

/// <summary>
/// Payload de atualização de produto (PUT). Campos editáveis apenas; <see cref="ProdutoResponseDto.DataRegisto"/> é read-only.
/// </summary>
public class UpdateProdutoRequestDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do produto é obrigatório.")]
    [StringLength(200)]
    public string Nome { get; set; } = string.Empty;

    [Range(0.0001, double.MaxValue, ErrorMessage = "O NEM por unidade deve ser positivo.")]
    public decimal NEMPorUnidade { get; set; }

    [Required(ErrorMessage = "A classificação de risco é obrigatória.")]
    [StringLength(10)]
    public string FamiliaRisco { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Unidade { get; set; }

    [Required(ErrorMessage = "O filtro técnico é obrigatório.")]
    [StringLength(30)]
    public string? FiltroTecnico { get; set; }

    [Required(ErrorMessage = "O calibre é obrigatório.")]
    [StringLength(30)]
    public string? Calibre { get; set; }

    [Required(ErrorMessage = "A categoria pirotécnica é obrigatória.")]
    [StringLength(20)]
    public string? Categoria { get; set; }

    [Required(ErrorMessage = "O grupo de compatibilidade é obrigatório.")]
    [StringLength(5)]
    public string? GrupoCompatibilidade { get; set; }
}

public static class UpdateProdutoRequestDtoMapping
{
    public static ProdutoResponseDto ToResponseDto(UpdateProdutoRequestDto request) =>
        new()
        {
            Id = request.Id,
            Nome = request.Nome,
            NEMPorUnidade = request.NEMPorUnidade,
            FamiliaRisco = request.FamiliaRisco,
            Unidade = request.Unidade,
            FiltroTecnico = request.FiltroTecnico,
            Calibre = request.Calibre,
            Categoria = request.Categoria,
            GrupoCompatibilidade = request.GrupoCompatibilidade,
        };
}
