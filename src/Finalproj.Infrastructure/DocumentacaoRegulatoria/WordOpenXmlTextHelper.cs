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

    /// <summary>Reescreve célula ou caixa de texto com o bloco oficial da empresa pirotécnica (título + linhas de dados).</summary>
    public static void SetEmpresaPirotecnicaFixa(OpenXmlCompositeElement container)
    {
        SetCaixaComTitulo(container, EmpresaPirotecnicaTextoFixo.Titulo, EmpresaPirotecnicaTextoFixo.Linhas);
    }

    /// <summary>Reescreve caixa do promotor (título + evento/local/data).</summary>
    public static void SetPromotorFixa(OpenXmlCompositeElement container, IReadOnlyList<string> linhasEvento)
    {
        SetCaixaComTitulo(container, "Promotor:", linhasEvento);
    }

    public static void SetCaixaComTitulo(
        OpenXmlCompositeElement container,
        string titulo,
        IReadOnlyList<string> linhas,
        bool tituloNegrito = true)
    {
        container.RemoveAllChildren();
        container.Append(CriarParagrafoEsquerdaMultiLinha(titulo, linhas, tituloNegrito));
    }

    public static void SetLinhasFixas(OpenXmlCompositeElement container, IReadOnlyList<string> linhas)
    {
        container.RemoveAllChildren();
        foreach (var line in linhas)
            container.Append(CriarParagrafoEsquerda(line));
    }

    public static Table CriarTabelaCardCabecalho(string titulo, IReadOnlyList<string> linhas)
    {
        var cell = new TableCell();
        cell.Append(CriarParagrafoEsquerda(titulo, negrito: true));
        foreach (var line in linhas)
            cell.Append(CriarParagrafoEsquerda(line));

        cell.PrependChild(new TableCellProperties(new TableCellWidth
        {
            Type = TableWidthUnitValues.Dxa,
            Width = "10031"
        }));

        return new Table(
            new TableProperties(
                new TableStyle { Val = "TabelacomGrelha" },
                new TableWidth { Type = TableWidthUnitValues.Auto, Width = "0" },
                new TableLook
                {
                    Val = "04A0",
                    FirstRow = false,
                    FirstColumn = false
                }),
            new TableGrid(new GridColumn { Width = "10031" }),
            new TableRow(cell));
    }

    public static void AplicarEsquerdaContainer(OpenXmlCompositeElement container)
    {
        foreach (var paragraph in container.Elements<Paragraph>())
            AplicarEsquerdaParagrafo(paragraph);
    }

    public static void AplicarEsquerdaTabela(Table table)
    {
        foreach (var cell in table.Descendants<TableCell>())
        {
            foreach (var paragraph in cell.Elements<Paragraph>())
                AplicarEsquerdaParagrafo(paragraph);
        }
    }

    /// <summary>Reescreve o rodapé com parágrafos simples centrados (evita textboxes ancoradas mal convertidas para PDF).</summary>
    public static void NormalizarRodapePsp(Footer footer)
    {
        footer.RemoveAllChildren();
        footer.Append(CriarParagrafoCentrado(PspRodapeTextoFixo.LinhaCompleta, tamanho: 20));
    }

    /// <summary>
    /// Garante espaço estético entre o conteúdo e o rodapé fixo da declaração PSP.
    /// O template oficial tem secções com margem inferior reduzida (900 twips) sem referência ao rodapé —
    /// isso faz o conversor PDF sobrepor tabelas ao texto do rodapé.
    /// </summary>
    public static void AplicarEspacamentoMinimoRodapePsp(Body body)
    {
        const uint footerDistanciaTwips = 712;   // valor do template PSP oficial
        const uint margemInferiorMinTwips = 2178; // ~3,8 cm — igual à secção principal do template
        const int respiroFinalTwips = 480;        // ~24 pt de respiro no fluxo antes do fim do documento

        var sectPrs = body.Descendants<SectionProperties>().ToList();
        if (sectPrs.Count == 0)
            return;

        var refRodape = sectPrs
            .Select(s => s.GetFirstChild<FooterReference>())
            .FirstOrDefault(r => r != null);

        foreach (var sectPr in sectPrs)
        {
            var pgMar = sectPr.GetFirstChild<PageMargin>();
            if (pgMar == null)
            {
                pgMar = new PageMargin();
                sectPr.PrependChild(pgMar);
            }

            pgMar.Footer = (int)footerDistanciaTwips;

            var bottomAtual = pgMar.Bottom?.Value ?? 0;
            if (bottomAtual < margemInferiorMinTwips)
                pgMar.Bottom = (int)margemInferiorMinTwips;

            if (refRodape != null && sectPr.GetFirstChild<FooterReference>() == null)
                sectPr.InsertAt((FooterReference)refRodape.CloneNode(true), 0);
        }

        InserirRespiroFinalDocumento(body, respiroFinalTwips);
    }

    private static void InserirRespiroFinalDocumento(Body body, int afterTwips)
    {
        var sectPr = body.Elements<SectionProperties>().LastOrDefault();
        var vizinho = sectPr?.PreviousSibling();

        if (vizinho is Paragraph prev
            && string.IsNullOrWhiteSpace(prev.InnerText)
            && prev.ParagraphProperties?.SpacingBetweenLines?.After?.Value == afterTwips.ToString())
            return;

        var spacer = CriarParagrafoEspacamento(afterTwips);
        if (sectPr != null)
            body.InsertBefore(spacer, sectPr);
        else
            body.Append(spacer);
    }

    private static Paragraph CriarParagrafoEspacamento(int afterTwips)
    {
        var paragraph = new Paragraph();
        AplicarEspacamentoDepoisParagrafo(paragraph, afterTwips);
        return paragraph;
    }

    private static void AplicarEspacamentoDepoisParagrafo(Paragraph paragraph, int afterTwips)
    {
        var pPr = paragraph.GetFirstChild<ParagraphProperties>();
        if (pPr == null)
        {
            pPr = new ParagraphProperties();
            paragraph.PrependChild(pPr);
        }

        pPr.SpacingBetweenLines = new SpacingBetweenLines { After = afterTwips.ToString() };
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

    private static void AplicarEsquerdaParagrafo(Paragraph paragraph)
    {
        var pPr = paragraph.GetFirstChild<ParagraphProperties>();
        if (pPr == null)
        {
            pPr = new ParagraphProperties();
            paragraph.PrependChild(pPr);
        }

        pPr.Justification = new Justification { Val = JustificationValues.Left };
    }

    private static Paragraph CriarParagrafoEsquerdaMultiLinha(
        string titulo,
        IReadOnlyList<string> linhas,
        bool tituloNegrito)
    {
        var paragraph = new Paragraph();
        AplicarEsquerdaParagrafo(paragraph);

        var titleRun = new Run(new Text(titulo) { Space = SpaceProcessingModeValues.Preserve });
        if (tituloNegrito)
            titleRun.RunProperties = new RunProperties(new Bold());
        paragraph.Append(titleRun);

        foreach (var line in linhas)
        {
            paragraph.Append(new Run(new Break()));
            var contentRun = new Run(new Text(line) { Space = SpaceProcessingModeValues.Preserve });
            contentRun.RunProperties = new RunProperties(new Bold { Val = OnOffValue.FromBoolean(false) });
            paragraph.Append(contentRun);
        }

        return paragraph;
    }

    private static Paragraph CriarParagrafoEsquerda(string text, bool negrito = false, int? tamanho = null)
    {
        var runProps = new RunProperties();
        if (negrito)
            runProps.Bold = new Bold();
        if (tamanho.HasValue)
            runProps.FontSize = new FontSize { Val = tamanho.Value.ToString() };

        var run = new Run(new Text(text) { Space = SpaceProcessingModeValues.Preserve });
        if (negrito || tamanho.HasValue)
            run.RunProperties = runProps;

        var paragraph = new Paragraph(run);
        AplicarEsquerdaParagrafo(paragraph);
        return paragraph;
    }
}
