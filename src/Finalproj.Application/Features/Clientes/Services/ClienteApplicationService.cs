using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Clientes.Interfaces;
using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Clientes.Services;

public sealed class ClienteApplicationService(
    IClienteRepository clientes,
    IEncomendaRepository encomendas,
    IClienteDocumentoExtraRepository documentos,
    IUnitOfWork unitOfWork) : IClienteApplicationService
{
    public Task<IReadOnlyList<Cliente>> SearchAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default) =>
        clientes.SearchOrderedAsync(pesquisa, ordenar, cancellationToken);

    public Task<Cliente?> GetByIdAsync(int id, bool includeDocumentos = false, CancellationToken cancellationToken = default) =>
        includeDocumentos ? clientes.GetByIdWithDocumentosNoTrackingAsync(id, cancellationToken) : clientes.GetByIdAsync(id, cancellationToken);

    public async Task<object?> GetDetailsAsync(int id, int historicoPagina, int historicoPageSize, CancellationToken cancellationToken = default)
    {
        var cliente = await clientes.GetByIdWithDocumentosNoTrackingAsync(id, cancellationToken);
        if (cliente == null)
            return null;
        var encomendasAtivas = await encomendas.ListAtivasComItensProdutoByClienteAsync(id, cancellationToken);
        var (historico, totalHistorico) = await encomendas.ListHistoricoClientePaginatedAsync(id, historicoPagina, historicoPageSize, cancellationToken);
        var totalPaginasHistorico = totalHistorico == 0 ? 1 : (int)Math.Ceiling(totalHistorico / (double)historicoPageSize);
        historicoPagina = Math.Clamp(historicoPagina, 1, totalPaginasHistorico);
        if (historicoPagina > 1 && historico.Count == 0)
            (historico, totalHistorico) = await encomendas.ListHistoricoClientePaginatedAsync(id, historicoPagina, historicoPageSize, cancellationToken);
        return new
        {
            cliente = ClienteResponseDtoMapping.Map(cliente, includeSensitive: false),
            encomendasAtivas = encomendasAtivas.Select(EncomendaResponseDtoMapping.MapToResumo).ToList(),
            encomendasHistorico = historico.Select(EncomendaResponseDtoMapping.MapToResumo).ToList(),
            historicoPagina,
            totalPaginasHistorico,
            totalHistorico
        };
    }

    public async Task<Cliente> CreateAsync(Cliente cliente, IEnumerable<ClienteDocumentoExtra>? documentosExtras = null, CancellationToken cancellationToken = default)
    {
        cliente.DataRegisto ??= DateTime.UtcNow;
        await clientes.AddAsync(cliente, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        foreach (var doc in documentosExtras ?? Enumerable.Empty<ClienteDocumentoExtra>())
        {
            doc.ClienteId = cliente.Id;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return cliente;
    }

    public async Task AddDocumentosExtrasAsync(int clienteId, IEnumerable<ClienteDocumentoExtra> documentosExtras, CancellationToken cancellationToken = default)
    {
        foreach (var doc in documentosExtras)
        {
            doc.ClienteId = clienteId;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Cliente?> UpdateAsync(int id, Cliente cliente, IEnumerable<ClienteDocumentoExtra>? novosDocumentos = null, IReadOnlyCollection<int>? removerDocumentoIds = null, CancellationToken cancellationToken = default)
    {
        var existente = await clientes.GetByIdWithDocumentosTrackedAsync(id, cancellationToken);
        if (existente == null)
            return null;
        existente.Nome = cliente.Nome;
        existente.TipoCliente = cliente.TipoCliente;
        existente.NIF = string.IsNullOrWhiteSpace(cliente.NIF) ? null : cliente.NIF.Trim();
        existente.Email = string.IsNullOrWhiteSpace(cliente.Email) ? null : cliente.Email.Trim();
        existente.Telefone = string.IsNullOrWhiteSpace(cliente.Telefone) ? null : cliente.Telefone.Trim();
        existente.Morada = string.IsNullOrWhiteSpace(cliente.Morada) ? null : cliente.Morada.Trim();
        existente.CodigoPostal = string.IsNullOrWhiteSpace(cliente.CodigoPostal)
            ? null
            : cliente.CodigoPostal.Trim()[..Math.Min(10, cliente.CodigoPostal.Trim().Length)];
        existente.Localidade = string.IsNullOrWhiteSpace(cliente.Localidade)
            ? null
            : cliente.Localidade.Trim()[..Math.Min(100, cliente.Localidade.Trim().Length)];
        existente.Notas = string.IsNullOrWhiteSpace(cliente.Notas) ? null : cliente.Notas.Trim();
        if (removerDocumentoIds?.Count > 0)
            documentos.RemoveRange(await documentos.ListByClienteAndIdsAsync(id, removerDocumentoIds, cancellationToken));
        foreach (var doc in novosDocumentos ?? Enumerable.Empty<ClienteDocumentoExtra>())
        {
            doc.ClienteId = id;
            await documentos.AddAsync(doc, cancellationToken);
        }
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return existente;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var cliente = await clientes.GetByIdWithDocumentosTrackedAsync(id, cancellationToken);
        if (cliente == null)
            return false;
        await clientes.DeleteAsync(cliente, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<string?> GetDocumentoExtraPathForClienteAsync(int clienteId, int docId, CancellationToken cancellationToken = default) =>
        (await documentos.GetByClienteAndIdNoTrackingAsync(clienteId, docId, cancellationToken))?.Caminho;
}
