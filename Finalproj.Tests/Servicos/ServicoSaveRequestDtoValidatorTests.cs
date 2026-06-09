using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Features.Servicos.Validators;
using Xunit;

namespace Finalproj.Tests.Servicos;

public class ServicoSaveRequestDtoValidatorTests
{
    private readonly ServicoSaveRequestDtoValidator _validator = new();

    [Fact]
    public async Task Deve_Falhar_Sem_Zonas()
    {
        var dto = new ServicoSaveRequestDto { EncomendaId = 1, DataServico = DateTime.Today, Zonas = [] };
        var result = await _validator.ValidateAsync(dto);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.Contains("Zonas"));
    }

    [Fact]
    public async Task Deve_Falhar_HoraFim_Antes_De_Inicio()
    {
        var dto = ValidDto();
        dto.Zonas[0].Linhas[0].HoraInicio = TimeSpan.FromHours(22);
        dto.Zonas[0].Linhas[0].HoraFim = TimeSpan.FromHours(21);
        var result = await _validator.ValidateAsync(dto);
        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Deve_Passar_Pedido_Valido()
    {
        var result = await _validator.ValidateAsync(ValidDto());
        Assert.True(result.IsValid);
    }

    private static ServicoSaveRequestDto ValidDto() =>
        new()
        {
            EncomendaId = 1,
            DataServico = DateTime.Today,
            Zonas =
            [
                new ServicoZonaLancamentoInputDto
                {
                    Designacao = "Campo",
                    CoordenadasLat = 41.5m,
                    CoordenadasLng = -8.4m,
                    Linhas =
                    [
                        new ServicoZonaLinhaInputDto
                        {
                            Data = DateTime.Today,
                            ProdutoId = 1,
                            Quantidade = 2m,
                            HoraInicio = TimeSpan.FromHours(22),
                            HoraFim = TimeSpan.FromHours(22).Add(TimeSpan.FromMinutes(30))
                        }
                    ]
                }
            ]
        };
}
