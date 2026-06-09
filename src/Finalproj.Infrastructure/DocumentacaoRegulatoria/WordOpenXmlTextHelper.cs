using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Wordprocessing;

namespace Finalproj.Infrastructure.DocumentacaoRegulatoria;

/// <summary>Substituição de texto em parágrafos Word (inclui caixas de texto), mesmo com runs fragmentados.</summary>
internal static class WordOpenXmlTextHelper
{
    public static void ReplaceAll(OpenXmlElement root, IReadOnlyDictionary<string, string> map)
    {
        foreach (var paragraph in root.Descendants<Paragraph>())
            ReplaceInParagraph(paragraph, map);
    }

    public static void ReplaceInParagraph(Paragraph paragraph, IReadOnlyDictionary<string, string> map)
    {
        if (paragraph.Descendants<Break>().Any())
        {
            ReplaceInParagraphPreservingBreaks(paragraph, map);
            return;
        }

        var texts = paragraph.Descendants<Text>().ToList();
        if (texts.Count == 0)
            return;

        var full = string.Concat(texts.Select(t => t.Text));
        var changed = false;
        foreach (var (key, value) in map)
        {
            if (!full.Contains(key, StringComparison.Ordinal))
                continue;
            full = full.Replace(key, value, StringComparison.Ordinal);
            changed = true;
        }

        if (!changed)
            return;

        texts[0].Text = full;
        texts[0].Space = SpaceProcessingModeValues.Preserve;
        for (var i = 1; i < texts.Count; i++)
            texts[i].Text = string.Empty;
    }

    private static void ReplaceInParagraphPreservingBreaks(Paragraph paragraph, IReadOnlyDictionary<string, string> map)
    {
        foreach (var text in paragraph.Descendants<Text>())
        {
            var t = text.Text;
            var changed = false;
            foreach (var (key, value) in map)
            {
                if (!t.Contains(key, StringComparison.Ordinal))
                    continue;
                t = t.Replace(key, value, StringComparison.Ordinal);
                changed = true;
            }

            if (changed)
            {
                text.Text = t;
                text.Space = SpaceProcessingModeValues.Preserve;
            }
        }
    }

    /// <summary>Reescreve célula ou caixa de texto com o bloco oficial da empresa pirotécnica (só linhas de dados; o rótulo fica no template).</summary>
    public static void SetEmpresaPirotecnicaFixa(OpenXmlCompositeElement container)
    {
        container.RemoveAllChildren();

        foreach (var line in EmpresaPirotecnicaTextoFixo.Linhas)
            container.Append(new Paragraph(new Run(new Text(line) { Space = SpaceProcessingModeValues.Preserve })));
    }

    public static void SetLinhasFixas(OpenXmlCompositeElement container, IReadOnlyList<string> linhas)
    {
        container.RemoveAllChildren();
        foreach (var line in linhas)
            container.Append(new Paragraph(new Run(new Text(line) { Space = SpaceProcessingModeValues.Preserve })));
    }

    /// <summary>Reescreve o rodapé com parágrafos simples centrados (evita textboxes ancoradas mal convertidas para PDF).</summary>
    public static void NormalizarRodapePsp(Footer footer)
    {
        footer.RemoveAllChildren();
        footer.Append(CriarParagrafoCentrado(PspRodapeTextoFixo.LinhaCompleta, tamanho: 20));
    }

    public static void EnsureCellContentCentered(TableCell cell)
    {
        var tcPr = cell.GetFirstChild<TableCellProperties>();
        if (tcPr == null)
        {
            tcPr = new TableCellProperties();
            cell.PrependChild(tcPr);
        }

        tcPr.TableCellVerticalAlignment = new TableCellVerticalAlignment
        {
            Val = TableVerticalAlignmentValues.Center
        };

        foreach (var paragraph in cell.Elements<Paragraph>())
            AplicarCentroParagrafo(paragraph);
    }

    public static void CentralizarTabela(Table table, int fromRow = 0)
    {
        foreach (var row in table.Elements<TableRow>().Skip(fromRow))
        {
            foreach (var cell in row.Elements<TableCell>())
                EnsureCellContentCentered(cell);
        }
    }

    public static void SetCellText(TableCell cell, string text)
    {
        var paragraphs = cell.Elements<Paragraph>().ToList();
        if (paragraphs.Count == 0)
        {
            cell.Append(CriarParagrafoCentrado(text));
            return;
        }

        var first = paragraphs[0];
        foreach (var extra in paragraphs.Skip(1))
            extra.Remove();

        var texts = first.Descendants<Text>().ToList();
        if (texts.Count == 0)
        {
            first.Append(new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve }));
        }
        else
        {
            texts[0].Text = text;
            texts[0].Space = SpaceProcessingModeValues.Preserve;
            for (var i = 1; i < texts.Count; i++)
                texts[i].Text = string.Empty;
        }

        EnsureCellContentCentered(cell);
    }

    public static void SetCellLines(TableCell cell, IEnumerable<string> lines)
    {
        var lineList = lines.ToList();
        if (lineList.Count == 0)
        {
            SetCellText(cell, "—");
            return;
        }

        var paragraphs = cell.Elements<Paragraph>().ToList();
        var template = paragraphs.FirstOrDefault() ?? new Paragraph();

        foreach (var p in paragraphs)
            p.Remove();

        for (var i = 0; i < lineList.Count; i++)
        {
            var clone = (Paragraph)template.CloneNode(true);
            SetParagraphText(clone, lineList[i]);
            cell.Append(clone);
        }

        EnsureCellContentCentered(cell);
    }

    public static void SetParagraphText(Paragraph paragraph, string text)
    {
        var texts = paragraph.Descendants<Text>().ToList();
        if (texts.Count == 0)
        {
            paragraph.Append(new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve }));
            return;
        }

        texts[0].Text = text;
        texts[0].Space = SpaceProcessingModeValues.Preserve;
        for (var i = 1; i < texts.Count; i++)
            texts[i].Text = string.Empty;
    }

    private static Paragraph CriarParagrafoCentrado(string text, int? tamanho = null)
    {
        var run = new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve });
        if (tamanho.HasValue)
            run.RunProperties = new RunProperties(new FontSize { Val = tamanho.Value.ToString() });

        var paragraph = new Paragraph(run);
        AplicarCentroParagrafo(paragraph);
        return paragraph;
    }

    private static void AplicarCentroParagrafo(Paragraph paragraph)
    {
        var pPr = paragraph.GetFirstChild<ParagraphProperties>();
        if (pPr == null)
        {
            pPr = new ParagraphProperties();
            paragraph.PrependChild(pPr);
        }

        pPr.Justification = new Justification { Val = JustificationValues.Center };
    }
}
