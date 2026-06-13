using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace Finalproj.Infrastructure.DocumentacaoRegulatoria;

/// <summary>Converte o modelo PSP oficial (com dados de exemplo) num template com marcadores.</summary>
public static class PspDeclaracaoTemplatePreparador
{
    public static void Prepare(string sourcePath, string destinationPath)
    {
        var dir = Path.GetDirectoryName(destinationPath);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);

        File.Copy(sourcePath, destinationPath, overwrite: true);

        using var doc = WordprocessingDocument.Open(destinationPath, true);
        var body = doc.MainDocumentPart!.Document.Body!;
        var map = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["24 de março de 2026"] = "{{DATA_DECLARACAO}}",
            ["VITOR DE SOUSA TEIXEIRA"] = "{{ZONA_RESP_NOME}}",
            ["CRED Nº3412"] = "CRED Nº{{ZONA_RESP_CRED}}",
        };

        WordOpenXmlTextHelper.ReplaceAll(body, map);

        foreach (var paragraph in body.Descendants<Paragraph>())
        {
            var text = paragraph.InnerText;
            if (text.Contains("Coordenador pirotécnico (quando aplicável):", StringComparison.Ordinal)
                && string.IsNullOrWhiteSpace(text.Replace("Coordenador pirotécnico (quando aplicável):", "", StringComparison.Ordinal)))
            {
                // parágrafo vazio abaixo do cabeçalho — preenchido na geração
            }
        }

        // Coordenador: segundo parágrafo da célula da tabela 0
        var coordTable = body.Descendants<Table>().FirstOrDefault(t =>
            t.InnerText.Contains("Coordenador pirotécnico", StringComparison.OrdinalIgnoreCase));
        if (coordTable != null)
        {
            var cell = coordTable.Descendants<TableCell>().FirstOrDefault();
            var paras = cell?.Elements<Paragraph>().ToList();
            if (paras is { Count: >= 2 })
                WordOpenXmlTextHelper.SetParagraphText(paras[1], "{{COORDENADOR_NOME}} — CRED n.º {{COORDENADOR_CRED}}");
            WordOpenXmlTextHelper.AplicarEsquerdaTabela(coordTable);
        }

        doc.MainDocumentPart.Document.Save();
    }
}
