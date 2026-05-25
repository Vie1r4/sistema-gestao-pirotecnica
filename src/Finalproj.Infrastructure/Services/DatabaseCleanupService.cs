using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Services;

public sealed class DatabaseCleanupService(
    FinalprojContext context,
    IArquivosRaizService arquivos) : IDatabaseCleanupService
{
    public async Task ClearAllForResetAsync(CancellationToken cancellationToken = default)
    {
        await ClearApplicationDataAsync(cancellationToken);
        await context.RefreshTokens.ExecuteDeleteAsync(cancellationToken);
        await LimparPastaUploadsAsync(cancellationToken);
    }

    private Task LimparPastaUploadsAsync(CancellationToken cancellationToken)
    {
        return Task.Run(() =>
        {
            cancellationToken.ThrowIfCancellationRequested();
            arquivos.GarantirPastasExistem();
            var root = arquivos.UploadsRoot;
            if (Directory.Exists(root))
                Directory.Delete(root, recursive: true);
            Directory.CreateDirectory(root);
        }, cancellationToken);
    }
    public async Task ClearApplicationDataAsync(CancellationToken cancellationToken = default)
    {
        await context.LogSistema.ExecuteDeleteAsync(cancellationToken);
        await context.ServicoDistanciasSeguranca.ExecuteDeleteAsync(cancellationToken);
        await context.ServicoLicencas.ExecuteDeleteAsync(cancellationToken);
        await context.ServicoEquipas.ExecuteDeleteAsync(cancellationToken);
        await context.ServicoDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
        await context.Servicos.ExecuteDeleteAsync(cancellationToken);
        await context.Reservas.ExecuteDeleteAsync(cancellationToken);
        await context.EncomendaItems.ExecuteDeleteAsync(cancellationToken);
        await context.Encomendas.ExecuteDeleteAsync(cancellationToken);
        await context.SaidasPaiol.ExecuteDeleteAsync(cancellationToken);
        await context.EntradasPaiol.ExecuteDeleteAsync(cancellationToken);
        await context.PaiolAcessos.ExecuteDeleteAsync(cancellationToken);
        await context.PaiolDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
        await context.Paiol.ExecuteDeleteAsync(cancellationToken);
        await context.CompiladoItens.ExecuteDeleteAsync(cancellationToken);
        await context.Compilados.ExecuteDeleteAsync(cancellationToken);
        await context.Produtos.ExecuteDeleteAsync(cancellationToken);
        await context.FuncionarioDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
        await context.ClienteDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
        await context.Funcionarios.ExecuteDeleteAsync(cancellationToken);
        await context.Clientes.ExecuteDeleteAsync(cancellationToken);
        await context.Perfis.ExecuteDeleteAsync(cancellationToken);
    }
}
