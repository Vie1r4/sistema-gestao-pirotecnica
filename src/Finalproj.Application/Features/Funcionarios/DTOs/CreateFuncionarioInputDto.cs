using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Funcionarios.DTOs;

/// <summary>
/// DTO para o POST Create de funcionário (agrupa funcionário, ficheiros e opções de conta).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class CreateFuncionarioInputDto
{
    public Funcionario Funcionario { get; set; } = new();
    public IFormFile? CartaoCidadaoFicheiro { get; set; }
    public IFormFile? DocumentoADDRFicheiro { get; set; }
    public IFormFile? LicencaOperadorFicheiro { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public bool CriarConta { get; set; }
    public string? ContaEmail { get; set; }
    public string? ContaPassword { get; set; }
    public string? ContaConfirmPassword { get; set; }
    public string? ContaRole { get; set; }
}
