using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Artigo do catálogo. NEM = kg de pólvora por unidade (ex.: 5 kg/caixa). FamiliaRisco e GrupoCompatibilidade para regras de paiol.
public class Produto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do produto é obrigatório.")]
    [StringLength(200)]
    [Display(Name = "Nome")]
    public string Nome { get; set; } = string.Empty;

    // Kg de pólvora por unidade — usado para MLE e lotação do paiol
    [Display(Name = "NEM por unidade (kg)")]
    [Range(0.0001, double.MaxValue, ErrorMessage = "O NEM por unidade deve ser positivo.")]
    public decimal NEMPorUnidade { get; set; }

    // 1.1G, 1.3G, 1.4G, 1.4S — tem de ser compatível com o perfil do paiol
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
    // B, C, D, G, S — matriz ADR para co-armazenamento
    [StringLength(5)]
    [Display(Name = "Grupo de compatibilidade")]
    public string? GrupoCompatibilidade { get; set; }
}
