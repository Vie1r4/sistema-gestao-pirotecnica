using Finalproj.Domain.Entities;
using Finalproj.Domain.Interfaces;
using Finalproj.Domain.Constants;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Repositories;

public sealed class PaiolRepository(FinalprojContext context) : IPaiolRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Paiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Paiol.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Paiol>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Paiol.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Paiol entity, CancellationToken cancellationToken = default) =>
        _context.Paiol.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Paiol entity, CancellationToken cancellationToken = default)
    {
        _context.Paiol.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Paiol entity, CancellationToken cancellationToken = default)
    {
        _context.Paiol.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default) =>
        _context.Paiol.CountAsync(p => p.Estado == estado, cancellationToken);

    public async Task<IReadOnlyList<Paiol>> ListByIdsOrderedAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
            return Array.Empty<Paiol>();
        return await _context.Paiol.AsNoTracking().Where(p => ids.Contains(p.Id)).OrderBy(p => p.Nome).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Paiol>> ListAllOrderedAsync(CancellationToken cancellationToken = default) =>
        await _context.Paiol.AsNoTracking().OrderBy(p => p.Nome).ToListAsync(cancellationToken);

    public async Task<Paiol?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Paiol.FindAsync(new object[] { id }, cancellationToken);

    public Task<Paiol?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Paiol
            .Include(p => p.DocumentosExtras)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Paiol.AnyAsync(p => p.Id == id, cancellationToken);
}

public sealed class ProdutoRepository(FinalprojContext context) : IProdutoRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Produto?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Produtos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Produto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Produtos.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Produto entity, CancellationToken cancellationToken = default) =>
        _context.Produtos.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Produto entity, CancellationToken cancellationToken = default)
    {
        _context.Produtos.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Produto entity, CancellationToken cancellationToken = default)
    {
        _context.Produtos.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<Produto>> SearchAsync(
        string? pesquisa,
        string? classificacao,
        string? grupoCompatibilidade,
        string? filtroTecnico,
        string? calibre,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Produtos.AsQueryable();
        if (!string.IsNullOrWhiteSpace(pesquisa))
            query = query.Where(p => p.Nome.Contains(pesquisa));
        if (!string.IsNullOrEmpty(classificacao))
            query = query.Where(p => p.FamiliaRisco == classificacao);
        if (!string.IsNullOrEmpty(grupoCompatibilidade))
            query = query.Where(p => p.GrupoCompatibilidade == grupoCompatibilidade);
        if (!string.IsNullOrEmpty(filtroTecnico))
            query = query.Where(p => p.FiltroTecnico == filtroTecnico);
        if (!string.IsNullOrEmpty(calibre))
            query = query.Where(p => p.Calibre == calibre);
        return await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);
    }

    public async Task<Produto?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Produtos.FindAsync(new object[] { id }, cancellationToken);

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Produtos.AnyAsync(p => p.Id == id, cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.Produtos.CountAsync(cancellationToken);
}

public sealed class EncomendaRepository(FinalprojContext context) : IEncomendaRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Encomenda?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Encomenda>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Encomenda entity, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Encomenda entity, CancellationToken cancellationToken = default)
    {
        _context.Encomendas.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Encomenda entity, CancellationToken cancellationToken = default)
    {
        _context.Encomendas.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<Encomenda?> GetByIdWithItensAndProdutosTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public Task<Encomenda?> GetByIdWithClienteAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Encomenda>> ListConcluidasComClienteExceptEncomendaIdsAsync(IReadOnlyCollection<int> encomendaIdsUsadas, CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Where(e => e.Estado == ConstantesEncomenda.CONCLUIDA && !encomendaIdsUsadas.Contains(e.Id))
            .OrderByDescending(e => e.DataConclusao)
            .ToListAsync(cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.Encomendas.CountAsync(cancellationToken);

    public Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default) =>
        _context.Encomendas.CountAsync(e => e.DataCriacao >= utcInclusiveStart, cancellationToken);

    public Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default) =>
        _context.Encomendas.CountAsync(e => e.Estado == estado, cancellationToken);

    public async Task<Dictionary<string, int>> CountGroupedByEstadoAsync(CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .GroupBy(e => e.Estado)
            .Select(g => new { Estado = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.Estado, x => x.Total, cancellationToken);

    public async Task<(IReadOnlyList<Encomenda> Items, int TotalRegistos)> ListPagedWithClienteAsync(
        string? estadoFiltro,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Encomendas.AsNoTracking().Include(e => e.Cliente).AsQueryable();
        if (!string.IsNullOrEmpty(estadoFiltro) && ConstantesEncomenda.TodosEstados.Contains(estadoFiltro))
            query = query.Where(e => e.Estado == estadoFiltro);

        query = query.OrderBy(e => e.DataEntrega == null)
            .ThenBy(e => e.DataEntrega ?? DateTime.MaxValue)
            .ThenByDescending(e => e.DataCriacao);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pagina - 1) * itensPorPagina).Take(itensPorPagina).ToListAsync(cancellationToken);
        return (items, total);
    }

    public Task<Encomenda?> GetByIdDetailNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public Task<Encomenda?> GetByIdWithClienteItensProdutoServicosNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .Include(e => e.Servicos)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public Task<Encomenda?> GetByIdWithClienteItensProdutoNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<Encomenda?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Encomendas.FindAsync(new object[] { id }, cancellationToken);

    public Task<Encomenda?> GetByIdWithItensTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Encomendas.Include(e => e.Itens).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Encomenda>> ListAtivasComItensProdutoByClienteAsync(int clienteId, CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .Where(e => e.ClienteId == clienteId && ConstantesEncomenda.EstadosComReserva.Contains(e.Estado))
            .OrderByDescending(e => e.DataCriacao)
            .ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<Encomenda> Items, int Total)> ListHistoricoClientePaginatedAsync(int clienteId, int pagina, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Encomendas.AsNoTracking()
            .Where(e => e.ClienteId == clienteId && (e.Estado == ConstantesEncomenda.CONCLUIDA || e.Estado == ConstantesEncomenda.REJEITADA))
            .OrderByDescending(e => e.DataConclusao ?? e.DataCriacao);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pagina - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<IReadOnlyList<Encomenda>> ListRecentWithClienteAsync(int take, CancellationToken cancellationToken = default) =>
        await _context.Encomendas.AsNoTracking()
            .Include(e => e.Cliente)
            .OrderByDescending(e => e.DataCriacao)
            .Take(take)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<(string MesKey, int Total)>> EncomendasPorMesUltimos6MesesAsync(CancellationToken cancellationToken = default)
    {
        var hoje = DateTime.UtcNow.Date;
        var primeiroDia = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
        var rows = await _context.Encomendas.AsNoTracking()
            .Where(e => e.DataCriacao >= primeiroDia && e.DataCriacao < hoje.AddMonths(1))
            .GroupBy(e => new { e.DataCriacao.Year, e.DataCriacao.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Count() })
            .ToListAsync(cancellationToken);

        var dict = rows.ToDictionary(x => $"{x.Year}-{x.Month:D2}", x => x.Total);
        return Enumerable.Range(0, 6)
            .Select(i =>
            {
                var data = primeiroDia.AddMonths(i);
                var key = $"{data.Year}-{data.Month:D2}";
                return (key, dict.GetValueOrDefault(key, 0));
            })
            .ToList();
    }
}

public sealed class ClienteRepository(FinalprojContext context) : IClienteRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Cliente>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Clientes.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Cliente entity, CancellationToken cancellationToken = default) =>
        _context.Clientes.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Cliente entity, CancellationToken cancellationToken = default)
    {
        _context.Clientes.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Cliente entity, CancellationToken cancellationToken = default)
    {
        _context.Clientes.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<Cliente>> SearchOrderedAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default)
    {
        var query = _context.Clientes.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(pesquisa))
        {
            var termo = pesquisa.Trim();
            query = query.Where(c =>
                c.Nome.Contains(termo) ||
                (c.Email != null && c.Email.Contains(termo)) ||
                (c.Telefone != null && c.Telefone.Contains(termo)) ||
                (c.NIF != null && c.NIF.Contains(termo)));
        }

        query = (ordenar ?? "nome") switch
        {
            "email" => query.OrderBy(c => c.Email ?? ""),
            "recentes" => query.OrderByDescending(c => c.DataRegisto ?? DateTime.MinValue),
            _ => query.OrderBy(c => c.Nome)
        };

        return await query.ToListAsync(cancellationToken);
    }

    public Task<Cliente?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Clientes.Include(c => c.DocumentosExtras).FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<Cliente?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Clientes.AsNoTracking().Include(c => c.DocumentosExtras).FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Cliente>> ListOrderedForSelectAsync(CancellationToken cancellationToken = default) =>
        await _context.Clientes.AsNoTracking().OrderBy(c => c.Nome).ToListAsync(cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.Clientes.CountAsync(cancellationToken);
}

public sealed class FuncionarioRepository(FinalprojContext context) : IFuncionarioRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Funcionario?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Funcionario>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Funcionario entity, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Funcionario entity, CancellationToken cancellationToken = default)
    {
        _context.Funcionarios.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Funcionario entity, CancellationToken cancellationToken = default)
    {
        _context.Funcionarios.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<Funcionario>> ListResponsaveisTecnicosOrdenadosAsync(CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking()
            .Where(f => !string.IsNullOrWhiteSpace(f.DocumentoADDRCaminho) && !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Funcionario>> ListEquipaComLicencaOperadorOrdenadosAsync(CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking()
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<int>> GetIdsComLicencaOperadorAsync(CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking()
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .Select(f => f.Id)
            .ToListAsync(cancellationToken);

    public Task<Funcionario?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.UserId == userId, cancellationToken);

    public async Task<Funcionario?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.FindAsync(new object[] { id }, cancellationToken);

    public Task<Funcionario?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public Task<Funcionario?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.AsNoTracking().Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Funcionario>> SearchOrderedAsync(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default)
    {
        var query = _context.Funcionarios.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(pesquisa))
        {
            var termo = pesquisa.Trim();
            query = query.Where(f =>
                f.NomeCompleto.Contains(termo) ||
                (f.Email != null && f.Email.Contains(termo)) ||
                (f.Telefone != null && f.Telefone.Contains(termo)) ||
                (f.NIF != null && f.NIF.Contains(termo)));
        }
        if (!string.IsNullOrEmpty(cargo))
            query = query.Where(f => f.Cargo == cargo);
        query = (ordenar ?? "nome") switch
        {
            "email" => query.OrderBy(f => f.Email ?? ""),
            "recentes" => query.OrderByDescending(f => f.DataRegisto ?? DateTime.MinValue),
            _ => query.OrderBy(f => f.NomeCompleto)
        };
        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, string>> GetNomesPorUserIdAsync(CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking()
            .Where(f => f.UserId != null)
            .ToDictionaryAsync(f => f.UserId!, f => f.NomeCompleto, cancellationToken);

    public async Task<IReadOnlyList<Funcionario>> ListDisponiveisParaUserAsync(string userId, CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.AsNoTracking()
            .Where(f => f.UserId == null || f.UserId == userId)
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Funcionario>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default) =>
        await _context.Funcionarios.Where(f => f.UserId == userId).ToListAsync(cancellationToken);

    public Task<string?> GetNomeCompletoByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        _context.Funcionarios.AsNoTracking()
            .Where(f => f.UserId == userId)
            .Select(f => f.NomeCompleto)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.Funcionarios.CountAsync(cancellationToken);
}

public sealed class ServicoRepository(FinalprojContext context) : IServicoRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Servico?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Servicos.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Servico>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Servicos.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(Servico entity, CancellationToken cancellationToken = default) =>
        _context.Servicos.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Servico entity, CancellationToken cancellationToken = default)
    {
        _context.Servicos.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Servico entity, CancellationToken cancellationToken = default)
    {
        _context.Servicos.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsParaEncomendaAsync(int encomendaId, int? excludeServicoId, CancellationToken cancellationToken = default)
    {
        var q = _context.Servicos.Where(s => s.EncomendaId == encomendaId);
        if (excludeServicoId.HasValue)
            q = q.Where(s => s.Id != excludeServicoId.Value);
        return await q.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<int>> GetEncomendaIdsAssociadasAsync(int? excludeServicoId, CancellationToken cancellationToken = default)
    {
        var q = _context.Servicos.AsNoTracking();
        if (excludeServicoId.HasValue)
            q = q.Where(s => s.Id != excludeServicoId.Value);
        return await q.Select(s => s.EncomendaId).ToListAsync(cancellationToken);
    }

    public async Task<Servico?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _context.Servicos.FindAsync(new object[] { id }, cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.Servicos.CountAsync(cancellationToken);

    public Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default) =>
        _context.Servicos.CountAsync(s => s.DataServico >= utcInclusiveStart.Date, cancellationToken);

    public async Task<(IReadOnlyList<Servico> Items, int Total)> ListPagedWithIncludesAsync(
        int? clienteId,
        DateTime? dataDesde,
        DateTime? dataAteExclusive,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Servicos.AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda).ThenInclude(e => e.Cliente)
            .Include(s => s.ResponsavelTecnico)
            .AsQueryable();
        if (clienteId.HasValue)
            query = query.Where(s => s.ClienteId == clienteId.Value);
        if (dataDesde.HasValue)
            query = query.Where(s => s.DataServico >= dataDesde.Value);
        if (dataAteExclusive.HasValue)
            query = query.Where(s => s.DataServico < dataAteExclusive.Value);

        query = query.OrderByDescending(s => s.DataServico);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pagina - 1) * itensPorPagina).Take(itensPorPagina).ToListAsync(cancellationToken);
        return (items, total);
    }

    public Task<Servico?> GetByIdFullGraphNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Servicos.AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda).ThenInclude(e => e.Cliente)
            .Include(s => s.ResponsavelTecnico)
            .Include(s => s.Equipa).ThenInclude(e => e.Funcionario)
            .Include(s => s.DocumentosExtras)
            .Include(s => s.Licencas)
            .Include(s => s.DistanciasSeguranca)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Servicos.AnyAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<(int Id, string Nome)>> ListClientesIdNomeOrderedAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Clientes.AsNoTracking()
            .OrderBy(c => c.Nome)
            .Select(c => new { c.Id, c.Nome })
            .ToListAsync(cancellationToken);
        return rows.Select(c => (c.Id, c.Nome)).ToList();
    }
}

public sealed class EntradaPaiolRepository(FinalprojContext context) : IEntradaPaiolRepository
{
    private readonly FinalprojContext _context = context;

    public Task<EntradaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.EntradasPaiol.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<IReadOnlyList<EntradaPaiol>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.EntradasPaiol.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(EntradaPaiol entity, CancellationToken cancellationToken = default) =>
        _context.EntradasPaiol.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(EntradaPaiol entity, CancellationToken cancellationToken = default)
    {
        _context.EntradasPaiol.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(EntradaPaiol entity, CancellationToken cancellationToken = default)
    {
        _context.EntradasPaiol.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<EntradaPaiol>> ListForPreparacaoByPaiolIdsWithIncludesAsync(IReadOnlyList<int> paiolIds, CancellationToken cancellationToken = default) =>
        await _context.EntradasPaiol
            .Include(e => e.Paiol)
            .Include(e => e.Produto)
            .Where(e => paiolIds.Contains(e.PaiolId))
            .ToListAsync(cancellationToken);

    public async Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.EntradasPaiol
            .GroupBy(e => e.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(e => e.Quantidade) })
            .ToListAsync(cancellationToken);
        return rows.ToDictionary(x => x.ProdutoId, x => x.Total);
    }

    public async Task<IReadOnlyList<EntradaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default) =>
        await _context.EntradasPaiol.AsNoTracking()
            .Include(e => e.Paiol)
            .Include(e => e.Produto)
            .OrderByDescending(e => e.DataEntrada)
            .Take(take)
            .ToListAsync(cancellationToken);

    public async Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumEntradasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default)
    {
        if (paiolIds.Count == 0)
            return [];
        var rows = await _context.EntradasPaiol.AsNoTracking()
            .Where(e => paiolIds.Contains(e.PaiolId))
            .GroupBy(e => new { e.PaiolId, e.ProdutoId })
            .Select(g => new { g.Key.PaiolId, g.Key.ProdutoId, Total = g.Sum(e => e.Quantidade) })
            .ToListAsync(cancellationToken);
        return rows.Select(x => (x.PaiolId, x.ProdutoId, x.Total)).ToList();
    }

    public async Task<(IReadOnlyList<EntradaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        var query = _context.EntradasPaiol.AsNoTracking()
            .Include(e => e.Paiol)
            .Include(e => e.Produto)
            .Where(e => paiolIds.Contains(e.PaiolId));
        if (paiolId.HasValue)
            query = query.Where(e => e.PaiolId == paiolId.Value);
        query = query.OrderByDescending(e => e.DataEntrada);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pagina - 1) * itensPorPagina).Take(itensPorPagina).ToListAsync(cancellationToken);
        return (items, total);
    }
}

public sealed class SaidaPaiolRepository(FinalprojContext context) : ISaidaPaiolRepository
{
    private readonly FinalprojContext _context = context;

    public Task<SaidaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.SaidasPaiol.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task<IReadOnlyList<SaidaPaiol>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.SaidasPaiol.AsNoTracking().ToListAsync(cancellationToken);

    public Task AddAsync(SaidaPaiol entity, CancellationToken cancellationToken = default) =>
        _context.SaidasPaiol.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(SaidaPaiol entity, CancellationToken cancellationToken = default)
    {
        _context.SaidasPaiol.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(SaidaPaiol entity, CancellationToken cancellationToken = default)
    {
        _context.SaidasPaiol.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyList<SaidaPaiol>> ListComEntradaPaiolReferenciadaAsync(CancellationToken cancellationToken = default) =>
        await _context.SaidasPaiol.Where(s => s.EntradaPaiolId != null).ToListAsync(cancellationToken);

    public async Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.SaidasPaiol
            .GroupBy(s => s.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(s => s.Quantidade) })
            .ToListAsync(cancellationToken);
        return rows.ToDictionary(x => x.ProdutoId, x => x.Total);
    }

    public async Task<IReadOnlyList<SaidaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default) =>
        await _context.SaidasPaiol.AsNoTracking()
            .Include(s => s.Paiol)
            .Include(s => s.Produto)
            .OrderByDescending(s => s.DataSaida)
            .Take(take)
            .ToListAsync(cancellationToken);

    public async Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumSaidasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default)
    {
        if (paiolIds.Count == 0)
            return [];
        var rows = await _context.SaidasPaiol.AsNoTracking()
            .Where(s => paiolIds.Contains(s.PaiolId))
            .GroupBy(s => new { s.PaiolId, s.ProdutoId })
            .Select(g => new { g.Key.PaiolId, g.Key.ProdutoId, Total = g.Sum(s => s.Quantidade) })
            .ToListAsync(cancellationToken);
        return rows.Select(x => (x.PaiolId, x.ProdutoId, x.Total)).ToList();
    }

    public Task<SaidaPaiol?> FindUltimaSaidaParaRotaAsync(int encomendaId, CancellationToken cancellationToken = default) =>
        _context.SaidasPaiol.AsNoTracking()
            .Include(s => s.Paiol)
            .Where(s => s.EncomendaId == encomendaId && s.Paiol.CoordenadasLat.HasValue && s.Paiol.CoordenadasLng.HasValue)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<(IReadOnlyList<SaidaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        var query = _context.SaidasPaiol.AsNoTracking()
            .Include(s => s.Paiol)
            .Include(s => s.Produto)
            .Where(s => paiolIds.Contains(s.PaiolId));
        if (paiolId.HasValue)
            query = query.Where(s => s.PaiolId == paiolId.Value);
        query = query.OrderByDescending(s => s.DataSaida);
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pagina - 1) * itensPorPagina).Take(itensPorPagina).ToListAsync(cancellationToken);
        return (items, total);
    }
}

public sealed class PerfilRepository(FinalprojContext context) : IPerfilRepository
{
    private readonly FinalprojContext _context = context;

    public Task<Perfil?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Perfis.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task AddAsync(Perfil entity, CancellationToken cancellationToken = default) =>
        _context.Perfis.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Perfil entity, CancellationToken cancellationToken = default)
    {
        _context.Perfis.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Perfil entity, CancellationToken cancellationToken = default)
    {
        _context.Perfis.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<Perfil?> GetByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default) =>
        _context.Perfis.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

    public Task<Perfil?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        _context.Perfis.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

    public Task<string?> GetNomeByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        _context.Perfis.AsNoTracking()
            .Where(p => p.UserId == userId)
            .Select(p => p.Nome)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<Perfil>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default) =>
        await _context.Perfis.Where(p => p.UserId == userId).ToListAsync(cancellationToken);

    public void RemoveRange(IEnumerable<Perfil> entities) =>
        _context.Perfis.RemoveRange(entities);
}

public sealed class LogSistemaRepository(FinalprojContext context) : ILogSistemaRepository
{
    private readonly FinalprojContext _context = context;

    public Task<LogSistema?> GetByIdAsync(long id, CancellationToken cancellationToken = default) =>
        _context.LogSistema.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public Task AddAsync(LogSistema entity, CancellationToken cancellationToken = default) =>
        _context.LogSistema.AddAsync(entity, cancellationToken).AsTask();

    public Task<int> CountAsync(CancellationToken cancellationToken = default) =>
        _context.LogSistema.CountAsync(cancellationToken);

    public async Task<(IReadOnlyList<(long Id, string? Acao, string? UserId, string? UserName, string? JsonDados, DateTime Timestamp)> Items, int Total)> ListPagedAsync(
        string? acaoFiltro,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default)
    {
        var query = _context.LogSistema.AsNoTracking().OrderByDescending(l => l.Timestamp).AsQueryable();
        if (!string.IsNullOrWhiteSpace(acaoFiltro))
            query = query.Where(l => l.Acao != null && l.Acao.Contains(acaoFiltro));
        var total = await query.CountAsync(cancellationToken);
        var rows = await query.Skip((pagina - 1) * itensPorPagina)
            .Take(itensPorPagina)
            .Select(l => new { l.Id, l.Acao, l.UserId, l.UserName, l.JsonDados, l.Timestamp })
            .ToListAsync(cancellationToken);
        return (rows.Select(l => (l.Id, (string?)l.Acao, l.UserId, l.UserName, l.JsonDados, l.Timestamp)).ToList(), total);
    }
}

public sealed class RefreshTokenRepository(FinalprojContext context) : IRefreshTokenRepository
{
    private readonly FinalprojContext _context = context;

    public Task<RefreshToken?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.RefreshTokens.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    public Task AddAsync(RefreshToken entity, CancellationToken cancellationToken = default) =>
        _context.RefreshTokens.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(RefreshToken entity, CancellationToken cancellationToken = default)
    {
        _context.RefreshTokens.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(RefreshToken entity, CancellationToken cancellationToken = default)
    {
        _context.RefreshTokens.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<RefreshToken?> FindActiveByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        _context.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash && r.RevokedAtUtc == null && r.ExpiresAtUtc > DateTime.UtcNow, cancellationToken);

    public Task<RefreshToken?> FindActiveOrRevokedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        _context.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash, cancellationToken);

    public async Task<IReadOnlyList<RefreshToken>> ListActiveByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default) =>
        await _context.RefreshTokens.Where(r => r.UserId == userId && r.RevokedAtUtc == null).ToListAsync(cancellationToken);
}

public sealed class ReservaRepository(FinalprojContext context) : IReservaRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<Dictionary<int, decimal>> SumQuantidadePorProdutoParaEstadosComReservaAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Reservas
            .Include(r => r.Encomenda)
            .Where(r => ConstantesEncomenda.EstadosComReserva.Contains(r.Encomenda.Estado))
            .GroupBy(r => r.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Total = g.Sum(r => r.Quantidade) })
            .ToListAsync(cancellationToken);
        return rows.ToDictionary(x => x.ProdutoId, x => x.Total);
    }

    public async Task<IReadOnlyList<Reserva>> ListByEncomendaIdTrackedAsync(int encomendaId, CancellationToken cancellationToken = default) =>
        await _context.Reservas.Where(r => r.EncomendaId == encomendaId).ToListAsync(cancellationToken);

    public Task AddAsync(Reserva entity, CancellationToken cancellationToken = default) =>
        _context.Reservas.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<Reserva> entities) =>
        _context.Reservas.RemoveRange(entities);
}

public sealed class ServicoDocumentoExtraRepository(FinalprojContext context) : IServicoDocumentoExtraRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<ServicoDocumentoExtra>> ListByServicoAndIdsAsync(int servicoId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await _context.ServicoDocumentoExtras
            .Where(d => d.ServicoId == servicoId && ids.Contains(d.Id))
            .ToListAsync(cancellationToken);

    public Task<ServicoDocumentoExtra?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default) =>
        _context.ServicoDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.ServicoId == servicoId && d.Id == id, cancellationToken);

    public Task AddAsync(ServicoDocumentoExtra entity, CancellationToken cancellationToken = default) =>
        _context.ServicoDocumentoExtras.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<ServicoDocumentoExtra> entities) =>
        _context.ServicoDocumentoExtras.RemoveRange(entities);
}

public sealed class ServicoEquipaRepository(FinalprojContext context) : IServicoEquipaRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<ServicoEquipa>> ListByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default) =>
        await _context.ServicoEquipas.Where(e => e.ServicoId == servicoId).ToListAsync(cancellationToken);

    public Task AddAsync(ServicoEquipa entity, CancellationToken cancellationToken = default) =>
        _context.ServicoEquipas.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<ServicoEquipa> entities) =>
        _context.ServicoEquipas.RemoveRange(entities);
}

public sealed class ServicoDistanciaSegurancaRepository(FinalprojContext context) : IServicoDistanciaSegurancaRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<TipoReferenciaDistancia>> ListTiposByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default) =>
        await _context.ServicoDistanciasSeguranca.AsNoTracking()
            .Where(d => d.ServicoId == servicoId)
            .Select(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);

    public Task AddAsync(ServicoDistanciaSeguranca entity, CancellationToken cancellationToken = default) =>
        _context.ServicoDistanciasSeguranca.AddAsync(entity, cancellationToken).AsTask();

    public Task<ServicoDistanciaSeguranca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.ServicoDistanciasSeguranca.FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public async Task<IReadOnlyList<ServicoDistanciaSeguranca>> ListByServicoIdOrderedNoTrackingAsync(int servicoId, CancellationToken cancellationToken = default) =>
        await _context.ServicoDistanciasSeguranca.AsNoTracking()
            .Where(d => d.ServicoId == servicoId)
            .OrderBy(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);
}

public sealed class PaiolAcessoRepository(FinalprojContext context) : IPaiolAcessoRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<int>> ListPaiolIdsByRoleNamesAsync(IReadOnlyCollection<string> roleNames, CancellationToken cancellationToken = default)
    {
        if (roleNames.Count == 0)
            return Array.Empty<int>();
        return await _context.PaiolAcessos.AsNoTracking()
            .Where(a => roleNames.Contains(a.RoleName))
            .Select(a => a.PaiolId)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<int>> ListAllPaiolIdsAsync(CancellationToken cancellationToken = default) =>
        await _context.Paiol.AsNoTracking().Select(p => p.Id).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<PaiolAcesso>> ListByPaiolIdTrackedAsync(int paiolId, CancellationToken cancellationToken = default) =>
        await _context.PaiolAcessos.Where(a => a.PaiolId == paiolId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<string>> ListRoleNamesByPaiolIdAsync(int paiolId, CancellationToken cancellationToken = default) =>
        await _context.PaiolAcessos.AsNoTracking().Where(a => a.PaiolId == paiolId).Select(a => a.RoleName).ToListAsync(cancellationToken);

    public Task AddAsync(PaiolAcesso entity, CancellationToken cancellationToken = default) =>
        _context.PaiolAcessos.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<PaiolAcesso> entities) =>
        _context.PaiolAcessos.RemoveRange(entities);
}

public sealed class ClienteDocumentoExtraRepository(FinalprojContext context) : IClienteDocumentoExtraRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<ClienteDocumentoExtra>> ListByClienteAndIdsAsync(int clienteId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await _context.ClienteDocumentoExtras
            .Where(d => d.ClienteId == clienteId && ids.Contains(d.Id))
            .ToListAsync(cancellationToken);

    public Task<ClienteDocumentoExtra?> GetByClienteAndIdNoTrackingAsync(int clienteId, int id, CancellationToken cancellationToken = default) =>
        _context.ClienteDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.ClienteId == clienteId && d.Id == id, cancellationToken);

    public Task<ClienteDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.ClienteDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public Task AddAsync(ClienteDocumentoExtra entity, CancellationToken cancellationToken = default) =>
        _context.ClienteDocumentoExtras.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<ClienteDocumentoExtra> entities) =>
        _context.ClienteDocumentoExtras.RemoveRange(entities);
}

public sealed class PaiolDocumentoExtraRepository(FinalprojContext context) : IPaiolDocumentoExtraRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<PaiolDocumentoExtra>> ListByPaiolAndIdsAsync(int paiolId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await _context.PaiolDocumentoExtras
            .Where(d => d.PaiolId == paiolId && ids.Contains(d.Id))
            .ToListAsync(cancellationToken);

    public Task<PaiolDocumentoExtra?> GetByPaiolAndIdNoTrackingAsync(int paiolId, int id, CancellationToken cancellationToken = default) =>
        _context.PaiolDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.PaiolId == paiolId && d.Id == id, cancellationToken);

    public Task<PaiolDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default) =>
        _context.PaiolDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

    public Task AddAsync(PaiolDocumentoExtra entity, CancellationToken cancellationToken = default) =>
        _context.PaiolDocumentoExtras.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<PaiolDocumentoExtra> entities) =>
        _context.PaiolDocumentoExtras.RemoveRange(entities);
}

public sealed class EncomendaItemRepository(FinalprojContext context) : IEncomendaItemRepository
{
    private readonly FinalprojContext _context = context;

    public Task AddAsync(EncomendaItem entity, CancellationToken cancellationToken = default) =>
        _context.EncomendaItems.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<EncomendaItem> entities) =>
        _context.EncomendaItems.RemoveRange(entities);

    public async Task<IReadOnlyList<EncomendaItem>> ListByEncomendaIdWithProdutoNoTrackingAsync(int encomendaId, CancellationToken cancellationToken = default) =>
        await _context.EncomendaItems.AsNoTracking()
            .Include(i => i.Produto)
            .Where(i => i.EncomendaId == encomendaId)
            .ToListAsync(cancellationToken);
}

public sealed class ServicoLicencaRepository(FinalprojContext context) : IServicoLicencaRepository
{
    private readonly FinalprojContext _context = context;

    public Task<ServicoLicenca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.ServicoLicencas.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public Task<ServicoLicenca?> FindByServicoAndIdTrackedAsync(int servicoId, int id, CancellationToken cancellationToken = default) =>
        _context.ServicoLicencas.FirstOrDefaultAsync(l => l.ServicoId == servicoId && l.Id == id, cancellationToken);

    public Task<ServicoLicenca?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default) =>
        _context.ServicoLicencas.AsNoTracking().FirstOrDefaultAsync(l => l.ServicoId == servicoId && l.Id == id, cancellationToken);

    public async Task<IReadOnlyList<ServicoLicenca>> ListByServicoIdTrackedAsync(int servicoId, CancellationToken cancellationToken = default) =>
        await _context.ServicoLicencas.Where(l => l.ServicoId == servicoId).ToListAsync(cancellationToken);

    public Task AddAsync(ServicoLicenca entity, CancellationToken cancellationToken = default) =>
        _context.ServicoLicencas.AddAsync(entity, cancellationToken).AsTask();

    public Task<ServicoLicenca?> FindByServicoTipoOrigemAsync(int servicoId, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, CancellationToken cancellationToken = default) =>
        _context.ServicoLicencas.FirstOrDefaultAsync(l => l.ServicoId == servicoId && l.TipoLicenca == tipo && l.OrigemRegisto == origem, cancellationToken);

    public Task<bool> ExistsOutroAsync(int servicoId, OrigemRegistoServicoLicenca origem, string? nomePersonalizado, CancellationToken cancellationToken = default) =>
        string.IsNullOrWhiteSpace(nomePersonalizado)
            ? _context.ServicoLicencas.AnyAsync(l => l.ServicoId == servicoId && l.TipoLicenca == TipoLicencaServico.OUTRO && l.OrigemRegisto == origem && string.IsNullOrWhiteSpace(l.NomePersonalizado), cancellationToken)
            : _context.ServicoLicencas.AnyAsync(l => l.ServicoId == servicoId && l.TipoLicenca == TipoLicencaServico.OUTRO && l.OrigemRegisto == origem && l.NomePersonalizado == nomePersonalizado, cancellationToken);
}

public sealed class FuncionarioDocumentoExtraRepository(FinalprojContext context) : IFuncionarioDocumentoExtraRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<FuncionarioDocumentoExtra>> ListByFuncionarioAndIdsAsync(int funcionarioId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await _context.FuncionarioDocumentoExtras
            .Where(d => d.FuncionarioId == funcionarioId && ids.Contains(d.Id))
            .ToListAsync(cancellationToken);

    public Task<FuncionarioDocumentoExtra?> GetByFuncionarioAndIdNoTrackingAsync(int funcionarioId, int id, CancellationToken cancellationToken = default) =>
        _context.FuncionarioDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(d => d.FuncionarioId == funcionarioId && d.Id == id, cancellationToken);

    public Task AddAsync(FuncionarioDocumentoExtra entity, CancellationToken cancellationToken = default) =>
        _context.FuncionarioDocumentoExtras.AddAsync(entity, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<FuncionarioDocumentoExtra> entities) =>
        _context.FuncionarioDocumentoExtras.RemoveRange(entities);
}
