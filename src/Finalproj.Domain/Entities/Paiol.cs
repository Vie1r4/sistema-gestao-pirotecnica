using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Paiol
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do paiol é obrigatório.")]
    [StringLength(200)]
    [Display(Name = "Nome")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(500)]
    [Display(Name = "Localização")]
    public string? Localizacao { get; set; }

    [Display(Name = "Latitude")]
    public decimal? CoordenadasLat { get; set; }

    [Display(Name = "Longitude")]
    public decimal? CoordenadasLng { get; set; }

    [Display(Name = "Teto de Segurança NEM (kg)")]
    [Range(0.01, double.MaxValue, ErrorMessage = "O limite deve ser um valor positivo.")]
    public decimal LimiteMLE { get; set; }

    [Required(ErrorMessage = "O perfil de risco é obrigatório.")]
    [StringLength(10)]
    [Display(Name = "Perfil de Risco")]
    public string PerfilRisco { get; set; } = string.Empty;

    [Required(ErrorMessage = "O estado é obrigatório.")]
    [StringLength(20)]
    [Display(Name = "Estado")]
    public string Estado { get; set; } = ConstantesPaiol.EstadoAtivo;

    [DataType(DataType.Date)]
    [Display(Name = "Validade da licença")]
    public DateTime? DataValidadeLicenca { get; set; }

    [StringLength(50)]
    [Display(Name = "N.º licença")]
    public string? NumeroLicenca { get; set; }

    [StringLength(10)]
    public string? DivisaoDominante { get; set; }

    [Display(Name = "Data de registo")]
    public DateTime? DataRegisto { get; set; }

    public ICollection<PaiolDocumentoExtra> DocumentosExtras { get; set; } = new List<PaiolDocumentoExtra>();
}
