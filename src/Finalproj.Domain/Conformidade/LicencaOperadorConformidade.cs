namespace Finalproj.Domain.Conformidade;

/// <summary>Estado calculado da licença de operador pirotécnica (CRED + validade + documento).</summary>
public enum EstadoLicencaOperador
{
    Ausente,
    Incompleta,
    Valida,
    AExpirar,
    Expirada
}

/// <summary>Regras partilhadas de conformidade da licença de operador.</summary>
public static class LicencaOperadorConformidade
{
    /// <summary>Dias antes da validade em que começam os avisos (2 meses).</summary>
    public const int DiasAvisoExpiracao = 60;

    public static EstadoLicencaOperador CalcularEstado(
        bool temFicheiro,
        string? numeroCredencial,
        DateTime? dataValidade,
        DateTime? referenciaUtc = null)
    {
        var hoje = (referenciaUtc ?? DateTime.UtcNow).Date;
        if (!temFicheiro && string.IsNullOrWhiteSpace(numeroCredencial) && !dataValidade.HasValue)
            return EstadoLicencaOperador.Ausente;
        if (!temFicheiro || string.IsNullOrWhiteSpace(numeroCredencial) || !dataValidade.HasValue)
            return EstadoLicencaOperador.Incompleta;

        var validade = dataValidade.Value.Date;
        if (validade < hoje)
            return EstadoLicencaOperador.Expirada;
        if (validade <= hoje.AddDays(DiasAvisoExpiracao))
            return EstadoLicencaOperador.AExpirar;
        return EstadoLicencaOperador.Valida;
    }

    public static bool TemLicencaRegistada(bool temFicheiro, string? numeroCredencial, DateTime? dataValidade) =>
        temFicheiro || !string.IsNullOrWhiteSpace(numeroCredencial) || dataValidade.HasValue;
}
