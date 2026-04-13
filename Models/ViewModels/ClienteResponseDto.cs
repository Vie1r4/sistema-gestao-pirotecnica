namespace Finalproj.Models;

/// <summary>
/// DTO de resposta para Cliente. Nunca inclui caminhos de ficheiros no servidor.
/// NIF e Morada só são preenchidos quando necessário para o formulário de edição.
/// </summary>
public class ClienteResponseDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string TipoCliente { get; set; } = "Particular";
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Localidade { get; set; }
    public string? Notas { get; set; }
    public DateTime? DataRegisto { get; set; }
    /// <summary>Id da conta Identity — apenas em respostas com <c>includeSensitive: true</c> (edição).</summary>
    public string? UserId { get; set; }

    /// <summary>NIF — apenas quando necessário para o formulário de edição.</summary>
    public string? NIF { get; set; }
    /// <summary>Morada — apenas quando necessário para o formulário de edição.</summary>
    public string? Morada { get; set; }

    /// <summary>Documentos extras: apenas Id e Nome (sem caminho).</summary>
    public List<ClienteDocumentoExtraDto> DocumentosExtras { get; set; } = new();
}

public class ClienteDocumentoExtraDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

public static class ClienteResponseDtoMapping
{
    public static ClienteResponseDto Map(Cliente c, bool includeSensitive)
    {
        return new ClienteResponseDto
        {
            Id = c.Id,
            Nome = c.Nome,
            TipoCliente = c.TipoCliente ?? "Particular",
            Email = c.Email,
            Telefone = c.Telefone,
            CodigoPostal = c.CodigoPostal,
            Localidade = c.Localidade,
            Notas = c.Notas,
            DataRegisto = c.DataRegisto,
            UserId = includeSensitive ? c.UserId : null,
            NIF = includeSensitive ? c.NIF : null,
            Morada = includeSensitive ? c.Morada : null,
            DocumentosExtras = (c.DocumentosExtras ?? new List<ClienteDocumentoExtra>())
                .Select(e => new ClienteDocumentoExtraDto { Id = e.Id, Nome = e.Nome })
                .ToList()
        };
    }
}
