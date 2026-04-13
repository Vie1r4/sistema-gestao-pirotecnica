namespace Finalproj.Models;

/// <summary>
/// Resposta da API para listagem de paióis: DTO do paiol + ocupação (evita expor entidade EF).
/// </summary>
public class PaiolComOcupacaoResponseDto
{
    public PaiolResponseDto Paiol { get; set; } = null!;
    public decimal MleAtual { get; set; }
    public decimal PercentagemOcupacao { get; set; }
}
