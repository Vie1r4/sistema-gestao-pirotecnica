using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Clientes.Import;
using Finalproj.Application.Features.Clientes.Interfaces;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Interfaces.Repositories;
namespace Finalproj.Application.Features.Clientes.Services;

public sealed class ClienteImportService(
    IClienteRepository clientes,
    IClienteApplicationService clientesApp)
{
    private const int NifMaxLength = 20;
    private static readonly HashSet<string> TiposValidos = ConstantesFuncionariosClientes.TiposCliente
        .Select(t => t.Value)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    public async Task<ClienteImportResultDto> ImportarCsvAsync(
        Stream csvStream,
        string modoDuplicadoNif,
        CancellationToken cancellationToken = default)
    {
        var parse = ClienteCsvParser.Parse(csvStream);
        if (parse.ErroGlobal != null)
        {
            return new ClienteImportResultDto
            {
                Erros = 1,
                Linhas = [new ClienteImportLinhaResultDto { NumeroLinha = 1, Estado = "erro", Mensagem = parse.ErroGlobal }]
            };
        }

        var modo = (modoDuplicadoNif ?? "ignorar").Trim().ToLowerInvariant();
        if (modo is not ("ignorar" or "atualizar" or "criar"))
            modo = "ignorar";

        var nifsExistentes = await clientes.ListActiveNifToIdMapAsync(cancellationToken);
        var resultado = new ClienteImportResultDto { TotalLinhas = parse.Rows.Count };

        foreach (var row in parse.Rows)
        {
            if (row.EstaInactivo)
            {
                resultado.Ignorados++;
                resultado.Linhas.Add(new ClienteImportLinhaResultDto
                {
                    NumeroLinha = row.NumeroLinha,
                    Estado = "ignorado",
                    Nome = row.NomeResolvido,
                    Mensagem = "Cliente marcado como inactivo na origem."
                });
                continue;
            }

            var erros = ValidarLinha(row);
            if (erros.Count > 0)
            {
                resultado.Erros++;
                resultado.Linhas.Add(new ClienteImportLinhaResultDto
                {
                    NumeroLinha = row.NumeroLinha,
                    Estado = "erro",
                    Nome = row.NomeResolvido,
                    Mensagem = string.Join(" ", erros)
                });
                continue;
            }

            var nif = row.Nif;
            Cliente? existente = null;
            if (!string.IsNullOrEmpty(nif) && nifsExistentes.TryGetValue(nif, out var existenteId))
                existente = await clientes.GetByIdWithDocumentosTrackedAsync(existenteId, cancellationToken);

            if (existente != null && modo == "ignorar")
            {
                resultado.Ignorados++;
                resultado.Linhas.Add(new ClienteImportLinhaResultDto
                {
                    NumeroLinha = row.NumeroLinha,
                    Estado = "ignorado",
                    Nome = row.NomeResolvido,
                    ClienteId = existente.Id,
                    Mensagem = "NIF já registado — linha ignorada."
                });
                continue;
            }

            var entity = MapRow(row);

            if (existente != null && modo == "atualizar")
            {
                await clientesApp.UpdateAsync(existente.Id, entity, null, null, cancellationToken);
                resultado.Atualizados++;
                resultado.Linhas.Add(new ClienteImportLinhaResultDto
                {
                    NumeroLinha = row.NumeroLinha,
                    Estado = "atualizado",
                    Nome = entity.Nome,
                    ClienteId = existente.Id
                });
                continue;
            }

            var criado = await clientesApp.CreateAsync(entity, null, cancellationToken);
            if (!string.IsNullOrEmpty(criado.NIF))
                nifsExistentes[criado.NIF] = criado.Id;

            resultado.Importados++;
            resultado.Linhas.Add(new ClienteImportLinhaResultDto
            {
                NumeroLinha = row.NumeroLinha,
                Estado = "importado",
                Nome = criado.Nome,
                ClienteId = criado.Id
            });
        }

        return resultado;
    }

    private static Cliente MapRow(ClienteCsvParser.ClienteCsvRow row)
    {
        var tipo = string.IsNullOrWhiteSpace(row.TipoCliente) ? "Particular" : row.TipoCliente.Trim();
        if (!TiposValidos.Contains(tipo))
            tipo = !string.IsNullOrWhiteSpace(row.NomeComercial) ? "Empresa" : "Particular";

        var notas = row.Notas;
        if (!string.IsNullOrWhiteSpace(row.CodigoExterno))
        {
            var cod = $"Cód. origem: {row.CodigoExterno.Trim()}";
            notas = string.IsNullOrWhiteSpace(notas) ? cod : $"{cod} — {notas.Trim()}";
        }

        var localidade = row.Localidade;
        if (string.IsNullOrWhiteSpace(localidade) && !string.IsNullOrWhiteSpace(row.Pais))
            localidade = row.Pais.Trim();

        return new Cliente
        {
            Nome = row.NomeResolvido!.Trim(),
            TipoCliente = tipo,
            NIF = Truncate(row.Nif, NifMaxLength),
            Email = row.Email,
            Telefone = Truncate(row.Telefone, 20),
            Morada = Truncate(row.Morada, 300),
            CodigoPostal = Truncate(row.CodigoPostal, 10),
            Localidade = Truncate(localidade, 100),
            Notas = Truncate(notas, 500),
            DataRegisto = DateTime.UtcNow
        };
    }

    private static List<string> ValidarLinha(ClienteCsvParser.ClienteCsvRow row)
    {
        var erros = new List<string>();
        var nome = row.NomeResolvido;
        if (string.IsNullOrWhiteSpace(nome))
            erros.Add("O nome é obrigatório.");
        else if (nome.Trim().Length > 200)
            erros.Add("O nome não pode exceder 200 caracteres.");

        if (row.Nif?.Length > NifMaxLength)
            erros.Add($"O NIF não pode exceder {NifMaxLength} caracteres.");

        if (!string.IsNullOrWhiteSpace(row.TipoCliente) && !TiposValidos.Contains(row.TipoCliente.Trim()))
            erros.Add("Tipo inválido (use Particular ou Empresa).");

        if (!string.IsNullOrWhiteSpace(row.Email))
        {
            if (row.Email.Length > 256)
                erros.Add("O email não pode exceder 256 caracteres.");
            else if (!row.Email.Contains('@'))
                erros.Add("Email inválido.");
        }

        if (row.Morada?.Length > 300) erros.Add("A morada não pode exceder 300 caracteres.");
        if (row.Notas?.Length > 500) erros.Add("As notas não podem exceder 500 caracteres.");
        if (row.CodigoPostal?.Length > 10) erros.Add("O código-postal não pode exceder 10 caracteres.");
        if (row.Localidade?.Length > 100) erros.Add("A localidade não pode exceder 100 caracteres.");

        return erros;
    }

    private static string? Truncate(string? value, int max) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim()[..Math.Min(max, value.Trim().Length)];
}
