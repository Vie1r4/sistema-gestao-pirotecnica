using Finalproj.Domain.Entities;
using Xunit;

namespace Finalproj.Tests.Domain;

public class CalculoAreaSegurancaPublicoTests
{
    [Fact]
    public void CalcularRaioMetros_UsaMaximoEntreProdutos()
    {
        var produtos = new[]
        {
            new Produto { DistanciaSegurancaPublico_m = 100 },
            new Produto { DistanciaSegurancaPublico_m = 50 },
        };

        var raio = CalculoAreaSegurancaPublico.CalcularRaioMetros(produtos);

        Assert.Equal(100, raio);
    }

    [Fact]
    public void CalcularRaioMetros_PorIdsIgnoraDesconhecidos()
    {
        var bombas = new Produto { Id = 1, DistanciaSegurancaPublico_m = 100 };
        var caixas = new Produto { Id = 2, DistanciaSegurancaPublico_m = 50 };
        var porId = new Dictionary<int, Produto> { [1] = bombas, [2] = caixas };

        var raio = CalculoAreaSegurancaPublico.CalcularRaioMetros(new[] { 1, 2, 99 }, porId);

        Assert.Equal(100, raio);
    }

    [Fact]
    public void CalcularRaioMetros_SemProdutos_RetornaNull()
    {
        Assert.Null(CalculoAreaSegurancaPublico.CalcularRaioMetros(Array.Empty<Produto>()));
    }

    [Fact]
    public void CalcularRaioMetros_DuasZonasIndependentes_ServicoUsaMaximo120()
    {
        var produto80 = new Produto { DistanciaSegurancaPublico_m = 80 };
        var produto120 = new Produto { DistanciaSegurancaPublico_m = 120 };

        var raioZonaA = CalculoAreaSegurancaPublico.CalcularRaioMetros(new[] { produto80, produto120 });
        var raioZonaB = CalculoAreaSegurancaPublico.CalcularRaioMetros(new[] { produto80 });
        var raioServico = new[] { raioZonaA, raioZonaB }.Where(r => r.HasValue).Max();

        Assert.Equal(120, raioZonaA);
        Assert.Equal(80, raioZonaB);
        Assert.Equal(120, raioServico);
    }
}
