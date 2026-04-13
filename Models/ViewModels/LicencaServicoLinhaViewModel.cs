using System.Text.Json.Serialization;

namespace Finalproj.Models;

/// <summary>
/// Uma linha da secção "Licenças do evento" na vista Details do serviço.
/// Separa papelada gerada (pedido) do registo definitivo autorizado pelas entidades.
/// </summary>
public class LicencaServicoLinhaViewModel
{
    public TipoLicencaServico Tipo { get; set; }
    public string Nome => ConstantesServicoLicenca.Nome(Tipo);

    /// <summary>Para OUTRO usa NomePersonalizado da licença definitiva ou do pedido.</summary>
    public string NomeExibicao =>
        Tipo == TipoLicencaServico.OUTRO && !string.IsNullOrWhiteSpace((LicencaDefinitiva ?? LicencaPedido)?.NomePersonalizado)
            ? (LicencaDefinitiva ?? LicencaPedido)!.NomePersonalizado!
            : Nome;

    public string? Tooltip => ConstantesServicoLicenca.Tooltip(Tipo);
    public bool Obrigatorio { get; set; }

    /// <summary>Papelada gerada / pedidos internos (antes da autorização).</summary>
    public ServicoLicencaDto? LicencaPedido { get; set; }

    /// <summary>Registo do documento definitivo autorizado pela entidade reguladora.</summary>
    public ServicoLicencaDto? LicencaDefinitiva { get; set; }

    /// <summary>Estado do pedido: 0 em falta, 1 número sem ficheiro, 2 completo.</summary>
    public int EstadoPedido { get; set; }

    /// <summary>Estado da autorização definitiva.</summary>
    public int EstadoDefinitiva { get; set; }

    /// <summary>Compatibilidade: maior estado entre pedido e definitiva (UI antiga).</summary>
    [JsonIgnore]
    public int Estado => Math.Max(EstadoPedido, EstadoDefinitiva);

    /// <summary>Compatibilidade: preferir definitiva para listagens simples.</summary>
    [JsonIgnore]
    public ServicoLicencaDto? Licenca => LicencaDefinitiva ?? LicencaPedido;

    public static int CalcularEstado(ServicoLicenca? lic)
    {
        if (lic == null) return 0;
        if (!string.IsNullOrWhiteSpace(lic.FicheiroPath)) return 2;
        if (!string.IsNullOrWhiteSpace(lic.NumeroDocumento)) return 1;
        return 0;
    }
}
