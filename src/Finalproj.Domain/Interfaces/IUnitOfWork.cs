namespace Finalproj.Domain.Interfaces;

/// <summary>
/// Unit of Work: persiste alterações acumuladas no contexto de persistência (SaveChanges).
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
