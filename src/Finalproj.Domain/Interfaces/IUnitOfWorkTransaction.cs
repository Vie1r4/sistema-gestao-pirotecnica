namespace Finalproj.Domain.Interfaces;

/// <summary>Transação de persistência (commit/rollback explícitos).</summary>
public interface IUnitOfWorkTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
