using System.ComponentModel.DataAnnotations;

namespace Finalproj.Application.Features.Encomendas.DTOs;

/// <summary>
/// DTO para atualizar uma encomenda existente (data entrega, observações e itens).
/// Apenas permitido quando estado é Pendente ou Aceite.
/// </summary>
public class EditEncomendaDto
{
    [DataType(DataType.Date)]
    public DateTime? DataEntrega { get; set; }

    [StringLength(2000)]
    public string? Observacoes { get; set; }

    public List<EditEncomendaItemDto> Itens { get; set; } = new();
}

public class EditEncomendaItemDto
{
    public int ProdutoId { get; set; }

    [Range(0.0001, double.MaxValue, ErrorMessage = "A quantidade deve ser positiva.")]
    public decimal Quantidade { get; set; }
}
