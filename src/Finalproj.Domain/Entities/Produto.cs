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
    [Required(ErrorMessage = "O filtro técnico é obrigatório.")]
    [StringLength(30)]
    [Display(Name = "Filtro técnico")]
    public string? FiltroTecnico { get; set; }

    [Required(ErrorMessage = "O calibre é obrigatório.")]
    [StringLength(30)]
    [Display(Name = "Calibre")]
    public string? Calibre { get; set; }

    [Required(ErrorMessage = "A categoria pirotécnica é obrigatória.")]
    [StringLength(20)]
    [Display(Name = "Categoria")]
    public string? Categoria { get; set; }

    [Required(ErrorMessage = "O grupo de compatibilidade é obrigatório.")]
    [StringLength(5)]
    [Display(Name = "Grupo de compatibilidade")]
    public string? GrupoCompatibilidade { get; set; }

    [Required(ErrorMessage = "A distância de segurança ao público é obrigatória.")]
    [Display(Name = "Distância de segurança ao público (m)")]
    [Range(1, 100_000, ErrorMessage = "A distância de segurança ao público deve ser entre 1 e 100000 metros.")]
    public int DistanciaSegurancaPublico_m { get; set; }

    [Display(Name = "Data de registo")]
    [DataType(DataType.DateTime)]
    public DateTime? DataRegisto { get; set; }
}
