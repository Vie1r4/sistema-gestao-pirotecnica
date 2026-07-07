using Finalproj.Application.Common.Models;
using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Funcionarios.DTOs;

/// <summary>
/// Comando para editar funcionário (dados, ficheiros e opções de conta).
/// </summary>
public class EditFuncionarioInputDto
{
    public Funcionario Funcionario { get; set; } = new();
    public UploadedFileContent? CartaoCidadaoFicheiro { get; set; }
    public UploadedFileContent? DocumentoADDRFicheiro { get; set; }
    public UploadedFileContent? LicencaOperadorFicheiro { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public List<int>? RemoverDocumentoExtraIds { get; set; }
    public bool RemoverOutrosAntigo { get; set; }
    public bool RemoverCartaoCidadao { get; set; }
    public bool RemoverDocumentoADDR { get; set; }
    public bool RemoverLicencaOperador { get; set; }
    /// <summary>True quando o formulário regista cartão de cidadão (NIF + morada + validade + documento obrigatórios).</summary>
    public bool RegistarCartaoCidadao { get; set; }
    /// <summary>True quando o formulário regista licença de operador (CRED + validade + documento obrigatórios).</summary>
    public bool RegistarLicencaOperador { get; set; }
    public bool CriarConta { get; set; }
    public string? ContaEmail { get; set; }
    public string? ContaPassword { get; set; }
    public string? ContaConfirmPassword { get; set; }
    public string? ContaRole { get; set; }
}
