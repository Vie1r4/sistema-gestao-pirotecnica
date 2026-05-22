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
        Assert.True(json.Periodos.Count >= 30);
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
