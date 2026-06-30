namespace Finalproj.Domain.Interfaces;

/// <summary>
/// Unit of Work: persiste alterações acumuladas no contexto de persistência (SaveChanges).
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Inicia transação relacional; em InMemory devolve no-op (sem isolamento real).</summary>
    Task<IUnitOfWorkTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
}
