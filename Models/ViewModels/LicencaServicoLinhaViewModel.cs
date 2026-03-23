namespace Finalproj.Models;

/// <summary>
/// Uma linha da secção "Licenças do evento" na vista Details do serviço.
/// </summary>
public class LicencaServicoLinhaViewModel
{
    public TipoLicencaServico Tipo { get; set; }
    public string Nome => ConstantesServicoLicenca.Nome(Tipo);
    /// <summary>Para OUTRO usa NomePersonalizado da licença se existir; caso contrário o nome do tipo.</summary>
    public string NomeExibicao => Tipo == TipoLicencaServico.OUTRO && !string.IsNullOrWhiteSpace(Licenca?.NomePersonalizado) ? Licenca.NomePersonalizado! : Nome;
    public string? Tooltip => ConstantesServicoLicenca.Tooltip(Tipo);
    public bool Obrigatorio { get; set; }
    /// <summary> Estado: 0 = em falta, 1 = tem número mas sem ficheiro, 2 = completo (tem ficheiro). </summary>
    public int Estado { get; set; }
    /// <summary>Dados da licença sem path de ficheiro (para resposta da API).</summary>
    public ServicoLicencaDto? Licenca { get; set; }
}
