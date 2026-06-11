namespace Finalproj.Domain.Legislacao;

/// <summary>
/// FONTE ÚNICA dos valores numéricos e matrizes definidos pela legislação aplicável a explosivos/pirotecnia.
///
/// Estes dados mudam por via legal/regulamentar (ADR, RFACEPE, Regulamento PSP). Sempre que a lei for
/// alterada, ALTERA-SE AQUI — um único sítio de fácil acesso. As regras de cálculo (motores de validação,
/// distâncias de segurança, etc.) consomem estes parâmetros e não devem repetir os números diretamente.
///
/// Referências:
/// - ADR 7.2.5 — matriz de co-armazenamento por grupo de compatibilidade.
/// - ADR 7.5.2.2 — co-armazenamento por divisão de risco (licença do paiol vs família do produto).
/// - RFACEPE / Regulamento PSP — distâncias mínimas de segurança.
/// </summary>
public static class ParametrosLegaisPirotecnia
{
    // ----------------------------------------------------------------------------------------------
    // Distâncias mínimas de segurança (metros) — RFACEPE / Regulamento PSP
    // ----------------------------------------------------------------------------------------------

    /// <summary>
    /// Distância mínima a habitações/edifícios por divisão de risco dominante.
    /// 50 m (1.4G), 100 m (1.3G), 300 m (1.1G); 50 m por defeito quando não há divisão definida.
    /// </summary>
    public static int DistanciaMinimaHabitacaoMetros(string? divisaoDominante)
    {
        if (string.IsNullOrWhiteSpace(divisaoDominante)) return 50;
        return divisaoDominante switch
        {
            "1.1G" => 300,
            "1.3G" => 100,
            _ => 50
        };
    }

    public const int DistanciaMinimaEstradaNacionalMetros = 25;
    public const int DistanciaMinimaAutoestradaMetros = 100;
    public const int DistanciaMinimaLinhaAltaTensaoMetros = 50;
    public const int DistanciaMinimaFlorestaMetros = 100;

    // ----------------------------------------------------------------------------------------------
    // Lotação / co-armazenamento do paiol — ADR
    // ----------------------------------------------------------------------------------------------

    /// <summary>
    /// Limite máximo de MLE (kg) do grupo C (pólvoras) tolerado no mesmo paiol que o grupo G — ADR sub-regra 4a.
    /// </summary>
    public const decimal LimiteMleGrupoCComGKg = 50m;

    /// <summary> Percentagem de ocupação do paiol a partir da qual se emite aviso de atenção. </summary>
    public const decimal OcupacaoAvisoAtencaoPercent = 80m;

    /// <summary> Percentagem de ocupação do paiol a partir da qual se considera "quase cheio". </summary>
    public const decimal OcupacaoQuaseCheioPercent = 90m;

    /// <summary>
    /// Hierarquia das divisões de risco, da mais perigosa para a menos perigosa.
    /// Usada para determinar a divisão dominante de um conjunto de produtos.
    /// </summary>
    public static readonly string[] HierarquiaDivisaoRisco = { "1.1", "1.2", "1.3", "1.4", "1.4S" };

    /// <summary>
    /// Matriz de compatibilidade de co-armazenamento por grupo de compatibilidade (ADR 7.2.5).
    /// true = os dois grupos podem coexistir no mesmo paiol.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, IReadOnlyDictionary<string, bool>> MatrizCompatibilidadeGrupos =
        new Dictionary<string, IReadOnlyDictionary<string, bool>>
        {
            ["B"] = new Dictionary<string, bool> { ["B"] = true, ["C"] = false, ["D"] = false, ["G"] = false, ["S"] = false },
            ["C"] = new Dictionary<string, bool> { ["B"] = false, ["C"] = true, ["D"] = false, ["G"] = true, ["S"] = true },
            ["D"] = new Dictionary<string, bool> { ["B"] = false, ["C"] = false, ["D"] = true, ["G"] = false, ["S"] = false },
            ["G"] = new Dictionary<string, bool> { ["B"] = false, ["C"] = true, ["D"] = false, ["G"] = true, ["S"] = true },
            ["S"] = new Dictionary<string, bool> { ["B"] = false, ["C"] = true, ["D"] = false, ["G"] = true, ["S"] = true }
        };

    /// <summary>
    /// Famílias de risco (sem sufixo G) que cada licença de paiol pode receber (ADR 7.5.2.2).
    /// Chave = divisão da licença do paiol; valor = divisões de produto aceites.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, string[]> LicencaPaiolAceitaFamilias =
        new Dictionary<string, string[]>
        {
            ["1.1"] = new[] { "1.1" },
            ["1.2"] = new[] { "1.2" },
            ["1.3"] = new[] { "1.3", "1.4", "1.4S" },
            ["1.4"] = new[] { "1.3", "1.4", "1.4S" },
            ["1.4S"] = new[] { "1.3", "1.4", "1.4S" },
            ["1.5"] = new[] { "1.1", "1.3", "1.4", "1.4S", "1.5" },
            ["1.6"] = new[] { "1.6" }
        };

    // ----------------------------------------------------------------------------------------------
    // Helpers de leitura (encapsulam as matrizes acima)
    // ----------------------------------------------------------------------------------------------

    /// <summary>Remove o sufixo "G" e espaços de uma divisão/família (ex.: "1.3G" → "1.3").</summary>
    public static string NormalizarDivisao(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor)) return valor ?? "";
        var t = valor.Trim();
        if (t.EndsWith("G", StringComparison.OrdinalIgnoreCase))
            return t[..^1].Trim();
        return t;
    }

    /// <summary>Normaliza o grupo de compatibilidade (1ª letra, maiúscula; "G" por defeito).</summary>
    public static string NormalizarGrupo(string? valor)
    {
        var g = (valor ?? "G").Trim().ToUpperInvariant();
        if (g.Length == 0) return "G";
        return g[..1];
    }

    /// <summary>Indica se dois grupos de compatibilidade podem coexistir no mesmo paiol (ADR 7.2.5).</summary>
    public static bool GruposPodemCoexistir(string? grupoExistente, string? grupoNovo)
    {
        var ge = NormalizarGrupo(grupoExistente);
        var gn = NormalizarGrupo(grupoNovo);
        if (!MatrizCompatibilidadeGrupos.TryGetValue(ge, out var linha) || !linha.TryGetValue(gn, out var compativel))
            return true;
        return compativel;
    }

    /// <summary>Indica se uma família de produto pode entrar num paiol com determinada licença (ADR 7.5.2.2).</summary>
    public static bool LicencaAceitaFamilia(string? licencaPaiol, string? familiaProduto)
    {
        if (string.IsNullOrWhiteSpace(licencaPaiol) || string.IsNullOrWhiteSpace(familiaProduto))
            return false;
        var licenca = NormalizarDivisao(licencaPaiol);
        var familia = NormalizarDivisao(familiaProduto);
        return LicencaPaiolAceitaFamilias.TryGetValue(licenca, out var aceites) && aceites.Contains(familia);
    }

    /// <summary>Devolve a divisão mais perigosa presente num conjunto (segundo a hierarquia legal).</summary>
    public static string DivisaoMaisPerigosa(IEnumerable<string> divisoes)
    {
        var lista = divisoes as ICollection<string> ?? divisoes.ToList();
        foreach (var d in HierarquiaDivisaoRisco)
        {
            if (lista.Contains(d))
                return d;
        }
        return lista.FirstOrDefault() ?? "";
    }
}
