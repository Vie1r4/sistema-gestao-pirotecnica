using Finalproj.Domain.Interfaces;
using Finalproj.Infrastructure.Persistence.Data;

namespace Finalproj.Infrastructure.Repositories;

public sealed class UnitOfWork(FinalprojContext context) : IUnitOfWork
{
    private readonly FinalprojContext _context = context;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
