using Finalproj.Domain.Entities;
using Finalproj.Domain.Legislacao;
using Xunit;

namespace Finalproj.Tests.Domain;

/// <summary>
/// Cobre o "nivelamento por cima": quando a entrada eleva a divisão dominante do paiol,
/// o motor avisa (AVISO_004) sem bloquear. O limite de peso definido mantém-se.
/// </summary>
public class MotorValidacaoPaiolNivelamentoTests
{
    private static Paiol PaiolValido(string perfil) => new()
    {
        Nome = "Paiol",
        PerfilRisco = perfil,
        Estado = ConstantesPaiol.EstadoAtivo,
        LimiteMLE = 1000m,
        DataValidadeLicenca = DateTime.UtcNow.Date.AddYears(1),
    };

    private static Produto ProdutoG(string familia, decimal nem = 0.5m) => new()
    {
        Nome = "Produto " + familia,
        FamiliaRisco = familia,
        GrupoCompatibilidade = "G",
        NEMPorUnidade = nem,
    };

    [Fact]
    public void Entrada13_NumPaiolComSo14_AvisaNivelamento()
    {
        // Paiol licenciado para 1.3, hoje só com 1.4G; entra 1.3G → dominante sobe 1.4 → 1.3.
        var paiol = PaiolValido("1.3G");
        var existentes = new List<ProdutoNoPaiolDto>
        {
            new() { Divisao = "1.4G", Grupo = "G", Quantidade = 10m, NEMPorUnidade = 1m },
        };

        var r = MotorValidacaoPaiol.ValidarEntrada(ProdutoG("1.3G"), paiol, 1m, existentes, mleAtualPaiol: 10m);

        Assert.True(r.Aprovado);
        Assert.Contains(r.Avisos, a => a.Codigo == "AVISO_004");
        Assert.Equal("1.3", r.DivisaoDominanteResultante);
    }

    [Fact]
    public void Entrada14_NumPaiolComSo14_NaoAvisaNivelamento()
    {
        var paiol = PaiolValido("1.3G");
        var existentes = new List<ProdutoNoPaiolDto>
        {
            new() { Divisao = "1.4G", Grupo = "G", Quantidade = 10m, NEMPorUnidade = 1m },
        };

        var r = MotorValidacaoPaiol.ValidarEntrada(ProdutoG("1.4G"), paiol, 1m, existentes, mleAtualPaiol: 10m);

        Assert.True(r.Aprovado);
        Assert.DoesNotContain(r.Avisos, a => a.Codigo == "AVISO_004");
    }

    [Fact]
    public void PrimeiraEntrada_PaiolVazio_NaoAvisaNivelamento()
    {
        var paiol = PaiolValido("1.3G");

        var r = MotorValidacaoPaiol.ValidarEntrada(ProdutoG("1.3G"), paiol, 1m, new List<ProdutoNoPaiolDto>(), mleAtualPaiol: 0m);

        Assert.True(r.Aprovado);
        Assert.DoesNotContain(r.Avisos, a => a.Codigo == "AVISO_004");
    }

    [Fact]
    public void Nivelamento_NaoBloqueia_LimiteDePesoMantemSe()
    {
        // O peso continua a ocupar o real; o nivelamento não reduz o limite nem bloqueia.
        var paiol = PaiolValido("1.3G");
        var existentes = new List<ProdutoNoPaiolDto>
        {
            new() { Divisao = "1.4G", Grupo = "G", Quantidade = 10m, NEMPorUnidade = 1m },
        };

        var r = MotorValidacaoPaiol.ValidarEntrada(ProdutoG("1.3G", nem: 0.5m), paiol, 1m, existentes, mleAtualPaiol: 10m);

        Assert.True(r.Aprovado);
        Assert.Empty(r.Erros);
    }
}
