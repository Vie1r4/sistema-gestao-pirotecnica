using Finalproj.Models;
using Xunit;

namespace Finalproj.Tests;

public class MotorValidacaoPaiolTests
{
    [Fact]
    public void ValidarEntrada_LicencaExpirada_Recusa()
    {
        var produto = new Produto { FamiliaRisco = "1.3", GrupoCompatibilidade = "G", NEMPorUnidade = 1m };
        var paiol = new Paiol { PerfilRisco = "1.3G", LimiteMLE = 1000, DataValidadeLicenca = DateTime.UtcNow.AddDays(-1) };
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, 10, new List<ProdutoNoPaiolDto>(), 0);
        Assert.False(resultado.Aprovado);
        Assert.Single(resultado.Erros);
        Assert.Contains("Licença", resultado.Erros[0].Mensagem);
    }

    [Fact]
    public void ValidarEntrada_LotacaoMaximaExcedida_Recusa()
    {
        var produto = new Produto { FamiliaRisco = "1.3", GrupoCompatibilidade = "G", NEMPorUnidade = 10m };
        var paiol = new Paiol { PerfilRisco = "1.3G", LimiteMLE = 100 };
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, 20, new List<ProdutoNoPaiolDto>(), 0);
        Assert.False(resultado.Aprovado);
        Assert.Contains(resultado.Erros, e => e.Mensagem.Contains("Lotação"));
    }

    [Fact]
    public void ValidarEntrada_EntradaValida_Aprova()
    {
        var produto = new Produto { FamiliaRisco = "1.3", GrupoCompatibilidade = "G", NEMPorUnidade = 1m };
        var paiol = new Paiol { PerfilRisco = "1.3G", LimiteMLE = 1000 };
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, 10, new List<ProdutoNoPaiolDto>(), 0);
        Assert.True(resultado.Aprovado);
        Assert.Empty(resultado.Erros);
    }

    [Fact]
    public void ValidarEntrada_GruposIncompativeis_Recusa()
    {
        var produto = new Produto { FamiliaRisco = "1.3", GrupoCompatibilidade = "B", NEMPorUnidade = 1m };
        var paiol = new Paiol { PerfilRisco = "1.3G", LimiteMLE = 1000 };
        var existentes = new List<ProdutoNoPaiolDto> { new() { Grupo = "G", Quantidade = 1, NEMPorUnidade = 1, Divisao = "1.3" } };
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, 10, existentes, 1);
        Assert.False(resultado.Aprovado);
        Assert.Contains(resultado.Erros, e => e.Mensagem.Contains("Incompatibilidade") || e.Mensagem.Contains("grupo"));
    }

    [Fact]
    public void ValidarEntrada_LoteExpirado_Recusa()
    {
        var produto = new Produto { FamiliaRisco = "1.4", GrupoCompatibilidade = "G", NEMPorUnidade = 1m };
        var paiol = new Paiol { PerfilRisco = "1.4G", LimiteMLE = 1000 };
        var resultado = MotorValidacaoPaiol.ValidarEntrada(produto, paiol, 5, new List<ProdutoNoPaiolDto>(), 0, dataValidadeLote: DateTime.UtcNow.AddDays(-1));
        Assert.False(resultado.Aprovado);
        Assert.Contains(resultado.Erros, e => e.Mensagem.Contains("validade") || e.Mensagem.Contains("Lote"));
    }
}
