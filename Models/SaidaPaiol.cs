using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Saída de produto de um paiol; pode referenciar EncomendaId e EntradaPaiolId (FIFO)
public class SaidaPaiol
{
    public int Id { get; set; }

    public int PaiolId { get; set; }
    [Display(Name = "Paiol")]
    public Paiol Paiol { get; set; } = null!;

    public int ProdutoId { get; set; }
    [Display(Name = "Produto")]
    public Produto Produto { get; set; } = null!;

    [Range(0.0001, double.MaxValue, ErrorMessage = "A quantidade deve ser positiva.")]
    public decimal Quantidade { get; set; }

    [Display(Name = "Data de saída")]
    public DateTime DataSaida { get; set; } = DateTime.UtcNow;

    // Quem retirou (Identity)
    [StringLength(450)]
    [Display(Name = "Retirado por")]
    public string? FuncionarioRetirouUserId { get; set; }

    // Encomenda associada (quando a saída é da preparação)
    public int? EncomendaId { get; set; }

    // Entrada de origem (FIFO e rastreabilidade)
    public int? EntradaPaiolId { get; set; }
    public EntradaPaiol? EntradaPaiol { get; set; }
}
