namespace Finalproj.Domain.Constants;

/// <summary>
/// Valores fixos do catálogo: classificação de risco, filtro técnico e calibre (estrutura em níveis).
/// Dropdowns para API: Finalproj.Api.Models.DropdownSelectLists.
/// </summary>
public static class ConstantesCatalogo
{
    /// <summary> Classificação de risco (1.1G, 1.2G, …). Valores iguais aos de ConstantesPaiol.FamiliasRiscoProduto. </summary>
    public static readonly string[] ClassificacoesRisco = { "1.1", "1.2", "1.3", "1.4", "1.4S", "1.5", "1.6" };

    /// <summary> Texto para exibição: 1.4S mantém-se; restantes com sufixo G. </summary>
    public static string TextoClassificacao(string valor)
    {
        if (string.IsNullOrEmpty(valor)) return "";
        return valor == "1.4S" ? valor : valor + "G";
    }

    /// <summary> Grupos de compatibilidade ADR (B,C,D,G,S). Determinam co-armazenamento no paiol (matriz 7.2.5). </summary>
    public static readonly (string Value, string Text)[] GruposCompatibilidade =
    {
        ("G", "G — Artigos pirotécnicos (foguetes, morteiros, F3/F4)"),
        ("S", "S — Artigos muito seguros (F1/F2)"),
        ("C", "C — Pólvoras / propulsoras"),
        ("B", "B — Iniciadores (detonadores, espoletas)"),
        ("D", "D — Explosivos secundários sem espoleta")
    };

    public static string TextoGrupoCompatibilidade(string? valor)
    {
        if (string.IsNullOrEmpty(valor)) return "—";
        var item = GruposCompatibilidade.FirstOrDefault(g => g.Value == valor);
        return item.Text ?? valor;
    }

    /// <summary> Filtros técnicos (tipo de material). Value = código guardado na BD. </summary>
    public static readonly (string Value, string Text)[] FiltrosTecnicos =
    {
        ("Baterias", "Baterias"),
        ("BombasArremesso", "Bombas de Arremesso"),
        ("Morteiros", "Morteiros"),
        ("Foguetes", "Foguetes"),
        ("Cascatas", "Cascatas / Fontes"),
        ("Bengalas", "Bengalas"),
        ("Candelas", "Candelas"),
        ("Monotiros", "Monotiros"),
        ("GerbsVulcoes", "Gerbs / Vulcões")
    };

    /// <summary> Categorias pirotécnicas (declaração PSP). Value = código guardado na BD. </summary>
    public static readonly (string Value, string Text)[] CategoriasPirotecnicas =
    {
        ("F1", "F1"),
        ("F2", "F2"),
        ("F3", "F3"),
        ("F4", "F4"),
        ("T1", "T1"),
        ("T2", "T2"),
        ("P1", "P1"),
        ("P2", "P2"),
        ("FP", "FP — Fabrico próprio"),
    };

    /// <summary> Calibres (mm). Value = código guardado na BD. </summary>
    public static readonly (string Value, string Text)[] Calibres =
    {
        ("20_25_30MM", "20/25/30MM"),
        ("50MM", "50MM"),
        ("65MM", "65MM"),
        ("75MM", "75MM"),
        ("100MM", "100MM"),
        ("120MM", "120MM"),
        ("150MM", "150MM"),
    };

    public static string TextoFiltroTecnico(string? valor)
    {
        if (string.IsNullOrEmpty(valor)) return "—";
        var item = FiltrosTecnicos.FirstOrDefault(f => f.Value == valor);
        return string.IsNullOrEmpty(item.Value) ? valor : item.Text;
    }

    public static string TextoCalibre(string? valor)
    {
        if (string.IsNullOrEmpty(valor)) return "—";
        var item = Calibres.FirstOrDefault(c => c.Value == valor);
        return string.IsNullOrEmpty(item.Value) ? valor : item.Text;
    }

    public static string TextoCategoria(string? valor)
    {
        if (string.IsNullOrEmpty(valor)) return "—";
        var item = CategoriasPirotecnicas.FirstOrDefault(c => c.Value == valor);
        return item.Text ?? valor;
    }
}
