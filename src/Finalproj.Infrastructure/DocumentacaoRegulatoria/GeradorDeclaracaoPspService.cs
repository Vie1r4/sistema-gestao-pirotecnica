using System.Globalization;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Finalproj.Infrastructure.Configuration;

namespace Finalproj.Infrastructure.DocumentacaoRegulatoria;

/// <summary>Gera a declaração PSP em DOCX (programaticamente ou a partir de template com marcadores).</summary>
public sealed class GeradorDeclaracaoPspService
{
    private static readonly CultureInfo CulturaPt = CultureInfo.GetCultureInfo("pt-PT");

    public byte[] Gerar(Servico servico, EmpresaPirotecnicaOptions empresa, string? templatePath = null)
    {
        if (!string.IsNullOrWhiteSpace(templatePath) && File.Exists(templatePath))
            return GerarAPartirDeTemplate(servico, empresa, templatePath);

        return GerarProgramaticamente(servico, empresa);
    }

    private static byte[] GerarAPartirDeTemplate(Servico servico, EmpresaPirotecnicaOptions empresa, string templatePath)
    {
        using var ms = new MemoryStream();
        using (var fs = File.OpenRead(templatePath))
            fs.CopyTo(ms);
        ms.Position = 0;

        using (var doc = WordprocessingDocument.Open(ms, true))
        {
            var body = doc.MainDocumentPart!.Document.Body!;
            AplicarEmpresaPirotecnicaFixa(body);
            AplicarBlocoEventoFixo(body, servico);
            SubstituirMarcadoresGlobais(body, servico);

            if (EhTemplateOficialPsp(body))
                PreencherTemplateOficial(body, servico);
            else
                ExpandirZonas(doc, servico);

            NormalizarRodapePsp(doc.MainDocumentPart);
            doc.MainDocumentPart.Document.Save();
        }

        return ms.ToArray();
    }

    private static bool EhTemplateOficialPsp(Body body) =>
        body.InnerText.Contains("Zona de lançamento", StringComparison.OrdinalIgnoreCase)
        && body.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase);

    private static void AplicarEmpresaPirotecnicaFixa(Body body)
    {
        var caixas = body.Descendants<TextBoxContent>()
            .Where(EhCaixaDadosEmpresaPirotecnica)
            .ToList();

        foreach (var caixa in caixas)
            WordOpenXmlTextHelper.SetEmpresaPirotecnicaFixa(caixa);

        foreach (var cell in body.Descendants<TableCell>().Where(EhCaixaDadosEmpresaPirotecnica))
            WordOpenXmlTextHelper.SetEmpresaPirotecnicaFixa(cell);
    }

    /// <summary>Caixa com os dados (designação, morada…), não o rótulo «Empresa pirotécnica:» isolado.</summary>
    private static bool EhCaixaDadosEmpresaPirotecnica(OpenXmlElement element)
    {
        var t = element.InnerText;
        if (!t.Contains("Designação", StringComparison.OrdinalIgnoreCase))
            return false;
        return t.Contains("Alvar", StringComparison.OrdinalIgnoreCase)
               || t.Contains("PIROFAFE", StringComparison.OrdinalIgnoreCase)
               || t.Contains("{{EMPRESA_", StringComparison.Ordinal)
               || t.Contains("Endereço", StringComparison.OrdinalIgnoreCase);
    }

    private static void AplicarBlocoEventoFixo(Body body, Servico servico)
    {
        var linhas = MontarLinhasEvento(servico);
        var caixas = body.Descendants<TextBoxContent>().Where(EhCaixaDadosEvento).ToList();
        foreach (var caixa in caixas)
            WordOpenXmlTextHelper.SetLinhasFixas(caixa, linhas);

        foreach (var cell in body.Descendants<TableCell>().Where(EhCaixaDadosEvento))
            WordOpenXmlTextHelper.SetLinhasFixas(cell, linhas);

        NormalizarRotuloPromotor(body);
    }

    private static List<string> MontarLinhasEvento(Servico servico) =>
    [
        $"Evento: {servico.NomeEvento ?? servico.Encomenda?.Nome ?? "—"}",
        $"Local: {FormatarLocalGeral(servico)}",
        $"Data: {FormatarDataEventoLonga(servico.DataServico)}",
    ];

    /// <summary>Rótulo «Promotor:» no template (fora da caixa de evento/local/data).</summary>
    private static void NormalizarRotuloPromotor(Body body)
    {
        foreach (var paragraph in body.Descendants<Paragraph>())
        {
            var t = paragraph.InnerText.Trim();
            if (!t.StartsWith("Promotor:", StringComparison.OrdinalIgnoreCase))
                continue;
            if (t.Contains("Evento:", StringComparison.OrdinalIgnoreCase)
                || t.Contains("Local:", StringComparison.OrdinalIgnoreCase))
                continue;
            WordOpenXmlTextHelper.SetParagraphText(paragraph, "Promotor:");
        }
    }

    private static bool EhCaixaDadosEvento(OpenXmlElement element)
    {
        var t = element.InnerText;
        if (!t.Contains("Evento:", StringComparison.OrdinalIgnoreCase))
            return false;
        if (t.Contains("Designação", StringComparison.OrdinalIgnoreCase))
            return false;
        if (t.Contains("Zona de lançamento", StringComparison.OrdinalIgnoreCase))
            return false;
        return t.Contains("Local:", StringComparison.OrdinalIgnoreCase)
               || t.Contains("Data:", StringComparison.OrdinalIgnoreCase)
               || t.Contains("{{NOME_EVENTO}}", StringComparison.Ordinal)
               || t.Contains("{{LOCAL_GERAL}}", StringComparison.Ordinal);
    }

    private static void SubstituirMarcadoresGlobais(Body body, Servico servico)
    {
        var map = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["{{COORDENADOR_NOME}}"] = servico.CoordenadorPirotecnico?.NomeCompleto ?? "—",
            ["{{COORDENADOR_CRED}}"] = servico.CoordenadorPirotecnico?.NumeroCredencial ?? "—",
            ["{{DATA_DECLARACAO}}"] = FormatarDataDeclaracao(DateTime.Today),
        };
        WordOpenXmlTextHelper.ReplaceAll(body, map);
    }

    private static void PreencherTemplateOficial(Body body, Servico servico)
    {
        var zonas = (servico.ZonasLancamento ?? []).OrderBy(z => z.Id).ToList();
        if (zonas.Count == 0)
            return;

        var bloco = ExtrairBlocoZona(body);
        if (bloco == null)
            return;

        var (zonaTable, meio, artigosTable, acondicionamentoTable) = bloco.Value;

        PreencherBlocoZona(zonaTable, artigosTable, zonas[0], 1);

        OpenXmlElement anchor = artigosTable;
        for (var i = 1; i < zonas.Count; i++)
        {
            var clones = ClonarBlocoZona(zonaTable, meio, artigosTable);
            foreach (var el in clones)
            {
                body.InsertAfter(el, anchor);
                anchor = el;
            }

            var novaZona = (Table)clones.OfType<Table>().First(t => t.InnerText.Contains("Zona de lançamento", StringComparison.OrdinalIgnoreCase));
            var novosArtigos = (Table)clones.OfType<Table>().First(t => t.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase));
            PreencherBlocoZona(novaZona, novosArtigos, zonas[i], i + 1);
        }

        foreach (var table in body.Descendants<Table>())
            WordOpenXmlTextHelper.CentralizarTabela(table);

        _ = acondicionamentoTable;
    }

    private static (Table ZonaTable, List<OpenXmlElement> Meio, Table ArtigosTable, Table? Acondicionamento)? ExtrairBlocoZona(Body body)
    {
        Table? zonaTable = null;
        Table? artigosTable = null;
        Table? acondicionamento = null;
        var meio = new List<OpenXmlElement>();
        var capturing = false;

        foreach (var el in body.Elements())
        {
            if (el is Table tbl)
            {
                if (tbl.InnerText.Contains("Zona de lançamento", StringComparison.OrdinalIgnoreCase))
                {
                    zonaTable = tbl;
                    capturing = true;
                    continue;
                }

                if (capturing && tbl.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase))
                {
                    artigosTable = tbl;
                    capturing = false;
                    continue;
                }

                if (tbl.InnerText.Contains("Acondicionamento", StringComparison.OrdinalIgnoreCase))
                    acondicionamento = tbl;
            }
            else if (capturing && zonaTable != null)
            {
                meio.Add(el);
            }
        }

        if (zonaTable == null || artigosTable == null)
            return null;

        return (zonaTable, meio, artigosTable, acondicionamento);
    }

    private static List<OpenXmlElement> ClonarBlocoZona(Table zonaTable, IReadOnlyList<OpenXmlElement> meio, Table artigosTable)
    {
        var clones = new List<OpenXmlElement> { (Table)zonaTable.CloneNode(true) };
        clones.AddRange(meio.Select(e => (OpenXmlElement)e.CloneNode(true)));
        clones.Add((Table)artigosTable.CloneNode(true));
        return clones;
    }

    private static void PreencherBlocoZona(Table zonaTable, Table artigosTable, ServicoZonaLancamento zona, int numero)
    {
        var zonaRows = zonaTable.Elements<TableRow>().ToList();
        if (zonaRows.Count >= 1)
        {
            var titulo = $"Zona de lançamento n.º {numero}";
            if (!string.IsNullOrWhiteSpace(zona.Designacao))
                titulo += $" — {zona.Designacao}";
            WordOpenXmlTextHelper.SetCellText(zonaRows[0].Elements<TableCell>().First(), titulo);
        }

        if (zonaRows.Count >= 2)
        {
            var resp = zona.ResponsavelPirotecnico;
            var txt = resp != null
                ? $"Responsável pirotécnico – {resp.NomeCompleto} CRED Nº{resp.NumeroCredencial ?? "—"}"
                : "Responsável pirotécnico – —";
            WordOpenXmlTextHelper.SetCellText(zonaRows[1].Elements<TableCell>().First(), txt);
        }

        PreencherTabelaHorario(zonaTable, zona);
        PreencherTabelaArtigos(artigosTable, zona);
    }

    private static void NormalizarRodapePsp(MainDocumentPart mainPart)
    {
        foreach (var footerPart in mainPart.FooterParts)
        {
            if (footerPart.Footer == null)
                continue;
            WordOpenXmlTextHelper.NormalizarRodapePsp(footerPart.Footer);
        }
    }

    private static void PreencherTabelaHorario(Table table, ServicoZonaLancamento zona)
    {
        var rows = table.Elements<TableRow>().ToList();
        if (rows.Count < 4)
            return;

        var headerRows = rows.Take(3).ToList();
        var templateRow = rows[3];
        foreach (var row in rows.Skip(3))
            row.Remove();

        var linhas = (zona.Linhas ?? []).OrderBy(l => l.Data).ThenBy(l => l.HoraInicio).ToList();
        if (linhas.Count == 0)
        {
            var empty = (TableRow)templateRow.CloneNode(true);
            var cells = empty.Elements<TableCell>().ToList();
            if (cells.Count >= 4)
            {
                WordOpenXmlTextHelper.SetCellText(cells[0], "—");
                WordOpenXmlTextHelper.SetCellText(cells[1], "—");
                WordOpenXmlTextHelper.SetCellText(cells[2], "—");
                WordOpenXmlTextHelper.SetCellText(cells[3], "—");
            }
            table.Append(empty);
            return;
        }

        foreach (var linha in linhas)
        {
            var row = (TableRow)templateRow.CloneNode(true);
            var cells = row.Elements<TableCell>().ToList();
            if (cells.Count < 4)
                continue;

            var calibre = linha.Produto?.Nome ?? linha.Produto?.Calibre ?? linha.Produto?.FiltroTecnico ?? "—";
            if (!string.IsNullOrWhiteSpace(linha.Produto?.Calibre) && !calibre.Contains(linha.Produto.Calibre, StringComparison.OrdinalIgnoreCase))
                calibre = $"{calibre} {linha.Produto.Calibre}".Trim();

            WordOpenXmlTextHelper.SetCellText(cells[0], linha.Data.ToString("dd/MM/yyyy"));
            WordOpenXmlTextHelper.SetCellText(cells[1], FormatarHoraPsp(linha.HoraInicio, linha.HoraFim));
            WordOpenXmlTextHelper.SetCellText(cells[2], calibre);
            WordOpenXmlTextHelper.SetCellText(cells[3], linha.Quantidade.ToString("0.####", CulturaPt));
            table.Append(row);
        }
    }

    private static void PreencherTabelaArtigos(Table table, ServicoZonaLancamento zona)
    {
        var rows = table.Elements<TableRow>().ToList();
        if (rows.Count < 2)
            return;

        var header = rows[0];
        var totalRow = rows.LastOrDefault(r => r.InnerText.Contains("Total", StringComparison.OrdinalIgnoreCase));
        var templateRow = rows.Count > 2 ? rows[1] : rows[^1];

        foreach (var row in rows.Where(r => r != header && r != totalRow).ToList())
            row.Remove();

        var linhas = (zona.Linhas ?? []).ToList();
        decimal totalQtd = 0;
        decimal totalNem = 0;
        var idx = 1;

        foreach (var g in linhas.GroupBy(l => l.ProdutoId))
        {
            var first = g.First();
            var p = first.Produto;
            var qtd = g.Sum(x => x.Quantidade);
            var nemUnit = p?.NEMPorUnidade ?? 0;
            totalQtd += qtd;
            totalNem += qtd * nemUnit;

            var row = (TableRow)templateRow.CloneNode(true);
            var cells = row.Elements<TableCell>().ToList();
            if (cells.Count < 5)
                continue;

            WordOpenXmlTextHelper.SetCellText(cells[0], $"{idx}. {p?.Nome ?? $"Produto #{first.ProdutoId}"}");
            WordOpenXmlTextHelper.SetCellText(cells[1], qtd.ToString("0.####", CulturaPt));
            WordOpenXmlTextHelper.SetCellText(cells[2], p?.Calibre ?? "—");
            WordOpenXmlTextHelper.SetCellText(cells[3], p?.Categoria ?? "—");
            WordOpenXmlTextHelper.SetCellText(cells[4], nemUnit.ToString("0.###", CulturaPt));
            table.InsertBefore(row, totalRow);
            idx++;
        }

        if (totalRow != null)
        {
            var totalCells = totalRow.Elements<TableCell>().ToList();
            if (totalCells.Count >= 2)
                WordOpenXmlTextHelper.SetCellText(totalCells[1], totalQtd.ToString("0.####", CulturaPt));
            if (totalCells.Count >= 5)
                WordOpenXmlTextHelper.SetCellText(totalCells[^1], totalNem.ToString("0.###", CulturaPt));
        }
        else if (linhas.Count == 0)
        {
            var row = (TableRow)templateRow.CloneNode(true);
            var cells = row.Elements<TableCell>().ToList();
            for (var c = 0; c < cells.Count; c++)
                WordOpenXmlTextHelper.SetCellText(cells[c], "—");
            table.Append(row);
        }
    }

    private static void ExpandirZonas(WordprocessingDocument doc, Servico servico)
    {
        var body = doc.MainDocumentPart!.Document.Body!;
        var zonas = (servico.ZonasLancamento ?? []).OrderBy(z => z.Id).ToList();
        if (zonas.Count == 0)
        {
            WordOpenXmlTextHelper.ReplaceAll(body, new Dictionary<string, string> { ["{{ZONA_BLOCO}}"] = "—" });
            return;
        }

        var blocoTemplate = body.Descendants<Paragraph>()
            .FirstOrDefault(p => p.InnerText.Contains("{{ZONA_BLOCO}}", StringComparison.Ordinal));
        if (blocoTemplate == null)
        {
            WordOpenXmlTextHelper.ReplaceAll(body, new Dictionary<string, string>
            {
                ["{{ZONA_BLOCO}}"] = string.Join("\n\n", zonas.Select((z, i) => FormatarZonaTexto(z, i + 1)))
            });
            return;
        }

        blocoTemplate.Remove();
        Paragraph? anchor = body.Descendants<Paragraph>()
            .FirstOrDefault(p => p.InnerText.Contains("{{ZONA_BLOCO}}", StringComparison.Ordinal));

        for (var i = 0; i < zonas.Count; i++)
        {
            var clone = (Paragraph)blocoTemplate.CloneNode(true);
            var txt = clone.InnerText
                .Replace("{{ZONA_BLOCO}}", FormatarZonaTexto(zonas[i], i + 1), StringComparison.Ordinal)
                .Replace("{{ZONA_NUMERO}}", (i + 1).ToString(), StringComparison.Ordinal)
                .Replace("{{ZONA_DESIGNACAO}}", zonas[i].Designacao ?? "—", StringComparison.Ordinal);
            WordOpenXmlTextHelper.SetParagraphText(clone, txt);
            if (anchor != null)
                body.InsertAfter(clone, anchor);
            else
                body.AppendChild(clone);
            anchor = clone;
        }
    }

    private static byte[] GerarProgramaticamente(Servico servico, EmpresaPirotecnicaOptions empresa)
    {
        using var ms = new MemoryStream();
        using (var doc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document, true))
        {
            var main = doc.AddMainDocumentPart();
            main.Document = new Document(new Body());
            var body = main.Document.Body!;

            AdicionarParagrafo(body, "DECLARAÇÃO — REGULAMENTO PSP (n.º 1/2025)", negrito: true, tamanho: 24);
            AdicionarParagrafo(body, string.Empty);
            AdicionarParagrafo(body, EmpresaPirotecnicaTextoFixo.Titulo, negrito: true);
            foreach (var line in EmpresaPirotecnicaTextoFixo.Linhas)
                AdicionarParagrafo(body, line);
            AdicionarParagrafo(body, string.Empty);

            var promotor = servico.Cliente?.Nome ?? servico.Encomenda?.Cliente?.Nome ?? "—";
            AdicionarParagrafo(body, "Evento / local / data / promotor", negrito: true);
            AdicionarParagrafo(body, $"Evento: {servico.NomeEvento ?? servico.Encomenda?.Nome ?? "—"}");
            AdicionarParagrafo(body, $"Local: {FormatarLocalGeral(servico)}");
            AdicionarParagrafo(body, $"Data: {servico.DataServico:dd/MM/yyyy}");
            AdicionarParagrafo(body, $"Promotor: {promotor}");
            if (servico.CoordenadorPirotecnico != null)
            {
                AdicionarParagrafo(body, string.Empty);
                AdicionarParagrafo(body, $"Coordenador pirotécnico: {servico.CoordenadorPirotecnico.NomeCompleto} — CRED n.º {servico.CoordenadorPirotecnico.NumeroCredencial ?? "—"}");
            }

            var zonas = (servico.ZonasLancamento ?? []).OrderBy(z => z.Id).ToList();
            if (zonas.Count == 0)
                AdicionarParagrafo(body, "Sem zonas de lançamento registadas.", italico: true);
            else
            {
                for (var i = 0; i < zonas.Count; i++)
                {
                    AdicionarParagrafo(body, string.Empty);
                    AdicionarSecaoZona(body, zonas[i], i + 1);
                }
            }

            AdicionarParagrafo(body, string.Empty);
            AdicionarParagrafo(body, "Declaro que o material pirotécnico se encontra devidamente acondicionado e que será cumprido o plano de montagem e as distâncias de segurança aplicáveis.", italico: true);
            AdicionarParagrafo(body, string.Empty);
            AdicionarParagrafo(body, $"Data: {DateTime.Today:dd/MM/yyyy}");
            AdicionarParagrafo(body, "A Gerência", negrito: true);

            main.Document.Save();
        }

        return ms.ToArray();
    }

    private static void AdicionarSecaoZona(Body body, ServicoZonaLancamento zona, int numero)
    {
        var resp = zona.ResponsavelPirotecnico;
        AdicionarParagrafo(body, $"Zona de lançamento n.º {numero} — {zona.Designacao ?? "—"}", negrito: true);
        if (zona.CoordenadasLat.HasValue && zona.CoordenadasLng.HasValue)
            AdicionarParagrafo(body, $"Coordenadas: {zona.CoordenadasLat:F6}, {zona.CoordenadasLng:F6}");
        if (resp != null)
            AdicionarParagrafo(body, $"Responsável pirotécnico: {resp.NomeCompleto} — CRED n.º {resp.NumeroCredencial ?? "—"}");

        var linhas = (zona.Linhas ?? []).OrderBy(l => l.Data).ThenBy(l => l.HoraInicio).ToList();
        AdicionarParagrafo(body, "Horário de lançamento", negrito: true);
        AdicionarTabelaHorario(body, linhas);

        AdicionarParagrafo(body, "Artigos pirotécnicos", negrito: true);
        AdicionarTabelaArtigos(body, linhas);
    }

    private static void AdicionarTabelaHorario(Body body, IReadOnlyList<ServicoZonaLinha> linhas)
    {
        var rows = new List<string[]> { new[] { "Data", "Hora", "Tipo / Calibre (mm)", "Quantidade" } };
        foreach (var l in linhas)
        {
            var hora = FormatarHora(l.HoraInicio, l.HoraFim);
            var calibre = l.Produto?.Calibre ?? l.Produto?.FiltroTecnico ?? "—";
            rows.Add(new[] { l.Data.ToString("dd/MM/yyyy"), hora, calibre, l.Quantidade.ToString("0.####") });
        }
        if (linhas.Count == 0)
            rows.Add(new[] { "—", "—", "—", "—" });
        AdicionarTabela(body, rows);
    }

    private static void AdicionarTabelaArtigos(Body body, IReadOnlyList<ServicoZonaLinha> linhas)
    {
        var rows = new List<string[]> { new[] { "Artigo", "Quantidade", "Calibre (mm)", "Categoria", "NEM unitário (kg)" } };
        decimal totalQtd = 0;
        decimal totalNem = 0;
        foreach (var g in linhas.GroupBy(l => l.ProdutoId))
        {
            var first = g.First();
            var p = first.Produto;
            var qtd = g.Sum(x => x.Quantidade);
            var nemUnit = p?.NEMPorUnidade ?? 0;
            totalQtd += qtd;
            totalNem += qtd * nemUnit;
            rows.Add(new[]
            {
                p?.Nome ?? $"Produto #{first.ProdutoId}",
                qtd.ToString("0.####"),
                p?.Calibre ?? "—",
                p?.Categoria ?? "—",
                nemUnit.ToString("0.####")
            });
        }
        if (linhas.Count == 0)
            rows.Add(new[] { "—", "—", "—", "—", "—" });
        else
            rows.Add(new[] { "TOTAIS", totalQtd.ToString("0.####"), "", "", totalNem.ToString("0.####") });
        AdicionarTabela(body, rows);
    }

    private static void AdicionarTabela(Body body, IReadOnlyList<string[]> rows)
    {
        var table = new Table();
        foreach (var row in rows)
        {
            var tr = new TableRow();
            foreach (var cell in row)
                tr.Append(new TableCell(new Paragraph(new Run(new Text(cell ?? "")))));
            table.Append(tr);
        }
        body.Append(table);
    }

    private static string FormatarZonaTexto(ServicoZonaLancamento zona, int numero)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"Zona n.º {numero} — {zona.Designacao ?? "—"}");
        if (zona.CoordenadasLat.HasValue && zona.CoordenadasLng.HasValue)
            sb.AppendLine($"Coordenadas: {zona.CoordenadasLat:F6}, {zona.CoordenadasLng:F6}");
        var resp = zona.ResponsavelPirotecnico;
        if (resp != null)
            sb.AppendLine($"Responsável: {resp.NomeCompleto} — CRED {resp.NumeroCredencial ?? "—"}");
        foreach (var l in (zona.Linhas ?? []).OrderBy(x => x.Data))
        {
            var calibre = l.Produto?.Calibre ?? "—";
            sb.AppendLine($"- {l.Data:dd/MM/yyyy} {FormatarHora(l.HoraInicio, l.HoraFim)} | {calibre} | {l.Quantidade:0.####}");
        }
        return sb.ToString().TrimEnd();
    }

    private static string FormatarLocalGeral(Servico servico)
    {
        var partes = new[] { servico.Local, servico.MoradaCompleta, servico.Cidade, servico.Municipio, servico.Distrito }
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => p!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase);
        var txt = string.Join(", ", partes);
        return string.IsNullOrWhiteSpace(txt) ? "—" : txt;
    }

    private static string FormatarDataEventoLonga(DateTime data) =>
        data.ToString("d 'de' MMMM 'de' yyyy", CulturaPt).ToUpper(CulturaPt);

    private static string FormatarDataDeclaracao(DateTime data) =>
        data.ToString("d 'de' MMMM 'de' yyyy", CulturaPt);

    private static string FormatarHoraPsp(TimeSpan? inicio, TimeSpan? fim)
    {
        if (!inicio.HasValue && !fim.HasValue) return "—";
        if (inicio.HasValue && fim.HasValue)
            return $"{inicio.Value.Hours:D2}H{inicio.Value.Minutes:D2} ÀS {fim.Value.Hours:D2}H{fim.Value.Minutes:D2}";
        var t = inicio ?? fim!.Value;
        return $"{t.Hours:D2}H{t.Minutes:D2}";
    }

    private static string FormatarHora(TimeSpan? inicio, TimeSpan? fim)
    {
        if (!inicio.HasValue && !fim.HasValue) return "—";
        if (inicio.HasValue && fim.HasValue)
            return $"{inicio.Value:hh\\:mm} – {fim.Value:hh\\:mm}";
        return inicio?.ToString(@"hh\:mm") ?? fim?.ToString(@"hh\:mm") ?? "—";
    }

    private static void AdicionarParagrafo(Body body, string texto, bool negrito = false, bool italico = false, int? tamanho = null)
    {
        var run = new Run();
        if (negrito || italico || tamanho.HasValue)
        {
            var props = new RunProperties();
            if (negrito) props.Append(new Bold());
            if (italico) props.Append(new Italic());
            if (tamanho.HasValue) props.Append(new FontSize { Val = tamanho.Value.ToString() });
            run.Append(props);
        }
        run.Append(new Text(texto) { Space = SpaceProcessingModeValues.Preserve });
        body.Append(new Paragraph(run));
    }
}
