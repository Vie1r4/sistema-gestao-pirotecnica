using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

/// <summary>
/// Linha de lançamento de uma zona: data, intervalo horário, produto e quantidade.
/// Alimenta a tabela de horário da declaração PSP e a contagem de material por zona.
/// </summary>
public class ServicoZonaLinha
{
    public int Id { get; set; }

    public int ZonaId { get; set; }
    public ServicoZonaLancamento Zona { get; set; } = null!;

    [Display(Name = "Data")]
    [DataType(DataType.Date)]
    public DateTime Data { get; set; }

    [Display(Name = "Hora de início")]
    public TimeSpan? HoraInicio { get; set; }

    [Display(Name = "Hora de fim")]
    public TimeSpan? HoraFim { get; set; }

    public int ProdutoId { get; set; }
    public Produto Produto { get; set; } = null!;

    [Range(0.0001, double.MaxValue, ErrorMessage = "A quantidade deve ser positiva.")]
    [Display(Name = "Quantidade")]
    public decimal Quantidade { get; set; }
}
