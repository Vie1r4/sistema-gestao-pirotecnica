using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Licença do evento (PSP, LER, Seguro RC, etc.); número, datas e ficheiro
public class ServicoLicenca
{
    public int Id { get; set; }

    public int ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    [Required(ErrorMessage = "O tipo de licença é obrigatório.")]
    public TipoLicencaServico TipoLicenca { get; set; }

    [StringLength(200)]
    [Display(Name = "Nome personalizado")]
    public string? NomePersonalizado { get; set; }

    [StringLength(100)]
    [Display(Name = "N.º documento")]
    public string? NumeroDocumento { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "Data de emissão")]
    public DateTime? DataEmissao { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "Data de validade")]
    public DateTime? DataValidade { get; set; }

    [StringLength(500)]
    public string? FicheiroPath { get; set; }

    [StringLength(500)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }
}
