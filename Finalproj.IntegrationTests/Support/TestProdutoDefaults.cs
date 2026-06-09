using Finalproj.Domain.Entities;

namespace Finalproj.IntegrationTests.Infrastructure;

/// <summary>
/// Valores válidos para campos obrigatórios de <see cref="Produto"/> em testes de integração.
/// </summary>
public static class TestProdutoDefaults
{
    public const string FiltroTecnico = "Baterias";
    public const string Calibre = "BateriasPadrao";
    public const string Categoria = "F2";
    public const string GrupoCompatibilidade = "G";

    public static void ApplyRequiredFields(Produto produto)
    {
        produto.FiltroTecnico ??= FiltroTecnico;
        produto.Calibre ??= Calibre;
        produto.Categoria ??= Categoria;
        produto.GrupoCompatibilidade ??= GrupoCompatibilidade;
    }
}
