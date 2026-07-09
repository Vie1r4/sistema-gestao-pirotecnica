using Finalproj.Application.Features.Funcionarios.Validators;
using Finalproj.Domain.Conformidade;
using Xunit;

namespace Finalproj.Tests.Funcionarios;

public sealed class LicencaOperadorRegistoValidatorTests
{
    [Fact]
    public void Validar_SemRegistoLicenca_RetornaVazio()
    {
        var erros = LicencaOperadorRegistoValidator.Validar(false, null, null, false);
        Assert.Empty(erros);
    }

    [Fact]
    public void Validar_CamposEmFalta_RetornaTodosOsErros()
    {
        var erros = LicencaOperadorRegistoValidator.Validar(true, null, null, false);

        Assert.Equal(3, erros.Count);
        Assert.Contains(erros, e => e.Campo == "Funcionario.NumeroCredencial");
        Assert.Contains(erros, e => e.Campo == "Funcionario.DataValidadeLicencaOperador");
        Assert.Contains(erros, e => e.Campo == "LicencaOperadorFicheiro");
    }

    [Fact]
    public void Validar_ValidadePassada_RetornaErroData()
    {
        var erros = LicencaOperadorRegistoValidator.Validar(
            true,
            "CRED-123",
            DateTime.UtcNow.Date.AddDays(-2),
            true);

        Assert.Contains(erros, e => e.Campo == "Funcionario.DataValidadeLicencaOperador");
    }

    [Fact]
    public void Validar_DadosCompletos_RetornaVazio()
    {
        var erros = LicencaOperadorRegistoValidator.Validar(
            true,
            "CRED-123",
            DateTime.UtcNow.Date.AddYears(1),
            true);

        Assert.Empty(erros);
    }

    [Fact]
    public void LicencaCompleta_ComDadosValidos_RetornaTrue()
    {
        var completa = LicencaOperadorRegistoValidator.LicencaCompleta(
            true,
            "CRED-99",
            DateTime.UtcNow.Date.AddMonths(6));

        Assert.True(completa);
    }

    [Fact]
    public void LicencaCompleta_SemFicheiro_RetornaFalse()
    {
        var completa = LicencaOperadorRegistoValidator.LicencaCompleta(
            false,
            "CRED-99",
            DateTime.UtcNow.Date.AddMonths(6));

        Assert.False(completa);
        Assert.Equal(
            EstadoLicencaOperador.Incompleta,
            LicencaOperadorConformidade.CalcularEstado(false, "CRED-99", DateTime.UtcNow.Date.AddMonths(6)));
    }
}
