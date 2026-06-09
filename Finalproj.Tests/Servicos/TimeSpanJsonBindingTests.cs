using System.Text.Json;
using Finalproj.Application.Common.Json;
using Finalproj.Application.Features.Servicos.DTOs;
using Xunit;

namespace Finalproj.Tests.Servicos;

public class TimeSpanJsonBindingTests
{
    [Theory]
    [InlineData("\"22:00\"")]
    [InlineData("\"22:00:00\"")]
    public void ServicoSaveRequestDto_Deserializa_HoraLinha(string horaJson)
    {
        var json = $$"""
            {
              "encomendaId": 1,
              "dataServico": "2026-05-31",
              "zonas": [{
                "coordenadasLat": 41.5,
                "coordenadasLng": -8.4,
                "linhas": [{
                  "data": "2026-05-31",
                  "produtoId": 1,
                  "quantidade": 2,
                  "horaInicio": {{horaJson}},
                  "horaFim": "22:30:00"
                }]
              }]
            }
            """;

        var dto = JsonSerializer.Deserialize<ServicoSaveRequestDto>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new FlexibleTimeSpanJsonConverter() }
        });

        Assert.NotNull(dto);
        Assert.NotNull(dto!.Zonas[0].Linhas[0].HoraInicio);
    }
}
