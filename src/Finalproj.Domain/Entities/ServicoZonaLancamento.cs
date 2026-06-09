using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

/// <summary>
/// Zona/ponto de lançamento de um serviço (evento). Cada zona tem as suas coordenadas,
/// responsável pirotécnico, linhas de lançamento (data/hora/produto/quantidade) e
/// distâncias de segurança calculadas a partir do seu ponto.
/// </summary>
public class ServicoZonaLancamento
{
    public int Id { get; set; }

    public int ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    [StringLength(200)]
    [Display(Name = "Designação da zona")]
    public string? Designacao { get; set; }

    [Display(Name = "Latitude")]
    public decimal? CoordenadasLat { get; set; }
    [Display(Name = "Longitude")]
    public decimal? CoordenadasLng { get; set; }

    [Display(Name = "Raio público (m)")]
    public int? RaioPublico { get; set; }

    [Display(Name = "Responsável pirotécnico")]
    public int? ResponsavelPirotecnicoId { get; set; }
    public Funcionario? ResponsavelPirotecnico { get; set; }

    [StringLength(500)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }

    public ICollection<ServicoZonaLinha> Linhas { get; set; } = new List<ServicoZonaLinha>();
    public ICollection<ServicoZonaDistanciaSeguranca> DistanciasSeguranca { get; set; } = new List<ServicoZonaDistanciaSeguranca>();
}
