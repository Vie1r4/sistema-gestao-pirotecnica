using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Linha da encomenda: produto + quantidade pedida
public class EncomendaItem
{
    public int Id { get; set; }

    public int EncomendaId { get; set; }
    public Encomenda Encomenda { get; set; } = null!;

    public int ProdutoId { get; set; }
    public Produto Produto { get; set; } = null!;

    [Range(0.0001, double.MaxValue, ErrorMessage = "A quantidade deve ser positiva.")]
    [Display(Name = "Quantidade pedida")]
    public decimal QuantidadePedida { get; set; }
}
