using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Validators;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Xunit;

namespace Finalproj.Tests.Paiols;

public class CreatePaiolInputDtoValidatorTests
{
    private readonly CreatePaiolInputDtoValidator _validator = new();

    [Fact]
    public async Task Deve_Falhar_PerfilRisco_Invalido()
    {
        var dto = ValidDto();
        dto.Paiol.PerfilRisco = "9.9";

        var result = await _validator.ValidateAsync(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("Perfil de risco inválido", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Deve_Falhar_Estado_Invalido()
    {
        var dto = ValidDto();
        dto.Paiol.Estado = "Inativo";

        var result = await _validator.ValidateAsync(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("Estado inválido", StringComparison.Ordinal));
    }

    private static CreatePaiolInputDto ValidDto() => new()
    {
        Paiol = new Paiol
        {
            Nome = "Paiol Teste",
            LimiteMLE = 100m,
            PerfilRisco = ConstantesPaiol.PerfisRisco[0],
            Estado = ConstantesPaiol.EstadoAtivo
        }
    };
}
