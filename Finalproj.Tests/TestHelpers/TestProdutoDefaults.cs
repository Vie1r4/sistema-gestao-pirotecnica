using Finalproj.Domain.Entities;

namespace Finalproj.Tests.TestHelpers;

/// <summary>
/// Valores válidos para campos obrigatórios de <see cref="Produto"/> em testes (EF InMemory).
/// </summary>
public static class TestProdutoDefaults
{
    public const string FiltroTecnico = "Baterias";
    public const string Calibre = "20_25_30MM";
    public const string Categoria = "F2";
    public const string GrupoCompatibilidade = "G";
    public const int DistanciaSegurancaPublico_m = 50;

    public static void ApplyRequiredFields(Produto produto)
    {
        produto.FiltroTecnico ??= FiltroTecnico;
        produto.Calibre ??= Calibre;
        produto.Categoria ??= Categoria;
        produto.GrupoCompatibilidade ??= GrupoCompatibilidade;
        if (produto.DistanciaSegurancaPublico_m <= 0)
            produto.DistanciaSegurancaPublico_m = DistanciaSegurancaPublico_m;
    }
}
