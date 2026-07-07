using Finalproj.Domain.Conformidade;
using Finalproj.Domain.Entities;

namespace Finalproj.Application.Features.Funcionarios;

/// <summary>Filtros de listagem por estado da licença de operador.</summary>
public static class FiltroLicencaOperador
{
    public const string Todas = "";
    public const string Valida = "valida";
    public const string AExpirar = "a_expirar";
    public const string Expirada = "expirada";
    public const string Incompleta = "incompleta";

    public static bool Corresponde(EstadoLicencaOperador estado, string? filtro)
    {
        if (string.IsNullOrWhiteSpace(filtro)) return true;
        return filtro.Trim().ToLowerInvariant() switch
        {
            Valida => estado == EstadoLicencaOperador.Valida,
            AExpirar => estado == EstadoLicencaOperador.AExpirar,
            Expirada => estado == EstadoLicencaOperador.Expirada,
            Incompleta => estado == EstadoLicencaOperador.Incompleta,
            _ => true
        };
    }

    public static EstadoLicencaOperador Calcular(Funcionario f) =>
        LicencaOperadorConformidade.CalcularEstado(
            !string.IsNullOrEmpty(f.LicencaOperadorCaminho),
            f.NumeroCredencial,
            f.DataValidadeLicencaOperador);
}
