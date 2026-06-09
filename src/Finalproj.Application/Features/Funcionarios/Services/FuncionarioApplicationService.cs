using Finalproj.Application.Features.Funcionarios.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Funcionarios.Services;

public sealed class FuncionarioApplicationService(
    IFuncionarioRepository funcionarios,
    IFuncionarioDocumentoExtraRepository documentos,
    IClienteRepository clientes,
    IPerfilRepository perfis,
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork unitOfWork) : IFuncionarioApplicationService
{
    public Task<IReadOnlyList<Funcionario>> ListAsync(CancellationToken cancellationToken = default) =>
        funcionarios.GetAllAsync(cancellationToken);

    public Task<IReadOnlyList<Funcionario>> SearchAsync(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default) =>
        funcionarios.SearchOrderedAsync(pesquisa, cargo, ordenar, cancellationToken);

    public Task<Funcionario?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default) =>
        includeDocumentos ? funcionarios.GetByIdWithDocumentosNoTrackingAsync(id, cancellationToken) : funcionarios.GetByIdAsync(id, cancellationToken);

    public async Task<Funcionario> CreateAsync(Funcionario funcionario, IEnumerable<FuncionarioDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default)
    {
        funcionario.DataRegisto ??= DateTime.UtcNow;
        foreach (var doc in documentosExtras ?? Enumerable.Empty<FuncionarioDocumentoExtra>())
            funcionario.DocumentosExtras.Add(doc);
        await funcionarios.AddAsync(funcionario, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return funcionario;
    }

    public async Task AddDocumentosExtrasAsync(int funcionarioId, IEnumerable<FuncionarioDocumentoExtra> documentosExtras, CancellationToken cancellationToken = default)
    {
        foreach (var doc in documentosExtras)
        {
            doc.FuncionarioId = funcionarioId;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Funcionario?> UpdateAsync(
        int id,
        Funcionario funcionario,
        IEnumerable<FuncionarioDocumentoExtra>? novosDocumentos = null,
        IReadOnlyCollection<int>? removerDocumentoIds = null,
        CancellationToken cancellationToken = default)
    {
        if (id != funcionario.Id)
            return null;
        var existente = await funcionarios.GetByIdWithDocumentosTrackedAsync(id, cancellationToken);
        if (existente == null)
            return null;
        existente.NomeCompleto = funcionario.NomeCompleto;
        existente.NIF = funcionario.NIF;
        existente.Email = funcionario.Email;
        existente.Telefone = funcionario.Telefone;
        existente.Morada = funcionario.Morada;
        existente.NumeroSegurancaSocial = funcionario.NumeroSegurancaSocial;
        existente.NumeroCredencial = string.IsNullOrWhiteSpace(funcionario.NumeroCredencial)
            ? null
            : funcionario.NumeroCredencial.Trim()[..Math.Min(50, funcionario.NumeroCredencial.Trim().Length)];
        existente.IBAN = funcionario.IBAN;
        existente.Cargo = funcionario.Cargo;
        existente.Notas = funcionario.Notas;
        existente.UserId = funcionario.UserId;
        existente.CartaoCidadaoCaminho = funcionario.CartaoCidadaoCaminho;
        existente.DocumentoADDRCaminho = funcionario.DocumentoADDRCaminho;
        existente.LicencaOperadorCaminho = funcionario.LicencaOperadorCaminho;
        existente.OutrosCaminho = funcionario.OutrosCaminho;
        if (removerDocumentoIds?.Count > 0)
            documentos.RemoveRange(await documentos.ListByFuncionarioAndIdsAsync(id, removerDocumentoIds, cancellationToken));
        foreach (var doc in novosDocumentos ?? Enumerable.Empty<FuncionarioDocumentoExtra>())
        {
            doc.FuncionarioId = id;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return existente;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var funcionario = await funcionarios.FindTrackedByIdAsync(id, cancellationToken);
        if (funcionario == null)
            return false;
        await funcionarios.DeleteAsync(funcionario, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<string?> GetDocumentoPathAsync(int funcionarioId, string tipo, int? extraId, CancellationToken cancellationToken = default)
    {
        if (string.Equals(tipo, "extra", StringComparison.OrdinalIgnoreCase) && extraId.HasValue)
            return (await documentos.GetByFuncionarioAndIdNoTrackingAsync(funcionarioId, extraId.Value, cancellationToken))?.Caminho;
        var funcionario = await funcionarios.GetByIdAsync(funcionarioId, cancellationToken);
        return tipo?.ToLowerInvariant() switch
        {
            "cc" => funcionario?.CartaoCidadaoCaminho,
            "addr" => funcionario?.DocumentoADDRCaminho,
            "licenca" => funcionario?.LicencaOperadorCaminho,
            "outros" => funcionario?.OutrosCaminho,
            _ => null
        };
    }

    public async Task<Funcionario?> DesassociarContaAsync(int funcionarioId, CancellationToken cancellationToken = default)
    {
        var funcionario = await funcionarios.FindTrackedByIdAsync(funcionarioId, cancellationToken);
        if (funcionario == null || string.IsNullOrEmpty(funcionario.UserId))
            return null;
        var userId = funcionario.UserId;
        funcionario.UserId = null;
        await DesassociarUserIdInternoAsync(userId, true, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return funcionario;
    }

    public async Task DesassociarUserIdAsync(string userId, bool revogarRefreshTokens, CancellationToken cancellationToken = default)
    {
        await DesassociarUserIdInternoAsync(userId, revogarRefreshTokens, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task DesassociarUserIdInternoAsync(string userId, bool revogarRefreshTokens, CancellationToken cancellationToken)
    {
        foreach (var f in await funcionarios.ListByUserIdTrackedAsync(userId, cancellationToken))
            f.UserId = null;
        foreach (var c in (await clientes.GetAllAsync(cancellationToken)).Where(c => c.UserId == userId))
        {
            c.UserId = null;
            await clientes.UpdateAsync(c, cancellationToken);
        }
        perfis.RemoveRange(await perfis.ListByUserIdTrackedAsync(userId, cancellationToken));
        if (revogarRefreshTokens)
        {
            foreach (var rt in await refreshTokens.ListActiveByUserIdTrackedAsync(userId, cancellationToken))
                rt.RevokedAtUtc = DateTime.UtcNow;
        }
    }
}
