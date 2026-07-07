using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Finalproj.Application.Features.Clientes.Import;

/// <summary>
/// Parser CSV/TXT (RFC 4180) com suporte a campos multilinha, separador , ; ou tab,
/// exportações ERP (colunas NOME, NOME COMERCIAL, CÓD. POSTAL, TELEFONES, INACTIVO?, etc.)
/// e deteção automática da linha de cabeçalho.
/// </summary>
public static class ClienteCsvParser
{
    private static readonly char[] CandidateDelimiters = [',', ';', '\t'];

    private static readonly Dictionary<string, string> HeaderAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        ["nome"] = nameof(ClienteCsvRow.Nome),
        ["name"] = nameof(ClienteCsvRow.Nome),
        ["designacao"] = nameof(ClienteCsvRow.Nome),
        ["designação"] = nameof(ClienteCsvRow.Nome),
        ["nome cliente"] = nameof(ClienteCsvRow.Nome),
        ["cliente"] = nameof(ClienteCsvRow.Nome),
        ["razao social"] = nameof(ClienteCsvRow.Nome),
        ["razão social"] = nameof(ClienteCsvRow.Nome),
        ["nome comercial"] = nameof(ClienteCsvRow.NomeComercial),
        ["tipo"] = nameof(ClienteCsvRow.TipoCliente),
        ["tipo_cliente"] = nameof(ClienteCsvRow.TipoCliente),
        ["nif"] = nameof(ClienteCsvRow.Nif),
        ["contribuinte"] = nameof(ClienteCsvRow.Nif),
        ["email"] = nameof(ClienteCsvRow.Email),
        ["e-mail"] = nameof(ClienteCsvRow.Email),
        ["telefone"] = nameof(ClienteCsvRow.Telefone),
        ["telefones"] = nameof(ClienteCsvRow.Telefone),
        ["telemovel"] = nameof(ClienteCsvRow.Telefone),
        ["telemóvel"] = nameof(ClienteCsvRow.Telefone),
        ["morada"] = nameof(ClienteCsvRow.Morada),
        ["endereco"] = nameof(ClienteCsvRow.Morada),
        ["endereço"] = nameof(ClienteCsvRow.Morada),
        ["codigo_postal"] = nameof(ClienteCsvRow.CodigoPostal),
        ["codigo postal"] = nameof(ClienteCsvRow.CodigoPostal),
        ["cód. postal"] = nameof(ClienteCsvRow.CodigoPostal),
        ["cod. postal"] = nameof(ClienteCsvRow.CodigoPostal),
        ["cp"] = nameof(ClienteCsvRow.CodigoPostal),
        ["localidade"] = nameof(ClienteCsvRow.Localidade),
        ["país"] = nameof(ClienteCsvRow.Pais),
        ["pais"] = nameof(ClienteCsvRow.Pais),
        ["notas"] = nameof(ClienteCsvRow.Notas),
        ["observacoes"] = nameof(ClienteCsvRow.Notas),
        ["observações"] = nameof(ClienteCsvRow.Notas),
        ["código"] = nameof(ClienteCsvRow.CodigoExterno),
        ["codigo"] = nameof(ClienteCsvRow.CodigoExterno),
        ["cód."] = nameof(ClienteCsvRow.CodigoExterno),
        ["cod."] = nameof(ClienteCsvRow.CodigoExterno),
        ["inactivo?"] = nameof(ClienteCsvRow.Inactivo),
        ["inativo?"] = nameof(ClienteCsvRow.Inactivo),
        ["inactivo"] = nameof(ClienteCsvRow.Inactivo),
        ["inativo"] = nameof(ClienteCsvRow.Inactivo),
    };

    static ClienteCsvParser()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    public sealed record ClienteCsvRow
    {
        public int NumeroLinha { get; init; }
        public string? Nome { get; init; }
        public string? NomeComercial { get; init; }
        public string? TipoCliente { get; init; }
        public string? Nif { get; init; }
        public string? Email { get; init; }
        public string? Telefone { get; init; }
        public string? Morada { get; init; }
        public string? CodigoPostal { get; init; }
        public string? Localidade { get; init; }
        public string? Pais { get; init; }
        public string? Notas { get; init; }
        public string? CodigoExterno { get; init; }
        public string? Inactivo { get; init; }

        public string? NomeResolvido =>
            !string.IsNullOrWhiteSpace(Nome) ? Nome.Trim()
            : !string.IsNullOrWhiteSpace(NomeComercial) ? NomeComercial.Trim()
            : null;

        public bool EstaInactivo => ClienteCsvRowRules.EstaInactivo(Inactivo);
    }

    public sealed record ParseResult(IReadOnlyList<ClienteCsvRow> Rows, string? ErroGlobal);

    public static ParseResult Parse(Stream stream)
    {
        byte[] bytes;
        if (stream.CanSeek)
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            bytes = ms.ToArray();
        }
        else
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            bytes = ms.ToArray();
        }

        foreach (var text in DecodeTextCandidates(bytes))
        {
            var trimmed = text.TrimStart('\uFEFF').Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
                continue;

            var payload = SkipPreambleBeforeHeader(trimmed);
            var parsed = TryParsePayload(payload);
            if (parsed != null)
                return parsed;
        }

        return new ParseResult(Array.Empty<ClienteCsvRow>(),
            "Não foi encontrada linha de cabeçalho com coluna NOME (exportação ERP ou modelo simples).");
    }

    private static ParseResult? TryParsePayload(string payload)
    {
        var delimiters = RankDelimiters(payload);
        foreach (var delimiter in delimiters)
        {
            var records = ParseRecords(payload, delimiter);
            if (records.Count == 0)
                continue;

            var headerIndex = FindHeaderRowIndex(records);
            if (headerIndex < 0)
                continue;

            var map = BuildHeaderMap(records[headerIndex]);
            if (!map.Values.Any(v => v is nameof(ClienteCsvRow.Nome) or nameof(ClienteCsvRow.NomeComercial)))
                continue;

            var rows = new List<ClienteCsvRow>();
            for (var i = headerIndex + 1; i < records.Count; i++)
            {
                var cells = records[i];
                if (cells.All(string.IsNullOrWhiteSpace))
                    continue;

                var row = new ClienteCsvRow
                {
                    NumeroLinha = i + 1,
                    Nome = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.Nome))),
                    NomeComercial = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.NomeComercial))),
                    TipoCliente = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.TipoCliente))),
                    Nif = NormalizeNif(GetCell(cells, map, nameof(ClienteCsvRow.Nif))),
                    Email = NullIfEmpty(NormalizeEmail(GetCell(cells, map, nameof(ClienteCsvRow.Email)))),
                    Telefone = NullIfEmpty(NormalizeTelefone(GetCell(cells, map, nameof(ClienteCsvRow.Telefone)))),
                    Morada = NullIfEmpty(NormalizeMultiline(GetCell(cells, map, nameof(ClienteCsvRow.Morada)))),
                    CodigoPostal = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.CodigoPostal))),
                    Localidade = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.Localidade))),
                    Pais = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.Pais))),
                    Notas = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.Notas))),
                    CodigoExterno = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.CodigoExterno))),
                    Inactivo = NullIfEmpty(GetCell(cells, map, nameof(ClienteCsvRow.Inactivo))),
                };

                if (string.IsNullOrWhiteSpace(row.NomeResolvido))
                    continue;

                rows.Add(row);
            }

            return new ParseResult(rows, null);
        }

        return null;
    }

    private static IEnumerable<string> DecodeTextCandidates(byte[] bytes)
    {
        if (bytes.Length == 0)
            yield break;

        if (bytes.Length >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE)
        {
            yield return Encoding.Unicode.GetString(bytes);
            yield break;
        }

        if (bytes.Length >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF)
        {
            yield return Encoding.BigEndianUnicode.GetString(bytes);
            yield break;
        }

        if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
        {
            yield return Encoding.UTF8.GetString(bytes);
            yield break;
        }

        var utf8 = Encoding.UTF8.GetString(bytes);
        yield return utf8;

        if (utf8.Contains('\uFFFD'))
            yield return Encoding.GetEncoding(1252).GetString(bytes);
        else
        {
            // Exportações PT/ERP em ANSI: tentar Windows-1252 se UTF-8 não encontrar cabeçalho.
            yield return Encoding.GetEncoding(1252).GetString(bytes);
        }
    }

    private static string SkipPreambleBeforeHeader(string text)
    {
        var patterns = new[]
        {
            @"""C[ÓO]DIGO""\s*[,;\t]\s*""NOME""",
            @"""CODIGO""\s*[,;\t]\s*""NOME""",
            @"\bC[ÓO]DIGO\s*[,;\t]\s*""?NOME""?",
            @"(?:^|\r?\n)\s*""NOME""\s*[,;\t]\s*""NOME COMERCIAL""",
            @"(?:^|\r?\n)\s*NOME\s*[,;\t]\s*""?NOME COMERCIAL""?",
            @"(?:^|\r?\n)\s*""?nome""?\s*[,;\t]\s*""?tipo""?",
            @"(?:^|\r?\n)\s*nome\s*[,;\t]\s*tipo",
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
            if (!match.Success)
                continue;

            var start = match.Index;
            while (start > 0 && text[start - 1] is not ('\n' or '\r'))
                start--;
            return text[start..];
        }

        return text;
    }

    private static IReadOnlyList<char> RankDelimiters(string text)
    {
        var sample = text.Length <= 8000 ? text : text[..8000];
        var counts = CandidateDelimiters
            .Select(d => (d, CountDelimiterOutsideQuotes(sample, d)))
            .OrderByDescending(x => x.Item2)
            .Select(x => x.d)
            .ToList();

        return counts.Count > 0 ? counts : CandidateDelimiters;
    }

    internal static int CountDelimiterOutsideQuotes(string text, char delimiter)
    {
        var count = 0;
        var inQuotes = false;
        for (var i = 0; i < text.Length; i++)
        {
            var c = text[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < text.Length && text[i + 1] == '"')
                    i++;
                else
                    inQuotes = !inQuotes;
            }
            else if (c == delimiter && !inQuotes)
                count++;
        }

        return count;
    }

    private static int FindHeaderRowIndex(IReadOnlyList<IReadOnlyList<string>> records)
    {
        for (var i = 0; i < records.Count; i++)
        {
            var headers = records[i].Select(NormalizeHeader).ToList();
            var hasNome = headers.Any(h => HeaderAliases.TryGetValue(h, out var f)
                && f is nameof(ClienteCsvRow.Nome) or nameof(ClienteCsvRow.NomeComercial));
            if (hasNome)
                return i;
        }
        return -1;
    }

    private static Dictionary<int, string> BuildHeaderMap(IReadOnlyList<string> headers)
    {
        var map = new Dictionary<int, string>();
        for (var i = 0; i < headers.Count; i++)
        {
            var key = NormalizeHeader(headers[i]);
            if (HeaderAliases.TryGetValue(key, out var field))
                map[i] = field;
        }
        return map;
    }

    internal static string NormalizeHeader(string header)
    {
        var h = header.Trim().Trim('"').Trim();
        h = h.TrimStart('\uFEFF');
        return Regex.Replace(h, @"\s+", " ");
    }

    private static string? GetCell(IReadOnlyList<string> cells, Dictionary<int, string> map, string field)
    {
        foreach (var (index, mapped) in map)
        {
            if (mapped == field && index < cells.Count)
                return cells[index];
        }
        return null;
    }

    internal static List<List<string>> ParseRecords(string text, char delimiter)
    {
        var records = new List<List<string>>();
        var currentRecord = new List<string>();
        var currentField = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < text.Length; i++)
        {
            var c = text[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < text.Length && text[i + 1] == '"')
                {
                    currentField.Append('"');
                    i++;
                }
                else inQuotes = !inQuotes;
            }
            else if (c == delimiter && !inQuotes)
            {
                currentRecord.Add(currentField.ToString());
                currentField.Clear();
            }
            else if ((c == '\n' || c == '\r') && !inQuotes)
            {
                if (c == '\r' && i + 1 < text.Length && text[i + 1] == '\n')
                    i++;
                currentRecord.Add(currentField.ToString());
                currentField.Clear();
                if (currentRecord.Any(f => !string.IsNullOrWhiteSpace(f)))
                    records.Add(currentRecord);
                currentRecord = new List<string>();
            }
            else currentField.Append(c);
        }

        currentRecord.Add(currentField.ToString());
        if (currentRecord.Any(f => !string.IsNullOrWhiteSpace(f)))
            records.Add(currentRecord);

        return records;
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? NormalizeNif(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim().Replace(" ", "");
        return v.Length > 20 ? v[..20] : v;
    }

    private static string? NormalizeEmail(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        return v.Contains('@', StringComparison.Ordinal) ? v : null;
    }

    private static string? NormalizeTelefone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        var split = v.Split([';', '|'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return split.Length > 0 ? split[0] : v;
    }

    private static string? NormalizeMultiline(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? null
            : string.Join(" ", value.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(p => p.Length > 0));
}

internal static class ClienteCsvRowRules
{
    public static bool EstaInactivo(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var v = value.Trim().ToLower(CultureInfo.InvariantCulture);
        return v is "sim" or "s" or "yes" or "y" or "1" or "true" or "x";
    }
}
