namespace Finalproj.Application.Features.Funcionarios.Interfaces;

public interface IFuncionarioApplicationService
{
    Task<IReadOnlyList<Funcionario>> ListAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> SearchAsync(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default);
    Task<Funcionario?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default);
    Task<Funcionario> CreateAsync(Funcionario funcionario, IEnumerable<FuncionarioDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default);
    Task AddDocumentosExtrasAsync(int funcionarioId, IEnumerable<FuncionarioDocumentoExtra> documentosExtras, CancellationToken cancellationToken = default);
    Task<Funcionario?> UpdateAsync(
        int id,
        Funcionario funcionario,
        IEnumerable<FuncionarioDocumentoExtra>? novosDocumentos = null,
        IReadOnlyCollection<int>? removerDocumentoIds = null,
        CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<string?> GetDocumentoPathAsync(int funcionarioId, string tipo, int? extraId, CancellationToken cancellationToken = default);
    Task<Funcionario?> DesassociarContaAsync(int funcionarioId, CancellationToken cancellationToken = default);
    Task DesassociarUserIdAsync(string userId, bool revogarRefreshTokens, CancellationToken cancellationToken = default);
}
