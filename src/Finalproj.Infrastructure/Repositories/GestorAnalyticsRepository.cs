using System.Globalization;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Interfaces;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Repositories;

public sealed class GestorAnalyticsRepository(FinalprojContext context) : IGestorAnalyticsRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, int ClienteId)>> ListEncomendaDatasAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= desdeUtc && e.Estado != ConstantesEncomenda.REJEITADA)
            .Select(e => new ValueTuple<DateTime, int, int>(e.DataCriacao, e.Id, e.ClienteId))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, string ClienteNome, string ProdutoPrincipal)>> ListEncomendaVolumeDetalheAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default) =>
        await ListYoYEncomendaDetalheAsync(desdeUtc, DateTime.UtcNow.Date.AddDays(1), cancellationToken);

    public async Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, string ClienteNome, string ProdutoPrincipal)>> ListYoYEncomendaDetalheAsync(
        DateTime desdeUtc,
        DateTime ateUtc,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null)
    {
        var query = _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .Where(e => e.DataCriacao >= desdeUtc && e.DataCriacao < ateUtc
                && e.Estado != ConstantesEncomenda.REJEITADA
                && (!clienteId.HasValue || e.ClienteId == clienteId.Value));

        if (produtoId.HasValue)
            query = query.Where(e => e.Itens.Any(i => i.ProdutoId == produtoId.Value));

        return await query
            .OrderByDescending(e => e.DataCriacao)
            .Select(e => new ValueTuple<DateTime, int, string, string>(
                e.DataCriacao,
                e.Id,
                e.Cliente.Nome,
                e.Itens.OrderByDescending(i => i.QuantidadePedida).Select(i => i.Produto.Nome).FirstOrDefault() ?? "—"))
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountClientesRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default) =>
        _context.Clientes.AsNoTracking()
            .CountAsync(c => c.DataRegisto != null && c.DataRegisto >= desdeUtc, cancellationToken);

    public Task<int> CountEncomendasCreatedBetweenAsync(DateTime desdeUtc, DateTime ateUtc, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .CountAsync(e => e.DataCriacao >= desdeUtc && e.DataCriacao < ateUtc && e.Estado != ConstantesEncomenda.REJEITADA, cancellationToken);

    public async Task<IReadOnlyList<(DateTime DataCriacao, decimal Peso)>> ListYoYContagemAsync(
        DateTime desdeUtc,
        DateTime ateUtc,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null)
    {
        if (produtoId.HasValue)
        {
            var itens = await _context.EncomendaItems.AsNoTracking()
                .Include(i => i.Encomenda)
                .Where(i => i.Encomenda.DataCriacao >= desdeUtc && i.Encomenda.DataCriacao < ateUtc
                    && i.Encomenda.Estado != ConstantesEncomenda.REJEITADA
                    && i.ProdutoId == produtoId.Value
                    && (!clienteId.HasValue || i.Encomenda.ClienteId == clienteId.Value))
                .Select(i => new { i.Encomenda.DataCriacao, i.QuantidadePedida })
                .ToListAsync(cancellationToken);

            return itens
                .Select(i => (i.DataCriacao, i.QuantidadePedida))
                .ToList();
        }

        var rows = await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= desdeUtc && e.DataCriacao < ateUtc
                && e.Estado != ConstantesEncomenda.REJEITADA
                && (!clienteId.HasValue || e.ClienteId == clienteId.Value))
            .Select(e => e.DataCriacao)
            .ToListAsync(cancellationToken);

        return rows.Select(d => (d, 1m)).ToList();
    }

    public async Task<IReadOnlyList<(int Ano, int SemanaIso, int Total)>> CountEncomendasPorSemanaIsoAsync(
        int anoInicio,
        int anoFim,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null)
    {
        var desde = new DateTime(anoInicio, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var ate = new DateTime(anoFim + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        if (produtoId.HasValue)
        {
            var itens = await _context.EncomendaItems.AsNoTracking()
                .Include(i => i.Encomenda)
                .Where(i => i.Encomenda.DataCriacao >= desde && i.Encomenda.DataCriacao < ate
                    && i.Encomenda.Estado != ConstantesEncomenda.REJEITADA
                    && i.ProdutoId == produtoId.Value
                    && (!clienteId.HasValue || i.Encomenda.ClienteId == clienteId.Value))
                .Select(i => new { i.Encomenda.DataCriacao, i.QuantidadePedida })
                .ToListAsync(cancellationToken);

            return itens
                .GroupBy(i => (i.DataCriacao.Year, ISOWeek.GetWeekOfYear(i.DataCriacao)))
                .Select(g => (g.Key.Year, g.Key.Item2, (int)Math.Round(g.Sum(x => x.QuantidadePedida))))
                .ToList();
        }

        var rows = await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= desde && e.DataCriacao < ate && e.Estado != ConstantesEncomenda.REJEITADA
                && (!clienteId.HasValue || e.ClienteId == clienteId.Value))
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(e => (e.DataCriacao.Year, ISOWeek.GetWeekOfYear(e.DataCriacao)))
            .Select(g => (g.Key.Year, g.Key.Item2, g.Count()))
            .ToList();
    }

    public async Task<IReadOnlyList<(int SemanaIso, int ProdutoId, string ProdutoNome, decimal Quantidade)>> TopProdutosPorSemanaAnoAsync(
        int ano,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null)
    {
        var desde = new DateTime(ano, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var ate = new DateTime(ano + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var query = _context.EncomendaItems.AsNoTracking()
            .Include(i => i.Encomenda)
            .Include(i => i.Produto)
            .Where(i => i.Encomenda.DataCriacao >= desde && i.Encomenda.DataCriacao < ate
                && i.Encomenda.Estado != ConstantesEncomenda.REJEITADA);

        if (clienteId.HasValue)
            query = query.Where(i => i.Encomenda.ClienteId == clienteId.Value);
        if (produtoId.HasValue)
            query = query.Where(i => i.ProdutoId == produtoId.Value);

        var itens = await query
            .Select(i => new
            {
                Semana = ISOWeek.GetWeekOfYear(i.Encomenda.DataCriacao),
                i.ProdutoId,
                ProdutoNome = i.Produto.Nome,
                i.QuantidadePedida
            })
            .ToListAsync(cancellationToken);

        return itens
            .GroupBy(x => new { x.Semana, x.ProdutoId, x.ProdutoNome })
            .Select(g => (g.Key.Semana, g.Key.ProdutoId, g.Key.ProdutoNome, g.Sum(x => x.QuantidadePedida)))
            .ToList();
    }

    public async Task<IReadOnlyList<(int Id, string Nome)>> ListProdutosFiltroYoYAsync(
        int anoReferencia,
        CancellationToken cancellationToken = default)
    {
        var desde = new DateTime(anoReferencia - 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var ate = new DateTime(anoReferencia + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var linhas = await _context.EncomendaItems.AsNoTracking()
            .Where(i => i.Encomenda.DataCriacao >= desde && i.Encomenda.DataCriacao < ate
                && i.Encomenda.Estado != ConstantesEncomenda.REJEITADA)
            .Select(i => new { i.ProdutoId, Nome = i.Produto.Nome })
            .ToListAsync(cancellationToken);

        var deEncomendas = linhas
            .GroupBy(x => x.ProdutoId)
            .Select(g => (Id: g.Key, Nome: g.Select(x => x.Nome).FirstOrDefault() ?? ""))
            .Where(x => !string.IsNullOrWhiteSpace(x.Nome));

        var catalogo = await _context.Produtos.AsNoTracking()
            .Select(p => new { p.Id, p.Nome })
            .ToListAsync(cancellationToken);

        var merged = catalogo.ToDictionary(p => p.Id, p => p.Nome);
        foreach (var item in deEncomendas)
            merged[item.Id] = item.Nome;

        return merged
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .OrderBy(kv => kv.Value)
            .Select(kv => (kv.Key, kv.Value))
            .ToList();
    }

    public async Task<IReadOnlyList<(int Id, string Nome)>> ListClientesFiltroYoYAsync(
        int anoReferencia,
        CancellationToken cancellationToken = default)
    {
        var desde = new DateTime(anoReferencia - 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var ate = new DateTime(anoReferencia + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var linhas = await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= desde && e.DataCriacao < ate && e.Estado != ConstantesEncomenda.REJEITADA)
            .Select(e => new { e.ClienteId, Nome = e.Cliente.Nome })
            .ToListAsync(cancellationToken);

        var deEncomendas = linhas
            .GroupBy(x => x.ClienteId)
            .Select(g => (Id: g.Key, Nome: g.Select(x => x.Nome).FirstOrDefault() ?? ""))
            .Where(x => !string.IsNullOrWhiteSpace(x.Nome));

        var catalogo = await _context.Clientes.AsNoTracking()
            .Select(c => new { c.Id, c.Nome })
            .ToListAsync(cancellationToken);

        var merged = catalogo.ToDictionary(c => c.Id, c => c.Nome);
        foreach (var item in deEncomendas)
            merged[item.Id] = item.Nome;

        return merged
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .OrderBy(kv => kv.Value)
            .Select(kv => (kv.Key, kv.Value))
            .ToList();
    }

    public Task<Dictionary<string, int>> CountAtivosPorEstadoAsync(CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .Where(e => e.Estado != ConstantesEncomenda.REJEITADA && e.Estado != ConstantesEncomenda.CONCLUIDA)
            .GroupBy(e => e.Estado)
            .Select(g => new { Estado = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.Estado, x => x.Total, cancellationToken);

    public Task<int> CountConcluidasDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .CountAsync(e => e.Estado == ConstantesEncomenda.CONCLUIDA && e.DataConclusao >= desdeUtc, cancellationToken);

    public async Task<IReadOnlyList<(string Estado, double Horas)>> ListTemposPorEstadoAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default)
    {
        var rows = await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= desdeUtc)
            .Select(e => new
            {
                e.Estado,
                e.DataCriacao,
                e.DataAceite,
                e.DataEmPreparacao,
                e.DataConclusao
            })
            .ToListAsync(cancellationToken);

        var result = new List<(string, double)>();
        foreach (var e in rows.Where(x => x.Estado == ConstantesEncomenda.PENDENTE && x.DataAceite.HasValue))
            result.Add((ConstantesEncomenda.PENDENTE, (e.DataAceite!.Value - e.DataCriacao).TotalHours));
        foreach (var e in rows.Where(x => x.Estado == ConstantesEncomenda.ACEITE && x.DataEmPreparacao.HasValue && x.DataAceite.HasValue))
            result.Add((ConstantesEncomenda.ACEITE, (e.DataEmPreparacao!.Value - e.DataAceite!.Value).TotalHours));
        foreach (var e in rows.Where(x => x.Estado == ConstantesEncomenda.EM_PREPARACAO && x.DataConclusao.HasValue && x.DataEmPreparacao.HasValue))
            result.Add((ConstantesEncomenda.EM_PREPARACAO, (e.DataConclusao!.Value - e.DataEmPreparacao!.Value).TotalHours));
        foreach (var e in rows.Where(x => x.Estado == ConstantesEncomenda.CONCLUIDA && x.DataConclusao.HasValue))
        {
            var inicio = e.DataEmPreparacao ?? e.DataAceite ?? e.DataCriacao;
            result.Add((ConstantesEncomenda.CONCLUIDA, (e.DataConclusao!.Value - inicio).TotalHours));
        }
        return result;
    }

    public async Task<IReadOnlyList<(int ClienteId, string Nome, DateTime DataCriacao, int EncomendaId)>> ListEncomendasConcluidasClienteAsync(
        CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Where(e => e.Estado == ConstantesEncomenda.CONCLUIDA)
            .OrderBy(e => e.ClienteId)
            .ThenBy(e => e.DataCriacao)
            .Select(e => new ValueTuple<int, string, DateTime, int>(e.ClienteId, e.Cliente.Nome, e.DataCriacao, e.Id))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<(int ClienteId, string Nome, int TotalEncomendas, int TotalServicos, DateTime? UltimaEncomenda)>> TopClientesRawAsync(
        CancellationToken cancellationToken = default)
    {
        var enc = await _context.Encomendas.AsNoTracking()
            .Where(e => e.Estado != ConstantesEncomenda.REJEITADA)
            .GroupBy(e => e.ClienteId)
            .Select(g => new { ClienteId = g.Key, Total = g.Count(), Ultima = g.Max(x => x.DataCriacao) })
            .ToListAsync(cancellationToken);

        var srv = await _context.Servicos.AsNoTracking()
            .GroupBy(s => s.ClienteId)
            .Select(g => new { ClienteId = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.ClienteId, x => x.Total, cancellationToken);

        var nomes = await _context.Clientes.AsNoTracking()
            .Select(c => new { c.Id, c.Nome })
            .ToDictionaryAsync(x => x.Id, x => x.Nome, cancellationToken);

        return enc.Select(e => (
            e.ClienteId,
            nomes.GetValueOrDefault(e.ClienteId, $"Cliente {e.ClienteId}"),
            e.Total,
            srv.GetValueOrDefault(e.ClienteId, 0),
            (DateTime?)e.Ultima
        )).ToList();
    }

    private static readonly string[] EstadosAtivos =
    [
        ConstantesEncomenda.PENDENTE,
        ConstantesEncomenda.ACEITE,
        ConstantesEncomenda.EM_PREPARACAO
    ];

    public async Task<IReadOnlyList<(int EncomendaId, int ClienteId, string ClienteNome, string? Localidade, string Estado, DateTime DataCriacao, DateTime? DataEntrega, string? ProdutoNome)>> ListEncomendasOperacionaisAsync(
        string? estado,
        int? clienteId,
        string? localidade,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default)
    {
        var query = BuildOperacionalQuery(estado, clienteId, localidade);
        var rows = await query
            .OrderBy(e => e.DataEntrega == null)
            .ThenBy(e => e.DataEntrega ?? DateTime.MaxValue)
            .ThenByDescending(e => e.DataCriacao)
            .Skip((pagina - 1) * itensPorPagina)
            .Take(itensPorPagina)
            .Select(e => new
            {
                e.Id,
                e.ClienteId,
                ClienteNome = e.Cliente.Nome,
                e.Cliente.Localidade,
                e.Estado,
                e.DataCriacao,
                e.DataEntrega,
                ProdutoNome = e.Itens.OrderByDescending(i => i.QuantidadePedida).Select(i => i.Produto.Nome).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return rows.Select(r => (
            r.Id,
            r.ClienteId,
            r.ClienteNome,
            r.Localidade,
            r.Estado,
            r.DataCriacao,
            r.DataEntrega,
            r.ProdutoNome
        )).ToList();
    }

    public Task<int> CountEncomendasOperacionaisAsync(
        string? estado,
        int? clienteId,
        string? localidade,
        CancellationToken cancellationToken = default) =>
        BuildOperacionalQuery(estado, clienteId, localidade).CountAsync(cancellationToken);

    private IQueryable<Domain.Entities.Encomenda> BuildOperacionalQuery(string? estado, int? clienteId, string? localidade)
    {
        var query = _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .Where(e => EstadosAtivos.Contains(e.Estado));

        if (!string.IsNullOrWhiteSpace(estado) && ConstantesEncomenda.TodosEstados.Contains(estado))
            query = query.Where(e => e.Estado == estado);
        if (clienteId.HasValue)
            query = query.Where(e => e.ClienteId == clienteId.Value);
        if (!string.IsNullOrWhiteSpace(localidade))
            query = query.Where(e => e.Cliente.Localidade != null && e.Cliente.Localidade.Contains(localidade));
        return query;
    }

    public async Task BackfillTimestampsFromLogsAsync(CancellationToken cancellationToken = default)
    {
        var semAceite = await _context.Encomendas
            .Where(e => e.DataAceite == null && (e.Estado == ConstantesEncomenda.ACEITE
                || e.Estado == ConstantesEncomenda.EM_PREPARACAO || e.Estado == ConstantesEncomenda.CONCLUIDA))
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);

        if (semAceite.Count > 0)
        {
            var logsAceite = await _context.LogSistema.AsNoTracking()
                .Where(l => l.Acao == "ENCOMENDA_ACEITE")
                .OrderBy(l => l.Timestamp)
                .ToListAsync(cancellationToken);

            var porEncomenda = new Dictionary<int, DateTime>();
            foreach (var log in logsAceite)
            {
                var id = TryGetEncomendaId(log.JsonDados);
                if (id.HasValue && !porEncomenda.ContainsKey(id.Value))
                    porEncomenda[id.Value] = log.Timestamp;
            }

            foreach (var encId in semAceite)
            {
                if (!porEncomenda.TryGetValue(encId, out var ts)) continue;
                var enc = await _context.Encomendas.FindAsync(new object[] { encId }, cancellationToken);
                if (enc != null) enc.DataAceite = ts;
            }
        }

        var semPrep = await _context.Encomendas
            .Where(e => e.DataEmPreparacao == null && (e.Estado == ConstantesEncomenda.EM_PREPARACAO || e.Estado == ConstantesEncomenda.CONCLUIDA))
            .ToListAsync(cancellationToken);

        foreach (var enc in semPrep)
        {
            if (enc.DataConclusao.HasValue && enc.DataAceite.HasValue)
                enc.DataEmPreparacao = enc.DataAceite.Value.AddHours(
                    Math.Max(0, (enc.DataConclusao.Value - enc.DataAceite.Value).TotalHours * 0.3));
            else if (enc.DataAceite.HasValue)
                enc.DataEmPreparacao = enc.DataAceite.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<string?> GetClienteNomeAsync(int clienteId, CancellationToken cancellationToken = default) =>
        _context.Clientes.AsNoTracking()
            .Where(c => c.Id == clienteId)
            .Select(c => c.Nome)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<(
        int EncomendaId,
        DateTime DataCriacao,
        string Estado,
        int ProdutoId,
        string ProdutoNome,
        decimal Quantidade)>> ListConsumoClienteAsync(
        int clienteId,
        DateTime desdeUtc,
        DateTime ateUtc,
        int? produtoId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.EncomendaItems.AsNoTracking()
            .Where(i => i.Encomenda.ClienteId == clienteId
                && i.Encomenda.DataCriacao >= desdeUtc
                && i.Encomenda.DataCriacao < ateUtc
                && i.Encomenda.Estado != ConstantesEncomenda.REJEITADA
                && (!produtoId.HasValue || i.ProdutoId == produtoId.Value));

        return await query
            .OrderByDescending(i => i.Encomenda.DataCriacao)
            .ThenByDescending(i => i.EncomendaId)
            .ThenBy(i => i.Produto.Nome)
            .Select(i => new ValueTuple<int, DateTime, string, int, string, decimal>(
                i.EncomendaId,
                i.Encomenda.DataCriacao,
                i.Encomenda.Estado,
                i.ProdutoId,
                i.Produto.Nome,
                i.QuantidadePedida))
            .ToListAsync(cancellationToken);
    }

    private static int? TryGetEncomendaId(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("encomenda_id", out var el))
                return el.GetInt32();
        }
        catch { /* ignore */ }
        return null;
    }
}
