using Finalproj.Domain.Conformidade;

namespace Finalproj.Application.Features.Funcionarios.Validators;

/// <summary>Validação partilhada ao registar licença de operador (criar/editar funcionário).</summary>
public static class LicencaOperadorRegistoValidator
{
    public sealed record Erro(string Campo, string Mensagem);

    public static IReadOnlyList<Erro> Validar(
        bool registarLicenca,
        string? numeroCredencial,
        DateTime? dataValidade,
        bool temFicheiro)
    {
        if (!registarLicenca)
            return Array.Empty<Erro>();

        var erros = new List<Erro>();
        if (string.IsNullOrWhiteSpace(numeroCredencial))
            erros.Add(new Erro(
                "Funcionario.NumeroCredencial",
                "O n.º de credencial (CRED) é obrigatório quando regista a credencial."));
        if (!dataValidade.HasValue)
            erros.Add(new Erro(
                "Funcionario.DataValidadeLicencaOperador",
                "A data de validade é obrigatória quando regista a credencial."));
        else if (dataValidade.Value.Date < DateTime.UtcNow.Date)
            erros.Add(new Erro(
                "Funcionario.DataValidadeLicencaOperador",
                "A data de validade não pode ser anterior a hoje."));
        if (!temFicheiro)
            erros.Add(new Erro(
                "LicencaOperadorFicheiro",
                "O documento da credencial é obrigatório."));
        return erros;
    }

    public static bool LicencaCompleta(bool temFicheiro, string? numeroCredencial, DateTime? dataValidade) =>
        LicencaOperadorConformidade.CalcularEstado(temFicheiro, numeroCredencial, dataValidade) is
            EstadoLicencaOperador.Valida or EstadoLicencaOperador.AExpirar or EstadoLicencaOperador.Expirada;
}
