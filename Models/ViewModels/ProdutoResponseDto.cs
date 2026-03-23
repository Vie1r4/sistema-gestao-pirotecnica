namespace Finalproj.Models;

/// <summary>
/// DTO de resposta para Produto. Expõe apenas os campos necessários à API (evita acoplamento à entidade EF e overfetch).
/// </summary>
public class ProdutoResponseDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal NEMPorUnidade { get; set; }
    public string FamiliaRisco { get; set; } = string.Empty;
    public string? Unidade { get; set; }
    public string? FiltroTecnico { get; set; }
    public string? Calibre { get; set; }
    public string? GrupoCompatibilidade { get; set; }
}

public static class ProdutoResponseDtoMapping
{
    public static ProdutoResponseDto Map(Produto p)
    {
        return new ProdutoResponseDto
        {
            Id = p.Id,
            Nome = p.Nome,
            NEMPorUnidade = p.NEMPorUnidade,
            FamiliaRisco = p.FamiliaRisco,
            Unidade = p.Unidade,
            FiltroTecnico = p.FiltroTecnico,
            Calibre = p.Calibre,
            GrupoCompatibilidade = p.GrupoCompatibilidade
        };
    }
}
