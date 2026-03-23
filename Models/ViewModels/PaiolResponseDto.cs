namespace Finalproj.Models;

/// <summary>
/// DTO de resposta para Paiol. Não expõe caminhos de ficheiros; documentos extras apenas Id e Nome.
/// </summary>
public class PaiolResponseDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Localizacao { get; set; }
    public decimal? CoordenadasLat { get; set; }
    public decimal? CoordenadasLng { get; set; }
    public decimal LimiteMLE { get; set; }
    public string PerfilRisco { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime? DataValidadeLicenca { get; set; }
    public string? NumeroLicenca { get; set; }
    public string? DivisaoDominante { get; set; }
    public List<PaiolDocumentoExtraDto> DocumentosExtras { get; set; } = new();
}

public class PaiolDocumentoExtraDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

public static class PaiolResponseDtoMapping
{
    public static PaiolResponseDto Map(Paiol p)
    {
        return new PaiolResponseDto
        {
            Id = p.Id,
            Nome = p.Nome,
            Localizacao = p.Localizacao,
            CoordenadasLat = p.CoordenadasLat,
            CoordenadasLng = p.CoordenadasLng,
            LimiteMLE = p.LimiteMLE,
            PerfilRisco = p.PerfilRisco,
            Estado = p.Estado,
            DataValidadeLicenca = p.DataValidadeLicenca,
            NumeroLicenca = p.NumeroLicenca,
            DivisaoDominante = p.DivisaoDominante,
            DocumentosExtras = (p.DocumentosExtras ?? new List<PaiolDocumentoExtra>())
                .Select(e => new PaiolDocumentoExtraDto { Id = e.Id, Nome = e.Nome })
                .ToList()
        };
    }
}
