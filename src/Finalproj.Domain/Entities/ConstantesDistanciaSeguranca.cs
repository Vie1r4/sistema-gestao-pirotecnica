namespace Finalproj.Domain.Constants;

/// <summary>
/// Distâncias mínimas de segurança (metros) por tipo de referência e, quando aplicável, por divisão de risco.
/// Base: RFACEPE e Regulamento PSP.
/// </summary>
public static class ConstantesDistanciaSeguranca
{
    /// <summary> Distância mínima para habitações/edifícios: 50m (1.4G), 100m (1.3G), 300m (1.1G). </summary>
    public static int HabitacaoMinimaMetros(string? divisaoDominante)
    {
        if (string.IsNullOrWhiteSpace(divisaoDominante)) return 50;
        return divisaoDominante switch
        {
            "1.1G" => 300,
            "1.3G" => 100,
            _ => 50
        };
    }

    public static int EstradaNacional => 25;
    public static int Autoestrada => 100;
    public static int LinhaAltaTensao => 50;
    public static int Floresta => 100;

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
