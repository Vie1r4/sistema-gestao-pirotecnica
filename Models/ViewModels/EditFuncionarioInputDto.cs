namespace Finalproj.Models;

/// <summary>
/// DTO para o PUT Edit de funcionário (agrupa funcionário, ficheiros e opções de conta).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class EditFuncionarioInputDto
{
    public Funcionario Funcionario { get; set; } = new();
    public IFormFile? CartaoCidadaoFicheiro { get; set; }
    public IFormFile? DocumentoADDRFicheiro { get; set; }
    public IFormFile? LicencaOperadorFicheiro { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public List<int>? RemoverDocumentoExtraIds { get; set; }
    public bool RemoverOutrosAntigo { get; set; }
    public bool RemoverCartaoCidadao { get; set; }
    public bool RemoverDocumentoADDR { get; set; }
    public bool RemoverLicencaOperador { get; set; }
    public bool CriarConta { get; set; }
    public string? ContaEmail { get; set; }
    public string? ContaPassword { get; set; }
    public string? ContaConfirmPassword { get; set; }
    public string? ContaRole { get; set; }
}
