using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Repositories;

public sealed class CompiladoRepository(FinalprojContext context) : ICompiladoRepository
{
    private readonly FinalprojContext _context = context;

    public async Task<IReadOnlyList<Compilado>> ListAllWithItensProdutoAsync(CancellationToken cancellationToken = default) =>
        await _context.Compilados
            .AsNoTracking()
            .Include(c => c.Itens)
            .ThenInclude(i => i.Produto)
            .OrderBy(c => c.Nome)
            .ToListAsync(cancellationToken);

    public Task<Compilado?> GetByIdWithItensProdutoAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Compilados
            .AsNoTracking()
            .Include(c => c.Itens)
            .ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<Compilado?> FindTrackedByIdWithItensAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Compilados
            .Include(c => c.Itens)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task AddAsync(Compilado entity, CancellationToken cancellationToken = default) =>
        _context.Compilados.AddAsync(entity, cancellationToken).AsTask();

    public Task UpdateAsync(Compilado entity, CancellationToken cancellationToken = default)
    {
        _context.Compilados.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Compilado entity, CancellationToken cancellationToken = default)
    {
        _context.Compilados.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Compilados.AnyAsync(c => c.Id == id, cancellationToken);
}
