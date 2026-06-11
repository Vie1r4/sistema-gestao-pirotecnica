namespace Finalproj.Domain.Legislacao;

/// <summary>
/// Raio ao público (m) derivado das distâncias definidas no catálogo de produtos.
/// </summary>
public static class CalculoAreaSegurancaPublico
{
    /// <summary>
    /// Máximo das distâncias ao público dos produtos indicados (ex.: bombas 100 m + caixas 50 m → 100 m).
    /// </summary>
    public static int? CalcularRaioMetros(IEnumerable<Produto> produtos)
    {
        var lista = produtos as IList<Produto> ?? produtos.ToList();
        if (lista.Count == 0)
            return null;

        return lista.Max(p => p.DistanciaSegurancaPublico_m);
    }

    public static int? CalcularRaioMetros(IEnumerable<int> produtoIds, IReadOnlyDictionary<int, Produto> produtosPorId)
    {
        var produtos = produtoIds
            .Distinct()
            .Select(id => produtosPorId.TryGetValue(id, out var p) ? p : null)
            .Where(p => p != null)
            .Cast<Produto>()
            .ToList();
        return CalcularRaioMetros(produtos);
    }
}
