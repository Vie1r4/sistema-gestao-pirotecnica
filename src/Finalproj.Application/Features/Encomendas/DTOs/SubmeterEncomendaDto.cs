namespace Finalproj.Application.Features.Encomendas.DTOs;

/// <summary>
/// DTO para submeter encomenda a partir do rascunho (itens vêm da sessão).
/// </summary>
public class SubmeterEncomendaDto
{
    public int ClienteId { get; set; }
    public DateTime? DataEntrega { get; set; }
    public string? Observacoes { get; set; }
}
