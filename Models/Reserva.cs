using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Reserva de quantidade de um produto para uma encomenda (Pendente/Aceite/Em preparação); reduz stock disponível até rejeitar ou concluir
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
