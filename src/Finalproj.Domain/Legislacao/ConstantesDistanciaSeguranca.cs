namespace Finalproj.Domain.Legislacao;

/// <summary>
/// Distâncias mínimas de segurança (metros) por tipo de referência e, quando aplicável, por divisão de risco.
/// Os valores vêm de <see cref="ParametrosLegaisPirotecnia"/> (fonte única — alterar lá quando a lei mudar).
/// </summary>
public static class ConstantesDistanciaSeguranca
{
    /// <summary> Distância mínima para habitações/edifícios: 50m (1.4G), 100m (1.3G), 300m (1.1G). </summary>
    public static int HabitacaoMinimaMetros(string? divisaoDominante) =>
        ParametrosLegaisPirotecnia.DistanciaMinimaHabitacaoMetros(divisaoDominante);

    public static int EstradaNacional => ParametrosLegaisPirotecnia.DistanciaMinimaEstradaNacionalMetros;
    public static int Autoestrada => ParametrosLegaisPirotecnia.DistanciaMinimaAutoestradaMetros;
    public static int LinhaAltaTensao => ParametrosLegaisPirotecnia.DistanciaMinimaLinhaAltaTensaoMetros;
    public static int Floresta => ParametrosLegaisPirotecnia.DistanciaMinimaFlorestaMetros;

    public static string Nome(TipoReferenciaDistancia tipo)
    {
        return tipo switch
        {
            TipoReferenciaDistancia.HABITACAO => "Habitações / edifícios",
            TipoReferenciaDistancia.ESTRADA_NACIONAL => "Estradas nacionais",
            TipoReferenciaDistancia.AUTOESTRADA => "Autoestradas / IC / IP",
            TipoReferenciaDistancia.LINHA_ALTA_TENSAO => "Linhas de alta tensão",
            TipoReferenciaDistancia.FLORESTA => "Florestas / matas",
            TipoReferenciaDistancia.OUTRO => "Outro",
            _ => tipo.ToString()
        };
    }
}
