using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Reserva
{
    public int Id { get; set; }

    public int EncomendaId { get; set; }
    public Encomenda Encomenda { get; set; } = null!;

    public int ProdutoId { get; set; }
    public Produto Produto { get; set; } = null!;

    [Range(0.0001, double.MaxValue)]
    public decimal Quantidade { get; set; }
}
