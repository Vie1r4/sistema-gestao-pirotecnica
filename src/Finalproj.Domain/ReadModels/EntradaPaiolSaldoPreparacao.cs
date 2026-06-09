namespace Finalproj.Domain.ReadModels;

/// <summary>
/// Entrada de paiol com saldo restante (após saídas ligadas por EntradaPaiolId), para alocação FIFO.
/// </summary>
public sealed class EntradaPaiolSaldoPreparacao
{
    public int Id { get; init; }
    public int PaiolId { get; init; }
    public int ProdutoId { get; init; }
    public decimal QuantidadeRestante { get; set; }
    public DateTime DataEntrada { get; init; }
    public DateTime? DataFabrico { get; init; }
    public string? NumeroLote { get; init; }
    public string? PaiolNome { get; init; }
}
