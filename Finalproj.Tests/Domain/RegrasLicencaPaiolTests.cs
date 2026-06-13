using Finalproj.Domain.Legislacao;
using Xunit;

namespace Finalproj.Tests.Domain;

/// <summary>
/// Cobre a Fase 1 (divisões de risco): que famílias cada licença de paiol aceita (ADR 7.5.2.2).
/// Cascata só de 1.3 para baixo; 1.1/1.2 são "ilhas". Ordem: 1.1 > 1.2 > 1.3 > 1.4 > 1.4S.
/// </summary>
public class RegrasLicencaPaiolTests
{
    [Theory]
    // Licença 1.1 — só aceita 1.1 (cascata quebra no topo)
    [InlineData("1.1G", "1.1G", true)]
    [InlineData("1.1G", "1.2G", false)]
    [InlineData("1.1G", "1.3G", false)]
    [InlineData("1.1G", "1.4G", false)]
    [InlineData("1.1G", "1.4S", false)]
    // Licença 1.2 — só aceita 1.2
    [InlineData("1.2G", "1.2G", true)]
    [InlineData("1.2G", "1.1G", false)]
    [InlineData("1.2G", "1.3G", false)]
    // Licença 1.3 — aceita 1.3, 1.4, 1.4S; recusa mais perigosos
    [InlineData("1.3G", "1.3G", true)]
    [InlineData("1.3G", "1.4G", true)]
    [InlineData("1.3G", "1.4S", true)]
    [InlineData("1.3G", "1.1G", false)]
    [InlineData("1.3G", "1.2G", false)]
    // Licença 1.4 — aceita 1.4 e 1.4S; recusa 1.3 (mais perigoso) — caso crítico
    [InlineData("1.4G", "1.4G", true)]
    [InlineData("1.4G", "1.4S", true)]
    [InlineData("1.4G", "1.3G", false)]
    [InlineData("1.4G", "1.1G", false)]
    // Licença 1.4S — só aceita 1.4S; recusa 1.3 e 1.4 — caso crítico
    [InlineData("1.4S", "1.4S", true)]
    [InlineData("1.4S", "1.4G", false)]
    [InlineData("1.4S", "1.3G", false)]
    public void ProdutoPodeEntrar_RespeitaMatrizDivisoes(string licencaPaiol, string familiaProduto, bool esperado)
    {
        Assert.Equal(esperado, RegrasLicencaPaiol.ProdutoPodeEntrar(licencaPaiol, familiaProduto));
    }

    [Theory]
    [InlineData("1.5G", "1.4G")]
    [InlineData("1.6G", "1.6G")]
    public void ProdutoPodeEntrar_LicencasForaDoDominio_SaoRecusadas(string licencaPaiol, string familiaProduto)
    {
        Assert.False(RegrasLicencaPaiol.ProdutoPodeEntrar(licencaPaiol, familiaProduto));
    }

    [Theory]
    [InlineData(null, "1.4G")]
    [InlineData("1.4G", null)]
    [InlineData("", "")]
    public void LicencaAceitaFamilia_ValoresEmFalta_DevolveFalse(string? licenca, string? familia)
    {
        Assert.False(ParametrosLegaisPirotecnia.LicencaAceitaFamilia(licenca, familia));
    }

    [Fact]
    public void MensagemRecusa_Paiol14_ExplicaQueNaoRecebe13()
    {
        var msg = RegrasLicencaPaiol.MensagemRecusa("1.4G", "1.3G");
        Assert.Contains("1.4G", msg);
        Assert.Contains("não pode receber 1.3G", msg);
    }
}
