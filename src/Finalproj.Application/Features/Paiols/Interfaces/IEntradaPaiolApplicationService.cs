using Finalproj.Application.Features.Paiols.DTOs;

namespace Finalproj.Application.Features.Paiols.Interfaces;

public interface IEntradaPaiolApplicationService
{
    Task<(IReadOnlyList<Paiol> Paiois, IReadOnlyList<Produto> Produtos)> GetFormularioAsync(IReadOnlyCollection<string> roles, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default);
    Task<(EntradaPaiol? Entrada, Paiol? Paiol, Produto? Produto, decimal MleTotalApos, IReadOnlyList<string> Erros, IReadOnlyList<string> Avisos)> RegistarAsync(EntradaPaiolViewModel model, string? userId, CancellationToken cancellationToken = default);
}
