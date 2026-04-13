namespace Finalproj.Models;

/// <summary>
/// DTO de resposta para Funcionário. Nunca inclui caminhos de ficheiros no servidor.
/// NSS e IBAN só são preenchidos quando <see cref="IncluirDadosSensiveis"/> é true (ex.: formulário de edição).
/// </summary>
public class FuncionarioResponseDto
{
    public int Id { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string? NIF { get; set; }
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public string? Morada { get; set; }
    public string? Cargo { get; set; }
    public string? Notas { get; set; }
    public string? UserId { get; set; }
    public DateTime? DataRegisto { get; set; }

    /// <summary>True se existe conta Identity associada (sem expor o UserId nas listagens).</summary>
    public bool ContaAssociada { get; set; }

    /// <summary>Email da conta confirmado; null se não aplicável ou desconhecido.</summary>
    public bool? ContaEmailConfirmada { get; set; }

    /// <summary>N.º Segurança Social — apenas quando necessário para o formulário de edição.</summary>
    public string? NumeroSegurancaSocial { get; set; }
    /// <summary>IBAN — apenas quando necessário para o formulário de edição.</summary>
    public string? IBAN { get; set; }

    // Indicadores de existência de documento (nunca o path)
    public bool HasCartaoCidadao { get; set; }
    public bool HasDocumentoADR { get; set; }
    public bool HasLicencaOperador { get; set; }
    public bool HasOutros { get; set; }

    /// <summary>Documentos extras: apenas Id e Nome (sem caminho).</summary>
    public List<FuncionarioDocumentoExtraDto> DocumentosExtras { get; set; } = new();
}

public class FuncionarioDocumentoExtraDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

public static class FuncionarioResponseDtoMapping
{
    public static FuncionarioResponseDto Map(Funcionario f, bool includeSensitive, bool? contaEmailConfirmada = null)
    {
        return new FuncionarioResponseDto
        {
            Id = f.Id,
            NomeCompleto = f.NomeCompleto,
            NIF = f.NIF,
            Email = f.Email,
            Telefone = f.Telefone,
            Morada = f.Morada,
            Cargo = f.Cargo,
            Notas = f.Notas,
            ContaAssociada = !string.IsNullOrEmpty(f.UserId),
            ContaEmailConfirmada = contaEmailConfirmada,
            UserId = includeSensitive ? f.UserId : null,
            DataRegisto = f.DataRegisto,
            NumeroSegurancaSocial = includeSensitive ? f.NumeroSegurancaSocial : null,
            IBAN = includeSensitive ? f.IBAN : null,
            HasCartaoCidadao = !string.IsNullOrEmpty(f.CartaoCidadaoCaminho),
            HasDocumentoADR = !string.IsNullOrEmpty(f.DocumentoADDRCaminho),
            HasLicencaOperador = !string.IsNullOrEmpty(f.LicencaOperadorCaminho),
            HasOutros = !string.IsNullOrEmpty(f.OutrosCaminho),
            DocumentosExtras = (f.DocumentosExtras ?? new List<FuncionarioDocumentoExtra>())
                .Select(e => new FuncionarioDocumentoExtraDto { Id = e.Id, Nome = e.Nome })
                .ToList()
        };
    }
}
