namespace Finalproj.Models;

/// <summary>
/// DTO de resposta para listagem de encomendas (evita expor entidade EF e overfetch).
/// </summary>
public class EncomendaListResponseDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public DateTime? DataEntrega { get; set; }
    public DateTime? DataConclusao { get; set; }
    public string? Observacoes { get; set; }
    public string? MotivoRejeicao { get; set; }
    public string? FuncionarioAceiteUserId { get; set; }
    public string? FuncionarioPreparouUserId { get; set; }
    /// <summary>Resumo do cliente (apenas id e nome) para listagem.</summary>
    public EncomendaClienteResumoDto? Cliente { get; set; }
}

public class EncomendaClienteResumoDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

/// <summary>
/// DTO de resposta para detalhe de encomenda (inclui itens e cliente).
/// </summary>
public class EncomendaDetailResponseDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public DateTime? DataEntrega { get; set; }
    public DateTime? DataConclusao { get; set; }
    public string? Observacoes { get; set; }
    public string? MotivoRejeicao { get; set; }
    public string? FuncionarioAceiteUserId { get; set; }
    public string? FuncionarioPreparouUserId { get; set; }
    public ClienteResponseDto? Cliente { get; set; }
    public List<EncomendaItemResponseDto> Itens { get; set; } = new();
}

/// <summary>
/// DTO de resposta para item de encomenda (com resumo do produto).
/// </summary>
public class EncomendaItemResponseDto
{
    public int Id { get; set; }
    public int EncomendaId { get; set; }
    public int ProdutoId { get; set; }
    public decimal QuantidadePedida { get; set; }
    public ProdutoResponseDto? Produto { get; set; }
}

/// <summary>
/// DTO resumo de encomenda para listas (ex.: encomendas ativas/histórico no detalhe do cliente).
/// </summary>
public class EncomendaResumoDto
{
    public int Id { get; set; }
    public string? Estado { get; set; }
    public DateTime? DataCriacao { get; set; }
    public DateTime? DataConclusao { get; set; }
}

public static class EncomendaResponseDtoMapping
{
    public static EncomendaListResponseDto MapToList(Encomenda e)
    {
        return new EncomendaListResponseDto
        {
            Id = e.Id,
            ClienteId = e.ClienteId,
            Estado = e.Estado,
            DataCriacao = e.DataCriacao,
            DataEntrega = e.DataEntrega,
            DataConclusao = e.DataConclusao,
            Observacoes = e.Observacoes,
            MotivoRejeicao = e.MotivoRejeicao,
            FuncionarioAceiteUserId = e.FuncionarioAceiteUserId,
            FuncionarioPreparouUserId = e.FuncionarioPreparouUserId,
            Cliente = e.Cliente != null ? new EncomendaClienteResumoDto { Id = e.Cliente.Id, Nome = e.Cliente.Nome } : null
        };
    }

    public static EncomendaDetailResponseDto MapToDetail(Encomenda e)
    {
        return new EncomendaDetailResponseDto
        {
            Id = e.Id,
            ClienteId = e.ClienteId,
            Estado = e.Estado,
            DataCriacao = e.DataCriacao,
            DataEntrega = e.DataEntrega,
            DataConclusao = e.DataConclusao,
            Observacoes = e.Observacoes,
            MotivoRejeicao = e.MotivoRejeicao,
            FuncionarioAceiteUserId = e.FuncionarioAceiteUserId,
            FuncionarioPreparouUserId = e.FuncionarioPreparouUserId,
            Cliente = e.Cliente != null ? ClienteResponseDtoMapping.Map(e.Cliente, false) : null,
            Itens = (e.Itens ?? new List<EncomendaItem>())
                .Select(i => new EncomendaItemResponseDto
                {
                    Id = i.Id,
                    EncomendaId = i.EncomendaId,
                    ProdutoId = i.ProdutoId,
                    QuantidadePedida = i.QuantidadePedida,
                    Produto = i.Produto != null ? ProdutoResponseDtoMapping.Map(i.Produto) : null
                })
                .ToList()
        };
    }

    public static EncomendaResumoDto MapToResumo(Encomenda e)
    {
        return new EncomendaResumoDto
        {
            Id = e.Id,
            Estado = e.Estado,
            DataCriacao = e.DataCriacao,
            DataConclusao = e.DataConclusao
        };
    }
}
