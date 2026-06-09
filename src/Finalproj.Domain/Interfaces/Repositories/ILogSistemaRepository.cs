namespace Finalproj.Domain.Interfaces.Repositories;

public interface ILogSistemaRepository
{
    Task<LogSistema?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task AddAsync(LogSistema entity, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<(long Id, string? Acao, string? UserId, string? UserName, string? JsonDados, DateTime Timestamp)> Items, int Total)> ListPagedAsync(
        string? acaoFiltro,
        string? userNameFiltro,
        string? entidadeFiltro,
        DateTime? dataInicio,
        DateTime? dataFim,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);
}

