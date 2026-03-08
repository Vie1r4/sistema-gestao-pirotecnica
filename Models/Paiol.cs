using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models
{
    // Armazém de explosivos: limite MLE (kg), perfil de risco, estado (activo/manutenção), licença PSP
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

        // Teto de segurança em kg NEM (não exceder)
        [Display(Name = "Teto de Segurança NEM (kg)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O limite deve ser um valor positivo.")]
        public decimal LimiteMLE { get; set; }

        // Perfil de risco (ex.: 1.3G) – material compatível
        [Required(ErrorMessage = "O perfil de risco é obrigatório.")]
        [StringLength(10)]
        [Display(Name = "Perfil de Risco")]
        public string PerfilRisco { get; set; } = string.Empty;

        // Activo = pode receber; Em manutenção = bloqueado
        [Required(ErrorMessage = "O estado é obrigatório.")]
        [StringLength(20)]
        [Display(Name = "Estado")]
        public string Estado { get; set; } = ConstantesPaiol.EstadoAtivo;

        // Se expirada, bloqueia entradas (regra do motor)
        [DataType(DataType.Date)]
        [Display(Name = "Validade da licença")]
        public DateTime? DataValidadeLicenca { get; set; }

        [StringLength(50)]
        [Display(Name = "N.º licença")]
        public string? NumeroLicenca { get; set; }

        // Divisão mais perigosa no paiol (actualizada pelo motor de validação)
        [StringLength(10)]
        public string? DivisaoDominante { get; set; }

        // Documentos extra (licenças, plantas) com nome à escolha
        public ICollection<PaiolDocumentoExtra> DocumentosExtras { get; set; } = new List<PaiolDocumentoExtra>();
    }
}
