using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Produto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do produto é obrigatório.")]
    [StringLength(200)]
    [Display(Name = "Nome")]
    public string Nome { get; set; } = string.Empty;

    [Display(Name = "NEM por unidade (kg)")]
    [Range(0.0001, double.MaxValue, ErrorMessage = "O NEM por unidade deve ser positivo.")]
    public decimal NEMPorUnidade { get; set; }

    [Required(ErrorMessage = "A classificação de risco é obrigatória.")]
    [StringLength(10)]
    [Display(Name = "Classificação de Risco")]
    public string FamiliaRisco { get; set; } = string.Empty;

    [StringLength(50)]
    [Display(Name = "Unidade")]
    public string? Unidade { get; set; }
    [StringLength(30)]
    [Display(Name = "Filtro técnico")]
    public string? FiltroTecnico { get; set; }
    [StringLength(30)]
    [Display(Name = "Calibre")]
    public string? Calibre { get; set; }

    [StringLength(5)]
    [Display(Name = "Grupo de compatibilidade")]
    public string? GrupoCompatibilidade { get; set; }
}
