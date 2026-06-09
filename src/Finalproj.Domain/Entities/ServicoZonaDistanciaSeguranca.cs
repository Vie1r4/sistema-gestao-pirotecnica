using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

/// <summary>
/// Distância de segurança de uma zona de lançamento, medida a partir do ponto de queima dessa zona.
/// </summary>
public class ServicoZonaDistanciaSeguranca
{
    public int Id { get; set; }

    public int ZonaId { get; set; }
    public ServicoZonaLancamento Zona { get; set; } = null!;

    public TipoReferenciaDistancia TipoReferencia { get; set; }

    [StringLength(200)]
    [Display(Name = "Descrição da referência")]
    public string? DescricaoReferencia { get; set; }

    [Display(Name = "Distância mínima (m)")]
    public int DistanciaMinima_m { get; set; }

    [Display(Name = "Distância medida (m)")]
    public int? DistanciaMedida_m { get; set; }

    [StringLength(500)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }

    public bool Cumpre => DistanciaMedida_m.HasValue && DistanciaMedida_m.Value >= DistanciaMinima_m;
}
