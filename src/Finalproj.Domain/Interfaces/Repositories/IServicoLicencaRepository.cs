namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoLicencaRepository
{
    Task<ServicoLicenca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> FindByServicoAndIdTrackedAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServicoLicenca>> ListByServicoIdTrackedAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoLicenca entity, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> FindByServicoTipoOrigemAsync(int servicoId, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, CancellationToken cancellationToken = default);
    Task<bool> ExistsOutroAsync(int servicoId, OrigemRegistoServicoLicenca origem, string? nomePersonalizado, CancellationToken cancellationToken = default);
}

