namespace Finalproj.Application.Features.Servicos.DTOs;

/// <summary>
/// Resumo do material da encomenda associada ao serviço, para exibir na vista Details sem abrir a encomenda.
/// </summary>
public class ResumoMaterialServicoViewModel
{
    public int EncomendaId { get; set; }
    public int NumeroProdutos { get; set; }
    public decimal TotalUnidades { get; set; }
    /// <summary> Peso bruto total (kg). Null se o catálogo não tiver peso por unidade. </summary>
    public decimal? PesoBrutoKg { get; set; }
    public decimal MleTotalKg { get; set; }
    /// <summary> Divisão de risco mais perigosa presente (ex: 1.1G, 1.3G, 1.4G, 1.4S). </summary>
    public string? DivisaoDominante { get; set; }
    /// <summary> Classe CSS para o badge da divisão dominante (success, warning, etc.). </summary>
    public string? CorDivisaoDominante { get; set; }
    /// <summary> Categorias ADR únicas presentes (ex: "1.3G · 1.4G · 1.4S"). </summary>
    public string CategoriasPresentes { get; set; } = string.Empty;
    public bool TemItens { get; set; }
}
