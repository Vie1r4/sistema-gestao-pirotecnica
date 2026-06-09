namespace Finalproj.Domain.Interfaces.Repositories;

public interface IFuncionarioRepository
{
    Task<Funcionario?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Funcionario entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Funcionario entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Funcionario entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Funcionario>> ListResponsaveisTecnicosOrdenadosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListEquipaComLicencaOperadorOrdenadosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetIdsComLicencaOperadorAsync(CancellationToken cancellationToken = default);

    Task<Funcionario?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Funcionario?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Funcionario?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<Funcionario?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> SearchOrderedAsync(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetNomesPorUserIdAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListDisponiveisParaUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    Task<string?> GetNomeCompletoByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);
}

