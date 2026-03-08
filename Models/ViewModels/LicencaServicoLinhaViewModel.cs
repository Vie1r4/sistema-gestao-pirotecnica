namespace Finalproj.Models;

/// <summary>
/// Uma linha da secção "Licenças do evento" na vista Details do serviço.
/// </summary>
public class LicencaServicoLinhaViewModel
{
    public TipoLicencaServico Tipo { get; set; }
    public string Nome => ConstantesServicoLicenca.Nome(Tipo);
    public string? Tooltip => ConstantesServicoLicenca.Tooltip(Tipo);
    public bool Obrigatorio { get; set; }
    /// <summary> Estado: 0 = em falta, 1 = tem número mas sem ficheiro, 2 = completo (tem ficheiro). </summary>
    public int Estado { get; set; }
    public ServicoLicenca? Licenca { get; set; }
}
