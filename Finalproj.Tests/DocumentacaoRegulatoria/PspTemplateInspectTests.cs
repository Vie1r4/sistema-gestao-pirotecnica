using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Xunit;
using Xunit.Abstractions;

namespace Finalproj.Tests.DocumentacaoRegulatoria;

public class PspTemplateInspectTests
{
    private readonly ITestOutputHelper _out;

    public PspTemplateInspectTests(ITestOutputHelper output) => _out = output;

    [Fact(Skip = "Ferramenta de inspeção manual do template source.")]
    public void DumpTableRows_DoNotRunInCi()
    {
        var path = Path.GetFullPath(Path.Combine(
            AppContext.BaseDirectory,
            "..", "..", "..", "..",
            "src", "Finalproj.Api", "Templates", "psp", "declaracao-psp-source.docx"));
        if (!File.Exists(path))
        {
            _out.WriteLine($"Skip: {path} not found");
            return;
        }

        using var doc = WordprocessingDocument.Open(path, false);
        var allTables = doc.MainDocumentPart!.Document.Body!.Descendants<Table>().ToList();
        _out.WriteLine($"Tables: {allTables.Count}");
        for (var ti = 0; ti < allTables.Count; ti++)
        {
            _out.WriteLine($"--- Table {ti} ---");
            var rows = allTables[ti].Elements<TableRow>().ToList();
            for (var i = 0; i < rows.Count; i++)
            {
                var cells = rows[i].Elements<TableCell>().ToList();
                _out.WriteLine($"  row {i} ({cells.Count} cells):");
                for (var c = 0; c < cells.Count; c++)
                {
                    var t = string.Concat(cells[c].Descendants<Text>().Select(x => x.Text)).Replace('\n', ' ').Trim();
                    if (t.Length > 0)
                        _out.WriteLine($"    cell {c}: {t[..Math.Min(100, t.Length)]}");
                }
            }
        }
    }
}
