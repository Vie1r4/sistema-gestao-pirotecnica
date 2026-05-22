using Finalproj.Application.Features.Admin.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Admin.Services;

public sealed class AdminStatsService(
    IEncomendaRepository encomendas,
    IServicoRepository servicos,
    IClienteRepository clientes,
    IFuncionarioRepository funcionarios,
    IProdutoRepository produtos,
    IPaiolRepository paiois,
    ILogSistemaRepository logs,
    IUnitOfWork unitOfWork) : IAdminStatsService
{
    public async Task<object> GetStatsAsync(int totalUtilizadores, int utilizadoresSemEmailConfirmado, CancellationToken cancellationToken = default)
    {
        var inicioDoMes = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return new
        {
            totalUtilizadores,
            utilizadoresSemEmailConfirmado,
            totalEncomendas = await encomendas.CountAsync(cancellationToken),
            encomendasEsteMes = await encomendas.CountCreatedSinceAsync(inicioDoMes, cancellationToken),
            totalServicos = await servicos.CountAsync(cancellationToken),
            servicosEsteMes = await servicos.CountCreatedSinceAsync(inicioDoMes, cancellationToken),
            totalClientes = await clientes.CountAsync(cancellationToken),
            totalFuncionarios = await funcionarios.CountAsync(cancellationToken),
            totalProdutos = await produtos.CountAsync(cancellationToken),
            totalPaiois = await paiois.GetAllAsync(cancellationToken).ContinueWith(t => t.Result.Count, cancellationToken),
            totalLogs = await logs.CountAsync(cancellationToken)
        };
    }

    public async Task<object> GetLogsAsync(string? acao, string? userName, string? entidade, DateTime? dataInicio, DateTime? dataFim, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        var (rows, total) = await logs.ListPagedAsync(acao, userName, entidade, dataInicio, dataFim, pagina, itensPorPagina, cancellationToken);
        // Objetos anónimos com nomes estáveis — tuplos serializam-se como Item1, Item2 e o cliente perde o id (React keys duplicadas).
        var items = rows.Select(x => new
        {
            id = x.Id,
            acao = x.Acao,
            userId = x.UserId,
            userName = x.UserName,
            jsonDados = x.JsonDados,
            timestamp = x.Timestamp,
        }).ToList();
        return new { items, paginaAtual = pagina, itensPorPagina, totalRegistos = total };
    }

    public async Task<object> GetHealthAsync(string environmentName, string? apiVersion, CancellationToken cancellationToken = default)
    {
        var database = false;
        try
        {
            await logs.CountAsync(cancellationToken);
            database = true;
        }
        catch
        {
            // BD indisponível
        }

        return new
        {
            status = database ? "ok" : "degraded",
            database,
            environment = environmentName,
            version = apiVersion ?? "unknown",
            utcNow = DateTime.UtcNow,
        };
    }

    public Task<Dictionary<string, string>> GetFuncionariosPorUserIdAsync(CancellationToken cancellationToken = default) =>
        funcionarios.GetNomesPorUserIdAsync(cancellationToken);

    public async Task<object> GetFuncionariosDisponiveisAsync(string userId, CancellationToken cancellationToken = default) =>
        (await funcionarios.ListDisponiveisParaUserAsync(userId, cancellationToken)).Select(f => new { f.Id, f.NomeCompleto }).ToList();

    public async Task<int?> GetFuncionarioIdByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        (await funcionarios.GetByUserIdAsync(userId, cancellationToken))?.Id;

    public async Task AssociarFuncionarioAUtilizadorAsync(string userId, int? funcionarioId, CancellationToken cancellationToken = default)
    {
        foreach (var f in await funcionarios.ListByUserIdTrackedAsync(userId, cancellationToken))
            f.UserId = null;
        if (funcionarioId.HasValue)
        {
            var funcionario = await funcionarios.FindTrackedByIdAsync(funcionarioId.Value, cancellationToken);
            if (funcionario != null)
                funcionario.UserId = userId;
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DesassociarUtilizadorAsync(string userId, CancellationToken cancellationToken = default)
    {
        foreach (var f in await funcionarios.ListByUserIdTrackedAsync(userId, cancellationToken))
            f.UserId = null;
        foreach (var c in (await clientes.GetAllAsync(cancellationToken)).Where(c => c.UserId == userId))
        {
            c.UserId = null;
            await clientes.UpdateAsync(c, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
