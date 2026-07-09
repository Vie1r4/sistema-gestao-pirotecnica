using Finalproj.Application.Features.Funcionarios.Validators;
using Xunit;

namespace Finalproj.Tests.Funcionarios;

public sealed class CartaoCidadaoRegistoValidatorTests
{
    [Fact]
    public void Validar_SemRegistoCartao_RetornaVazio()
    {
        var erros = CartaoCidadaoRegistoValidator.Validar(false, null, null, null, false);
        Assert.Empty(erros);
    }

    [Fact]
    public void Validar_CamposEmFalta_RetornaTodosOsErros()
    {
        var erros = CartaoCidadaoRegistoValidator.Validar(true, null, null, null, false);

        Assert.Equal(4, erros.Count);
        Assert.Contains(erros, e => e.Campo == "Funcionario.NIF");
        Assert.Contains(erros, e => e.Campo == "Funcionario.Morada");
        Assert.Contains(erros, e => e.Campo == "Funcionario.DataValidadeCartaoCidadao");
        Assert.Contains(erros, e => e.Campo == "CartaoCidadaoFicheiro");
    }

    [Fact]
    public void Validar_NifInvalido_RetornaErroNif()
    {
        var validade = DateTime.UtcNow.Date.AddYears(1);
        var erros = CartaoCidadaoRegistoValidator.Validar(true, "12345", "Rua A", validade, true);

        Assert.Contains(erros, e => e.Campo == "Funcionario.NIF" && e.Mensagem.Contains("9 dígitos", StringComparison.Ordinal));
    }

    [Fact]
    public void Validar_ValidadePassada_RetornaErroData()
    {
        var erros = CartaoCidadaoRegistoValidator.Validar(
            true,
            "123456789",
            "Rua A",
            DateTime.UtcNow.Date.AddDays(-1),
            true);

        Assert.Contains(erros, e => e.Campo == "Funcionario.DataValidadeCartaoCidadao");
    }

    [Fact]
    public void Validar_DadosCompletos_RetornaVazio()
    {
        var erros = CartaoCidadaoRegistoValidator.Validar(
            true,
            "123456789",
            "Rua Principal 1",
            DateTime.UtcNow.Date.AddYears(2),
            true);

        Assert.Empty(erros);
    }
}
