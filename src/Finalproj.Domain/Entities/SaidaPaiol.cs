using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

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

    [StringLength(450)]
    [Display(Name = "Retirado por")]
    public string? FuncionarioRetirouUserId { get; set; }

    public int? EncomendaId { get; set; }

    public int? EntradaPaiolId { get; set; }
    public EntradaPaiol? EntradaPaiol { get; set; }
}
