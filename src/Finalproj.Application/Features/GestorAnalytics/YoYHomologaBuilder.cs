using System.Globalization;
using Finalproj.Application.Features.GestorAnalytics.DTOs;

namespace Finalproj.Application.Features.GestorAnalytics;

/// <summary>
/// Eixo X fixo (slots) + preenchimento homólogo: sempre ano civil actual vs anterior.
/// </summary>
internal static class YoYHomologaBuilder
{
    private sealed record Slot(string Chave, string Rotulo, DateTime RefUtc, bool Futuro, int Indice);

    public static ComparacaoAnualResponseDto Build(
        string periodoId,
        IReadOnlyList<(DateTime DataCriacao, decimal Peso)> contagens,
        IReadOnlyList<(int SemanaIso, int ProdutoId, string ProdutoNome, decimal Quantidade)> produtosAnoAnterior,
        IReadOnlyList<(int Id, string Nome)> materiais,
        IReadOnlyList<(int Id, string Nome)> clientes,
        int? produtoIdFiltro,
        int? clienteIdFiltro,
        DateTime hojeUtc)
    {
        var hoje = DateTime.SpecifyKind(hojeUtc.Date, DateTimeKind.Utc);
        var anoAtual = hoje.Year;
        var anoAnterior = anoAtual - 1;
        var slots = BuildSlots(periodoId, hoje);
        var porChave = AgruparContagens(contagens);

        var semanas = new List<ComparacaoAnualSemanaDto>();
        foreach (var slot in slots)
        {
            var chaveAnt = ChaveHomologa(slot.Chave, anoAnterior);
            porChave.TryGetValue(slot.Chave, out var pesoAtual);
            porChave.TryGetValue(chaveAnt, out var pesoAnt);

            var atual = slot.Futuro ? 0 : (int)Math.Round(pesoAtual);
            var ant = (int)Math.Round(pesoAnt);

            semanas.Add(new ComparacaoAnualSemanaDto
            {
                Semana = slot.Indice,
                Chave = slot.Chave,
                Rotulo = slot.Rotulo,
                Futuro = slot.Futuro,
                Atual = atual,
                AnoAnterior = ant,
                ProdutoDestaque = null,
                QuantidadeDestaque = 0
            });
        }

        var semanasAnt = porChave
            .Where(kv => kv.Key.Contains("-W", StringComparison.Ordinal)
                && kv.Key.StartsWith(anoAnterior.ToString(), StringComparison.Ordinal))
            .ToDictionary(kv => ExtrairSemanaIso(kv.Key), kv => (int)Math.Round(kv.Value));

        var limiar = semanasAnt.Values.DefaultIfEmpty(0).Any(v => v > 0)
            ? (int)(semanasAnt.Values.Where(v => v > 0).DefaultIfEmpty(0).Average() * 1.5)
            : 10;

        var zonas = semanasAnt
            .Where(kv => kv.Value >= limiar && kv.Key >= 1 && kv.Key <= 52)
            .OrderByDescending(kv => kv.Value)
            .Take(8)
            .Select(kv =>
            {
                var w = kv.Key;
                var temProd = produtosAnoAnterior
                    .Where(p => p.SemanaIso == w)
                    .OrderByDescending(p => p.Quantidade)
                    .FirstOrDefault();
                return new ZonaPicoDto
                {
                    SemanaInicio = w,
                    SemanaFim = w,
                    Texto = temProd.ProdutoNome != null
                        ? $"Semana {w} ({anoAnterior}): ~{(int)temProd.Quantidade} un. {temProd.ProdutoNome}"
                        : $"Semana {w} ({anoAnterior}): pico de volume — prepara stock"
                };
            })
            .ToList();

        if (periodoId is not ("1095" or "365" or "730"))
            zonas = [];

        return new ComparacaoAnualResponseDto
        {
            Ano = anoAtual,
            AnoAnterior = anoAnterior,
            Semanas = semanas,
            ZonasPico = zonas,
            Materiais = materiais.Select(m => new FiltroOpcaoDto { Id = m.Id, Nome = m.Nome }).ToList(),
            Clientes = clientes.Select(c => new FiltroOpcaoDto { Id = c.Id, Nome = c.Nome }).ToList(),
            ProdutoIdFiltro = produtoIdFiltro,
            ClienteIdFiltro = clienteIdFiltro
        };
    }

    private static List<Slot> BuildSlots(string periodoId, DateTime hoje)
    {
        var ano = hoje.Year;
        var cult = CultureInfo.GetCultureInfo("pt-PT");
        var list = new List<Slot>();
        var idx = 0;

        switch (periodoId)
        {
            case "7":
                for (var d = 6; d >= 0; d--)
                {
                    var dt = hoje.AddDays(-d);
                    var futuro = dt.Date > hoje.Date;
                    list.Add(new Slot(
                        ChaveDia(dt),
                        dt.ToString("d MMM", cult),
                        dt,
                        futuro,
                        ++idx));
                }
                break;

            case "30":
                AddSemanasRolling(list, ref idx, hoje, 30, cult);
                break;

            case "90":
                AddSemanasRolling(list, ref idx, hoje, 90, cult);
                break;

            case "180":
                AddMesesRolling(list, ref idx, hoje, 6, cult);
                break;

            case "365":
                AddMesesRolling(list, ref idx, hoje, 12, cult);
                break;

            case "730":
                for (var m = 1; m <= 12; m++)
                {
                    var dt = new DateTime(ano, m, 1, 0, 0, 0, DateTimeKind.Utc);
                    var futuro = dt.Year == ano && m > hoje.Month;
                    list.Add(new Slot(
                        ChaveMes(dt),
                        CapitalizarMes(dt.ToString("MMM", cult)),
                        dt,
                        futuro,
                        ++idx));
                }
                break;

            case "1095":
                for (var w = 1; w <= 52; w++)
                {
                    var dt = InicioSemanaIsoUtc(ano, w);
                    var futuro = SemanaFuturaNoAno(ano, w, hoje);
                    list.Add(new Slot(
                        ChaveSemana(dt),
                        dt.ToString("d MMM", cult),
                        dt,
                        futuro,
                        ++idx));
                }
                break;

            default:
                AddMesesRolling(list, ref idx, hoje, 12, cult);
                break;
        }

        return list;
    }

    private static void AddSemanasRolling(List<Slot> list, ref int idx, DateTime hoje, int dias, CultureInfo cult)
    {
        var inicio = hoje.AddDays(-dias + 1);
        var cursor = InicioSemanaIsoUtc(inicio);
        while (cursor <= hoje)
        {
            var futuro = cursor.Date > hoje.Date;
            list.Add(new Slot(ChaveSemana(cursor), cursor.ToString("d MMM", cult), cursor, futuro, ++idx));
            cursor = cursor.AddDays(7);
        }
    }

    private static void AddMesesRolling(List<Slot> list, ref int idx, DateTime hoje, int meses, CultureInfo cult)
    {
        var cursor = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(meses - 1));
        var fim = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        while (cursor <= fim)
        {
            var futuro = cursor.Year > hoje.Year
                || (cursor.Year == hoje.Year && cursor.Month > hoje.Month);
            list.Add(new Slot(
                ChaveMes(cursor),
                CapitalizarMes(cursor.ToString("MMM", cult)),
                cursor,
                futuro,
                ++idx));
            cursor = cursor.AddMonths(1);
        }
    }

    private static bool SemanaFuturaNoAno(int ano, int semanaIso, DateTime hoje)
    {
        if (ano != hoje.Year) return false;
        var semanaAtual = ISOWeek.GetWeekOfYear(hoje);
        return semanaIso > semanaAtual;
    }

    private static DateTime InicioSemanaIsoUtc(int ano, int semana)
    {
        var thursday = ISOWeek.ToDateTime(ano, semana, DayOfWeek.Thursday);
        return DateTime.SpecifyKind(thursday.AddDays(-3), DateTimeKind.Utc).Date;
    }

    private static DateTime InicioSemanaIsoUtc(DateTime d) =>
        DateTime.SpecifyKind(d.AddDays(-(((int)d.DayOfWeek + 6) % 7)), DateTimeKind.Utc).Date;

    private static string ChaveDia(DateTime d) => d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string ChaveMes(DateTime d) => d.ToString("yyyy-MM", CultureInfo.InvariantCulture);

    private static string ChaveSemana(DateTime d) =>
        $"{ISOWeek.GetYear(d)}-W{ISOWeek.GetWeekOfYear(d):D2}";

    private static string ChaveHomologa(string chave, int anoAnterior)
    {
        if (chave.Length == 10 && chave[4] == '-')
            return $"{anoAnterior}{chave[4..]}";
        if (chave.Length == 7 && chave[4] == '-')
            return $"{anoAnterior}{chave[4..]}";
        if (chave.Contains("-W", StringComparison.Ordinal))
        {
            var parts = chave.Split("-W");
            if (parts.Length == 2)
                return $"{anoAnterior}-W{parts[1]}";
        }
        return chave;
    }

    private static Dictionary<string, decimal> AgruparContagens(
        IReadOnlyList<(DateTime DataCriacao, decimal Peso)> contagens)
    {
        var dict = new Dictionary<string, decimal>(StringComparer.Ordinal);
        foreach (var (data, peso) in contagens)
        {
            var utc = DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
            foreach (var chave in new[]
                     {
                         ChaveDia(utc),
                         ChaveMes(utc),
                         ChaveSemana(utc)
                     })
            {
                dict.TryGetValue(chave, out var v);
                dict[chave] = v + peso;
            }
        }
        return dict;
    }

    private static string CapitalizarMes(string m) =>
        string.IsNullOrEmpty(m) ? m : char.ToUpper(m[0], CultureInfo.GetCultureInfo("pt-PT")) + m[1..];

    private static int ExtrairSemanaIso(string chave)
    {
        var m = System.Text.RegularExpressions.Regex.Match(chave, @"-W(\d{2})$");
        return m.Success ? int.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) : 0;
    }
}
