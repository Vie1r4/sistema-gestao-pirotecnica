using System.Globalization;
using Finalproj.Application.Features.GestorAnalytics.DTOs;
using Finalproj.Application.Features.GestorAnalytics.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.GestorAnalytics.Services;

public sealed class GestorAnalyticsService(IGestorAnalyticsRepository repo) : IGestorAnalyticsService
{
    public async Task<VolumeResponseDto> GetVolumeAsync(string granularidade, int dias, CancellationToken cancellationToken = default)
    {
        dias = Math.Clamp(dias, 7, 1095);
        var g = (granularidade ?? "dia").Trim().ToLowerInvariant();
        if (g is not ("dia" or "semana" or "mes" or "ano")) g = "dia";

        var ate = DateTime.UtcNow.Date.AddDays(1);
        var desde = ate.AddDays(-dias);
        // Inclui 1 ano a mais para comparação homóloga (mesmo período no ano anterior).
        var desdeQuery = desde.AddYears(-1);
        var rows = await repo.ListEncomendaDatasAsync(desdeQuery, cancellationToken);
        var detalhesAll = dias <= 180
            ? await repo.ListEncomendaVolumeDetalheAsync(desde, cancellationToken)
            : [];

        var buckets = new SortedDictionary<string, (string Rotulo, int Total)>();
        foreach (var row in rows)
        {
            var key = g switch
            {
                "ano" => row.DataCriacao.ToString("yyyy", CultureInfo.InvariantCulture),
                "semana" => $"{ISOWeek.GetYear(row.DataCriacao)}-W{ISOWeek.GetWeekOfYear(row.DataCriacao):D2}",
                "mes" => $"{row.DataCriacao:yyyy-MM}",
                _ => row.DataCriacao.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            };
            var rotulo = g switch
            {
                "ano" => row.DataCriacao.ToString("yyyy", CultureInfo.InvariantCulture),
                "semana" => $"S{ISOWeek.GetWeekOfYear(row.DataCriacao)} {ISOWeek.GetYear(row.DataCriacao)}",
                "mes" => row.DataCriacao.ToString("MMM yyyy", new CultureInfo("pt-PT")),
                _ => row.DataCriacao.ToString("dd MMM", new CultureInfo("pt-PT"))
            };
            if (!buckets.ContainsKey(key))
                buckets[key] = (rotulo, 0);
            buckets[key] = (rotulo, buckets[key].Total + 1);
        }

        // Buckets vazios são preenchidos no frontend (timeline do filtro + eixo temporal).

        var dailyForMa = rows
            .GroupBy(r => r.DataCriacao.Date)
            .ToDictionary(x => x.Key, x => x.Count());

        var periodos = new List<VolumePeriodoDto>();
        var keys = buckets.Keys.ToList();
        for (var i = 0; i < keys.Count; i++)
        {
            var key = keys[i];
            var (rotulo, total) = buckets[key];
            decimal? ma30 = null;
            if (g == "dia" && DateTime.TryParse(key, CultureInfo.InvariantCulture, DateTimeStyles.None, out var day))
            {
                var sum = 0;
                for (var d = 0; d < 30; d++)
                {
                    var dt = day.AddDays(-d);
                    if (dailyForMa.TryGetValue(dt, out var c)) sum += c;
                }
                ma30 = Math.Round((decimal)sum / 30, 2);
            }

            var detalhesPeriodo = detalhesAll
                .Where(d => PeriodoContemChave(d.DataCriacao, key, g))
                .Take(8)
                .Select(d => new VolumeEncomendaDetalheDto
                {
                    EncomendaId = d.EncomendaId,
                    ClienteNome = d.ClienteNome,
                    ProdutoPrincipal = d.ProdutoPrincipal,
                    DataCriacao = d.DataCriacao
                })
                .ToList();

            periodos.Add(new VolumePeriodoDto
            {
                Chave = key,
                Rotulo = rotulo,
                Total = total,
                VariacaoPct = null,
                MediaMovel30 = ma30,
                Detalhes = detalhesPeriodo
            });
        }

        return new VolumeResponseDto { Granularidade = g, Periodos = periodos };
    }

    public async Task<ComparacaoAnualResponseDto> GetComparacaoAnualAsync(
        string periodoId,
        int? produtoId,
        int? clienteId,
        CancellationToken cancellationToken = default)
    {
        var hoje = DateTime.UtcNow.Date;
        var anoAtual = hoje.Year;
        var anoAnt = anoAtual - 1;
        var pid = string.IsNullOrWhiteSpace(periodoId) ? "365" : periodoId.Trim();

        var desde = new DateTime(anoAnt, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var ate = hoje.AddDays(1);

        var contagens = await repo.ListYoYContagemAsync(desde, ate, cancellationToken, clienteId, produtoId);
        var produtosAnt = await repo.TopProdutosPorSemanaAnoAsync(anoAnt, cancellationToken, clienteId, produtoId);
        var materiais = (await repo.ListProdutosFiltroYoYAsync(anoAtual, cancellationToken))
            .Select(p => new FiltroOpcaoDto { Id = p.Id, Nome = p.Nome })
            .ToList();
        var clientes = (await repo.ListClientesFiltroYoYAsync(anoAtual, cancellationToken))
            .Select(c => new FiltroOpcaoDto { Id = c.Id, Nome = c.Nome })
            .ToList();

        return YoYHomologaBuilder.Build(
            pid,
            contagens,
            produtosAnt,
            materiais.Select(m => (m.Id, m.Nome)).ToList(),
            clientes.Select(c => (c.Id, c.Nome)).ToList(),
            produtoId,
            clienteId,
            hoje);
    }

    public async Task<PrevisaoResponseDto> GetPrevisaoAsync(int dias, decimal crescimentoPct, CancellationToken cancellationToken = default)
    {
        dias = dias is 30 or 60 or 90 ? dias : 30;
        var desde = DateTime.UtcNow.Date.AddMonths(-12);
        var rows = await repo.ListEncomendaDatasAsync(desde, cancellationToken);
        var porSemana = rows
            .GroupBy(r => (Ano: ISOWeek.GetYear(r.DataCriacao), Semana: ISOWeek.GetWeekOfYear(r.DataCriacao)))
            .Select(g => new { g.Key.Ano, g.Key.Semana, Total = g.Count() })
            .ToList();

        var media = porSemana.Count > 0 ? (decimal)porSemana.Average(x => x.Total) : 1m;
        var std = porSemana.Count > 1
            ? (decimal)Math.Sqrt(porSemana.Average(x => Math.Pow(x.Total - (double)media, 2)))
            : media * 0.2m;
        var factor = 1m + crescimentoPct / 100m;

        var historico = rows
            .GroupBy(r => r.DataCriacao.Date)
            .OrderBy(g => g.Key)
            .TakeLast(60)
            .Select(g => new PrevisaoPontoDto
            {
                Data = g.Key.ToString("yyyy-MM-dd"),
                Valor = g.Count(),
                Min = g.Count(),
                Max = g.Count()
            })
            .ToList();

        var previsao = new List<PrevisaoPontoDto>();
        var hoje = DateTime.UtcNow.Date;
        for (var i = 1; i <= dias; i++)
        {
            var dt = hoje.AddDays(i);
            var sem = ISOWeek.GetWeekOfYear(dt);
            var sazonal = porSemana.FirstOrDefault(x => x.Semana == sem)?.Total ?? (double)media;
            var val = (decimal)sazonal * factor;
            previsao.Add(new PrevisaoPontoDto
            {
                Data = dt.ToString("yyyy-MM-dd"),
                Valor = Math.Round(val, 1),
                Min = Math.Round(Math.Max(0, val - std), 1),
                Max = Math.Round(val + std, 1)
            });
        }

        var total14 = previsao.Take(14).Sum(p => p.Valor);
        var total14Int = (int)Math.Round(total14);

        return new PrevisaoResponseDto
        {
            Dias = dias,
            CrescimentoPct = crescimentoPct,
            Historico = historico,
            Previsao = previsao,
            TotalPrevisto14Dias = total14,
            ResumoDestaque = total14Int <= 0
                ? "Ainda não há base histórica suficiente para uma previsão fiável."
                : $"Prevemos cerca de {total14Int} encomendas nas próximas 2 semanas."
        };
    }

    public async Task<ConsumoClienteResponseDto> GetConsumoClienteAsync(
        int clienteId,
        DateOnly desde,
        DateOnly ate,
        int? produtoId,
        CancellationToken cancellationToken = default)
    {
        if (clienteId <= 0)
            throw new ArgumentException("O cliente é obrigatório.", nameof(clienteId));
        if (ate < desde)
            throw new ArgumentException("A data final deve ser igual ou posterior à data inicial.");
        if (ate.DayNumber - desde.DayNumber > 1095)
            throw new ArgumentException("O intervalo não pode exceder 3 anos.");

        var desdeUtc = DateTime.SpecifyKind(desde.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var ateUtc = DateTime.SpecifyKind(ate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc).AddDays(1);

        var clienteNome = await repo.GetClienteNomeAsync(clienteId, cancellationToken) ?? "—";
        var raw = await repo.ListConsumoClienteAsync(clienteId, desdeUtc, ateUtc, produtoId, cancellationToken);

        var linhas = raw.Select(r => new ConsumoClienteLinhaDto
        {
            EncomendaId = r.EncomendaId,
            DataCriacao = r.DataCriacao,
            Estado = r.Estado,
            ProdutoId = r.ProdutoId,
            ProdutoNome = r.ProdutoNome,
            Quantidade = r.Quantidade
        }).ToList();

        var ano = DateTime.UtcNow.Year;
        var materiais = (await repo.ListProdutosFiltroYoYAsync(ano, cancellationToken))
            .Select(p => new FiltroOpcaoDto { Id = p.Id, Nome = p.Nome })
            .ToList();
        var clientes = (await repo.ListClientesFiltroYoYAsync(ano, cancellationToken))
            .Select(c => new FiltroOpcaoDto { Id = c.Id, Nome = c.Nome })
            .ToList();

        return new ConsumoClienteResponseDto
        {
            ClienteId = clienteId,
            ClienteNome = clienteNome,
            Desde = desde.ToString("yyyy-MM-dd"),
            Ate = ate.ToString("yyyy-MM-dd"),
            ProdutoIdFiltro = produtoId,
            TotalQuantidade = linhas.Sum(l => l.Quantidade),
            TotalLinhas = linhas.Count,
            TotalEncomendas = linhas.Select(l => l.EncomendaId).Distinct().Count(),
            Linhas = linhas,
            Materiais = materiais,
            Clientes = clientes
        };
    }

    public async Task<TopClientesResponseDto> GetTopClientesAsync(int limite, CancellationToken cancellationToken = default)
    {
        limite = Math.Clamp(limite, 1, 50);
        var raw = await repo.TopClientesRawAsync(cancellationToken);
        var hoje = DateTime.UtcNow.Date;
        var recenteInicio = hoje.AddDays(-90);
        var anteriorInicio = hoje.AddDays(-180);
        var encRecentes = await repo.ListEncomendaDatasAsync(recenteInicio, cancellationToken);
        var encAnteriores = await repo.ListEncomendaDatasAsync(anteriorInicio, cancellationToken);

        List<TopClienteLinhaDto> MapTop(
            IEnumerable<(int ClienteId, string Nome, int TotalEncomendas, int TotalServicos, DateTime? Ultima)> src,
            Func<(int ClienteId, string Nome, int TotalEncomendas, int TotalServicos, DateTime? Ultima), int> metric,
            int lim) =>
            src
                .OrderByDescending(metric)
                .Take(lim)
                .Select(x =>
                {
                    var recent = encRecentes.Count(e => e.ClienteId == x.ClienteId && e.DataCriacao >= recenteInicio);
                    var ant = encAnteriores.Count(e => e.ClienteId == x.ClienteId && e.DataCriacao >= anteriorInicio && e.DataCriacao < recenteInicio);
                    var tendencia = recent > ant ? "subida" : recent < ant ? "descida" : "estavel";
                    return new TopClienteLinhaDto
                    {
                        ClienteId = x.ClienteId,
                        Nome = x.Nome,
                        Valor = metric(x),
                        TotalEncomendas = x.TotalEncomendas,
                        TotalServicos = x.TotalServicos,
                        UltimaEncomenda = x.Ultima?.ToString("yyyy-MM-dd"),
                        Tendencia = tendencia,
                        Risco = tendencia == "descida" && ant > 0
                    };
                })
                .ToList();

        return new TopClientesResponseDto
        {
            PorEncomendas = MapTop(raw, x => x.TotalEncomendas, limite),
            PorServicos = MapTop(raw, x => x.TotalServicos, limite)
        };
    }

    private static bool PeriodoContemChave(DateTime data, string chave, string granularidade) => granularidade switch
    {
        "ano" => data.ToString("yyyy", CultureInfo.InvariantCulture) == chave,
        "semana" => $"{ISOWeek.GetYear(data)}-W{ISOWeek.GetWeekOfYear(data):D2}" == chave,
        "mes" => data.ToString("yyyy-MM", CultureInfo.InvariantCulture) == chave,
        _ => data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) == chave
    };

    private static void FillMissingBuckets(
        SortedDictionary<string, (string Rotulo, int Total)> buckets,
        string g,
        DateTime desde,
        DateTime ate)
    {
        var cursor = desde.Date;
        while (cursor < ate)
        {
            var key = g switch
            {
                "semana" => $"{ISOWeek.GetYear(cursor)}-W{ISOWeek.GetWeekOfYear(cursor):D2}",
                "mes" => cursor.ToString("yyyy-MM", CultureInfo.InvariantCulture),
                _ => cursor.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            };
            if (!buckets.ContainsKey(key))
            {
                var rotulo = g switch
                {
                    "semana" => $"S{ISOWeek.GetWeekOfYear(cursor)} {ISOWeek.GetYear(cursor)}",
                    "mes" => cursor.ToString("MMM yyyy", new CultureInfo("pt-PT")),
                    _ => cursor.ToString("dd MMM", new CultureInfo("pt-PT"))
                };
                buckets[key] = (rotulo, 0);
            }
            cursor = g switch
            {
                "semana" => cursor.AddDays(7),
                "mes" => cursor.AddMonths(1),
                _ => cursor.AddDays(1)
            };
        }
    }
}
