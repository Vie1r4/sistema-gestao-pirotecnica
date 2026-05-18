namespace Finalproj.Domain.Enums;

/// <summary>
/// Origem do registo da licença: papelada gerada internamente vs documento definitivo das entidades reguladoras.
/// </summary>
public enum OrigemRegistoServicoLicenca : byte
{
    /// <summary>Pedidos, rascunhos e papelada gerada pelo sistema (antes da autorização).</summary>
    PedidoGerado = 0,

    /// <summary>Registo do documento definitivo autorizado pela entidade reguladora.</summary>
    AutorizacaoDefinitiva = 1,
}
