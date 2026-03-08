using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Entrada de produto num paiol; usada para stock e FIFO (DataFabrico, DataEntrada, NumeroLote)
public class EntradaPaiol
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

    [Display(Name = "Data de entrada")]
    public DateTime DataEntrada { get; set; } = DateTime.UtcNow;

    // Quem registou (Identity)
    [StringLength(450)]
    [Display(Name = "Registado por")]
    public string? FuncionarioRegistouUserId { get; set; }

    // Lote para rastreabilidade e FIFO
    [StringLength(50)]
    [Display(Name = "N.º de lote")]
    public string? NumeroLote { get; set; }

    [Display(Name = "Data de fabrico")]
    [DataType(DataType.Date)]
    public DateTime? DataFabrico { get; set; }

    [Display(Name = "Data de validade")]
    [DataType(DataType.Date)]
    public DateTime? DataValidade { get; set; }
}
