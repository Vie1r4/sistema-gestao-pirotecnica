namespace Finalproj.Domain.Interfaces.Repositories;

public interface IFuncionarioDocumentoExtraRepository
{
    Task<IReadOnlyList<FuncionarioDocumentoExtra>> ListByFuncionarioAndIdsAsync(int funcionarioId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<FuncionarioDocumentoExtra?> GetByFuncionarioAndIdNoTrackingAsync(int funcionarioId, int id, CancellationToken cancellationToken = default);
    Task AddAsync(FuncionarioDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<FuncionarioDocumentoExtra> entities);
}

