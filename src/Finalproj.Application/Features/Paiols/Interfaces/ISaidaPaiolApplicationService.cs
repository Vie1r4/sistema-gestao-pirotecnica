using Finalproj.Application.Features.Paiols.DTOs;

namespace Finalproj.Application.Features.Paiols.Interfaces;

public interface ISaidaPaiolApplicationService
{
    Task<(Paiol? Paiol, Produto? Produto, decimal StockDisponivel, bool TemAcesso)> GetFormularioAsync(int paiolId, int produtoId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
    Task<(SaidaPaiol? Saida, Paiol? Paiol, Produto? Produto, string? Erro, decimal StockDisponivel, bool TemAcesso)> RegistarAsync(SaidaPaiolViewModel model, string? userId, IReadOnlyCollection<string> roles, CancellationToken cancellationToken = default);
}
