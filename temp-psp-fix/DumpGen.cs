using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.DocumentacaoRegulatoria;

var tplDir = Path.GetFullPath(Path.Combine("src", "Finalproj.Api", "Templates", "psp"));
var tpl = Path.Combine(tplDir, "declaracao-psp.docx");
var src = Path.Combine(tplDir, "declaracao-psp-source.docx");
if (!File.Exists(tpl))
    PspDeclaracaoTemplatePreparador.Prepare(src, tpl);

var servico = new Servico
{
    Id = 42,
    NomeEvento = "FESTA TESTE PSP",
    Local = "Fafe",
    DataServico = new DateTime(2026, 4, 5),
    Cliente = new Cliente { Nome = "Test" },
    CoordenadorPirotecnico = new Funcionario { Id = 2, NomeCompleto = "Coordenador Teste", NumeroCredencial = "3412" },
    ZonasLancamento = new List<ServicoZonaLancamento>
    {
        new()
        {
            Id = 1,
            Designacao = "Z1",
            ResponsavelPirotecnico = new Funcionario { Id = 1, NomeCompleto = "T", NumeroCredencial = "9999" },
            Linhas = new List<ServicoZonaLinha>
            {
                new()
                {
                    Id = 1,
                    Data = new DateTime(2026, 4, 5),
                    HoraInicio = TimeSpan.FromHours(21),
                    HoraFim = TimeSpan.FromHours(22),
                    ProdutoId = 1,
                    Produto = new Produto { Id = 1, Nome = "BALONAS", FamiliaRisco = "1.3G" },
                    Quantidade = 10
                }
            }
        }
    }
};

var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), tpl);
File.WriteAllBytes("temp-psp-fix/live-check.docx", bytes);

using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
var body = doc.MainDocumentPart!.Document.Body!;
Console.WriteLine("TXBX count: " + body.Descendants<TextBoxContent>().Count());
foreach (var tx in body.Descendants<TextBoxContent>())
{
    Console.WriteLine("--- TXBX ---");
    Console.WriteLine("paras=" + tx.Elements<Paragraph>().Count());
    Console.WriteLine("text=" + tx.InnerText.Replace('\n', '|').Substring(0, Math.Min(120, tx.InnerText.Length)));
    foreach (var p in tx.Elements<Paragraph>())
    {
        var bdr = p.ParagraphProperties?.ParagraphBorders != null;
        var breaks = p.Descendants<Break>().Count();
        Console.WriteLine($"  p bdr={bdr} breaks={breaks} text={p.InnerText.Trim().Substring(0, Math.Min(60, p.InnerText.Trim().Length))}");
    }
}

foreach (var p in body.Descendants<Paragraph>()
             .Where(p => p.InnerText.Trim().Equals("Empresa pirotécnica:", StringComparison.OrdinalIgnoreCase)))
{
    var inTx = p.Ancestors<TextBoxContent>().Any();
    Console.WriteLine("Empresa title para inTxbx=" + inTx);
}

Console.WriteLine("Fallback count: " + body.InnerXml.Split("mc:Fallback").Length);
