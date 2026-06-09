using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Servico
{
    public int Id { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Selecione uma encomenda concluída.")]
    [Display(Name = "Encomenda")]
    public int EncomendaId { get; set; }
    public Encomenda Encomenda { get; set; } = null!;

    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    [StringLength(200)]
    [Display(Name = "Nome do evento")]
    public string? NomeEvento { get; set; }

    [Required(ErrorMessage = "A data do serviço é obrigatória.")]
    [Display(Name = "Data do serviço")]
    [DataType(DataType.Date)]
    public DateTime DataServico { get; set; }

    [StringLength(300)]
    [Display(Name = "Local")]
    public string? Local { get; set; }
    [StringLength(500)]
    [Display(Name = "Morada completa")]
    public string? MoradaCompleta { get; set; }
    [StringLength(100)]
    [Display(Name = "Distrito")]
    public string? Distrito { get; set; }
    [StringLength(100)]
    [Display(Name = "Cidade")]
    public string? Cidade { get; set; }
    [StringLength(100)]
    [Display(Name = "Concelho")]
    public string? Municipio { get; set; }

    [Display(Name = "Latitude")]
    public decimal? CoordenadasLat { get; set; }
    [Display(Name = "Longitude")]
    public decimal? CoordenadasLng { get; set; }

    [Display(Name = "Raio público (m)")]
    public int? RaioPublico { get; set; }

    [StringLength(20)]
    [Display(Name = "Público / Privado")]
    public string? PublicoPrivado { get; set; }

    [Display(Name = "Responsável técnico")]
    public int? ResponsavelTecnicoId { get; set; }
    public Funcionario? ResponsavelTecnico { get; set; }

    [Display(Name = "Coordenador pirotécnico")]
    public int? CoordenadorPirotecnicoId { get; set; }
    public Funcionario? CoordenadorPirotecnico { get; set; }

    [StringLength(2000)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }

    public ICollection<ServicoEquipa> Equipa { get; set; } = new List<ServicoEquipa>();
    public ICollection<ServicoDocumentoExtra> DocumentosExtras { get; set; } = new List<ServicoDocumentoExtra>();
    public ICollection<ServicoLicenca> Licencas { get; set; } = new List<ServicoLicenca>();
    public ICollection<ServicoDistanciaSeguranca> DistanciasSeguranca { get; set; } = new List<ServicoDistanciaSeguranca>();
    public ICollection<ServicoZonaLancamento> ZonasLancamento { get; set; } = new List<ServicoZonaLancamento>();
}
