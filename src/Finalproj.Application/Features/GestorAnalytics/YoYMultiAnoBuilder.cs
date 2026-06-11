using System.Globalization;
using Finalproj.Application.Features.GestorAnalytics.DTOs;

namespace Finalproj.Application.Features.GestorAnalytics;

/// <summary>
/// Comparação anual por mês civil (1 Jan – 31 Dez). Cada ano com dados gera uma série;
/// o ano corrente termina no mês actual.
/// </summary>
internal static class YoYMultiAnoBuilder
{
    public static ComparacaoAnualResponseDto Build(
        IReadOnlyList<(DateTime DataCriacao, decimal Peso)> contagens,
        IReadOnlyList<(DateTime DataCriacao, int EncomendaId, string ClienteNome, string ProdutoPrincipal)> detalhes,
        IReadOnlyList<(int Id, string Nome)> materiais,
        IReadOnlyList<(int Id, string Nome)> clientes,
        int? produtoIdFiltro,
        int? clienteIdFiltro,
        DateTime hojeUtc)
    {
        var hoje = DateTime.SpecifyKind(hojeUtc.Date, DateTimeKind.Utc);
        var anoAtual = hoje.Year;
        var cult = CultureInfo.GetCultureInfo("pt-PT");

        var porAnoMes = new Dictionary<(int Ano, int Mes), decimal>();
        foreach (var (data, peso) in contagens)
        {
            var k = (data.Year, data.Month);
            porAnoMes.TryGetValue(k, out var v);
            porAnoMes[k] = v + peso;
        }

        var anosDisponiveis = porAnoMes.Keys
            .Select(k => k.Ano)
            .Distinct()
            .OrderBy(y => y)
            .ToList();

        var detalhesPorAnoMes = detalhes
            .GroupBy(d => (d.DataCriacao.Year, d.DataCriacao.Month))
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<VolumeEncomendaDetalheDto>)g
                    .OrderByDescending(x => x.DataCriacao)
                    .Take(30)
                    .Select(x => new VolumeEncomendaDetalheDto
                    {
                        EncomendaId = x.EncomendaId,
                        ClienteNome = x.ClienteNome,
                        ProdutoPrincipal = x.ProdutoPrincipal,
                        DataCriacao = x.DataCriacao
                    })
                    .ToList());

        var series = new List<ComparacaoAnualSerieDto>();
        foreach (var ano in anosDisponiveis)
        {
            var pontos = new List<ComparacaoAnualPontoDto>();
            for (var mes = 1; mes <= 12; mes++)
            {
                var futuro = ano == anoAtual && mes > hoje.Month;
                porAnoMes.TryGetValue((ano, mes), out var peso);
                int? total = futuro ? null : (int)Math.Round(peso);

                detalhesPorAnoMes.TryGetValue((ano, mes), out var encs);

                pontos.Add(new ComparacaoAnualPontoDto
                {
                    Mes = mes,
                    Rotulo = CapitalizarMes(cult.DateTimeFormat.GetAbbreviatedMonthName(mes)),
                    Total = total,
                    Futuro = futuro,
                    Encomendas = encs ?? []
                });
            }

            series.Add(new ComparacaoAnualSerieDto { Ano = ano, Pontos = pontos });
        }

        return new ComparacaoAnualResponseDto
        {
            AnoAtual = anoAtual,
            AnosDisponiveis = anosDisponiveis,
            Series = series,
            Materiais = materiais.Select(m => new FiltroOpcaoDto { Id = m.Id, Nome = m.Nome }).ToList(),
            Clientes = clientes.Select(c => new FiltroOpcaoDto { Id = c.Id, Nome = c.Nome }).ToList(),
            ProdutoIdFiltro = produtoIdFiltro,
            ClienteIdFiltro = clienteIdFiltro
        };
    }

    private static string CapitalizarMes(string m) =>
        string.IsNullOrEmpty(m) ? m : char.ToUpper(m[0], CultureInfo.GetCultureInfo("pt-PT")) + m[1..];
}
