namespace Finalproj.Application.Features.Servicos.DTOs;

/// <summary>Resumo de material (MLE, divisão dominante) alocado numa zona de lançamento.</summary>
public class ResumoMaterialZonaViewModel
{
    public int ZonaId { get; set; }
    public string? Designacao { get; set; }
    public int NumeroProdutos { get; set; }
    public decimal TotalUnidades { get; set; }
    public decimal MleTotalKg { get; set; }
    public string? DivisaoDominante { get; set; }
    public string? CorDivisaoDominante { get; set; }
    public string CategoriasPresentes { get; set; } = string.Empty;
}
