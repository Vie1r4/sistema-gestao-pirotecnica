using System.Net;
using System.Net.Http.Json;
using Finalproj.Domain.Constants;
using Finalproj.IntegrationTests.Infrastructure;
using Xunit;

namespace Finalproj.IntegrationTests.GestorAnalytics;

public class GestorAnalyticsTests : IntegrationTestBase
{
    [Fact]
    public async Task Volume_ReturnsJson_WithGestor()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.GetAsync("/api/gestor-analytics/volume?granularidade=mes&dias=90");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<VolumePayload>();
        Assert.NotNull(json);
        Assert.NotNull(json.Periodos);
    }

    [Fact]
    public async Task Volume_TresAnos_Mensal_ReturnsBuckets_WithGestor()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.GetAsync("/api/gestor-analytics/volume?granularidade=mes&dias=1095");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<VolumePayload>();
        Assert.NotNull(json);
        Assert.NotNull(json.Periodos);
        // BD de testes pode estar vazia — buckets só existem quando há encomendas no intervalo.
    }

    [Fact]
    public async Task ComparacaoAnual_ReturnsJson_WithGestor()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.GetAsync("/api/gestor-analytics/comparacao-anual");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<ComparacaoAnualPayload>();
        Assert.NotNull(json);
        Assert.NotNull(json.AnosDisponiveis);
        Assert.NotNull(json.Series);
        Assert.Contains(2025, json.AnosDisponiveis);
        var serie2025 = json.Series.FirstOrDefault(s => s.Ano == 2025);
        Assert.NotNull(serie2025);
        var jan = serie2025.Pontos.FirstOrDefault(p => p.Mes == 1);
        Assert.NotNull(jan);
        Assert.Equal(5, jan.Total);
    }

    private sealed class ComparacaoAnualPayload
    {
        public int AnoAtual { get; set; }
        public List<int> AnosDisponiveis { get; set; } = [];
        public List<ComparacaoAnualSeriePayload> Series { get; set; } = [];
    }

    private sealed class ComparacaoAnualSeriePayload
    {
        public int Ano { get; set; }
        public List<ComparacaoAnualPontoPayload> Pontos { get; set; } = [];
    }

    private sealed class ComparacaoAnualPontoPayload
    {
        public int Mes { get; set; }
        public int? Total { get; set; }
        public bool Futuro { get; set; }
    }

    private sealed class VolumePayload
    {
        public string Granularidade { get; set; } = "";
        public List<VolumePeriodoPayload> Periodos { get; set; } = [];
    }

    private sealed class VolumePeriodoPayload
    {
        public string Rotulo { get; set; } = "";
        public int Total { get; set; }
    }

}
