using Finalproj.Domain.Conformidade;

namespace Finalproj.Application.Features.Funcionarios.DTOs;

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
    /// <summary>N.º de credencial pirotécnica (CRED) para declarações PSP.</summary>
    public string? NumeroCredencial { get; set; }
    /// <summary>Validade da licença de operador pirotécnica.</summary>
    public DateTime? DataValidadeLicencaOperador { get; set; }
    /// <summary>Estado calculado da licença (ausente, incompleta, válida, a expirar, expirada).</summary>
    public string? EstadoLicencaOperador { get; set; }
    /// <summary>Validade do cartão de cidadão.</summary>
    public DateTime? DataValidadeCartaoCidadao { get; set; }
    /// <summary>Estado calculado do cartão de cidadão (ausente, incompleta, válida, a expirar, expirada).</summary>
    public string? EstadoCartaoCidadao { get; set; }
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

    /// <summary>False após eliminação lógica da ficha (histórico mantém o nome).</summary>
    public bool Disponivel { get; set; } = true;
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
            NumeroCredencial = f.NumeroCredencial,
            DataValidadeLicencaOperador = f.DataValidadeLicencaOperador,
            EstadoLicencaOperador = LicencaOperadorConformidade.CalcularEstado(
                !string.IsNullOrEmpty(f.LicencaOperadorCaminho),
                f.NumeroCredencial,
                f.DataValidadeLicencaOperador).ToString(),
            DataValidadeCartaoCidadao = f.DataValidadeCartaoCidadao,
            EstadoCartaoCidadao = CartaoCidadaoConformidade.CalcularEstado(
                !string.IsNullOrEmpty(f.CartaoCidadaoCaminho),
                f.NIF,
                f.Morada,
                f.DataValidadeCartaoCidadao).ToString(),
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
                .ToList(),
            Disponivel = f.EstaDisponivel
        };
    }
}
