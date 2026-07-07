namespace Finalproj.Domain.Conformidade;

/// <summary>Estado calculado do cartão de cidadão (NIF + morada + validade + documento).</summary>
public enum EstadoCartaoCidadao
{
    Ausente,
    Incompleta,
    Valida,
    AExpirar,
    Expirada
}

/// <summary>Regras partilhadas de conformidade do cartão de cidadão.</summary>
public static class CartaoCidadaoConformidade
{
    public const int DiasAvisoExpiracao = 60;

    public static EstadoCartaoCidadao CalcularEstado(
        bool temFicheiro,
        string? nif,
        string? morada,
        DateTime? dataValidade,
        DateTime? referenciaUtc = null)
    {
        var hoje = (referenciaUtc ?? DateTime.UtcNow).Date;
        if (!temFicheiro && string.IsNullOrWhiteSpace(nif) && string.IsNullOrWhiteSpace(morada) && !dataValidade.HasValue)
            return EstadoCartaoCidadao.Ausente;
        if (!temFicheiro || string.IsNullOrWhiteSpace(nif) || string.IsNullOrWhiteSpace(morada) || !dataValidade.HasValue)
            return EstadoCartaoCidadao.Incompleta;

        var validade = dataValidade.Value.Date;
        if (validade < hoje)
            return EstadoCartaoCidadao.Expirada;
        if (validade <= hoje.AddDays(DiasAvisoExpiracao))
            return EstadoCartaoCidadao.AExpirar;
        return EstadoCartaoCidadao.Valida;
    }

    public static bool TemCartaoRegistado(bool temFicheiro, string? nif, string? morada, DateTime? dataValidade) =>
        temFicheiro || !string.IsNullOrWhiteSpace(nif) || !string.IsNullOrWhiteSpace(morada) || dataValidade.HasValue;
}
