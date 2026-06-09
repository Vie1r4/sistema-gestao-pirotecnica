using Finalproj.Application.Common.Models;
using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Funcionarios.DTOs;

/// <summary>
/// Comando para criar funcionário (dados, ficheiros e opções de conta).
/// </summary>
public class CreateFuncionarioInputDto
{
    public Funcionario Funcionario { get; set; } = new();
    public UploadedFileContent? CartaoCidadaoFicheiro { get; set; }
    public UploadedFileContent? DocumentoADDRFicheiro { get; set; }
    public UploadedFileContent? LicencaOperadorFicheiro { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public bool CriarConta { get; set; }
    public string? ContaEmail { get; set; }
    public string? ContaPassword { get; set; }
    public string? ContaConfirmPassword { get; set; }
    public string? ContaRole { get; set; }
}
