using System;
using System.IO;
using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.DocumentacaoRegulatoria;
using Finalproj.Tests.TestHelpers;

var src = Path.GetFullPath("src/Finalproj.Api/Templates/psp/declaracao-psp-source.docx");
var tpl = Path.GetFullPath("src/Finalproj.Api/Templates/psp/declaracao-psp.docx");
if (!File.Exists(tpl)) PspDeclaracaoTemplatePreparador.Prepare(src, tpl);

var servico = new Servico {
    Id=42, NomeEvento="FESTA TESTE PSP", Local="Fafe", DataServico=new DateTime(2026,4,5),
    Cliente=new Cliente{Nome="Test"},
    CoordenadorPirotecnico=new Funcionario{Id=2,NomeCompleto="Coordenador Teste",NumeroCredencial="3412"},
    ZonasLancamento=new List<ServicoZonaLancamento>{ new ServicoZonaLancamento{
        Id=1, Designacao="Z1",
        ResponsavelPirotecnico=new Funcionario{Id=1,NomeCompleto="T",NumeroCredencial="9999"},
        Linhas=new List<ServicoZonaLinha>{ new ServicoZonaLinha{
            Id=1, Data=new DateTime(2026,4,5), HoraInicio=TimeSpan.FromHours(21), HoraFim=TimeSpan.FromHours(22),
            ProdutoId=1, Produto=new Produto{Id=1,Nome="BALONAS",FamiliaRisco="1.3G",FiltroTecnico=TestProdutoDefaults.FiltroTecnico,Calibre="60MM",Categoria="F4",GrupoCompatibilidade=TestProdutoDefaults.GrupoCompatibilidade,NEMPorUnidade=8.8m},
            Quantidade=10 } } } } };

var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), tpl);
Directory.CreateDirectory("temp-psp-fix");
File.WriteAllBytes("temp-psp-fix/generated3.docx", bytes);

using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
var body = doc.MainDocumentPart!.Document.Body!;
Console.WriteLine("=== TXBX ===");
foreach (var tx in body.Descendants<TextBoxContent>()) {
    var i = 0;
    foreach (var p in tx.Elements<Paragraph>()) {
        var bdr = p.ParagraphProperties?.ParagraphBorders != null;
        Console.WriteLine($"  p{i} bdr={bdr} text={p.InnerText.Trim()}");
        i++;
    }
    Console.WriteLine("---");
}
Console.WriteLine("=== PARAS Empresa outside txbx ===");
foreach (var p in body.Descendants<Paragraph>().Where(p => p.InnerText.Contains("Empresa pirot", StringComparison.OrdinalIgnoreCase) && !p.Ancestors<TextBoxContent>().Any())) {
    Console.WriteLine($"OUT: {p.InnerText.Trim()}");
}
Console.WriteLine("=== wsp count with Empresa ===");
foreach (var alt in body.Descendants().Where(e => e.LocalName == "AlternateContent")) {
    if (!alt.InnerText.Contains("Empresa pirot", StringComparison.OrdinalIgnoreCase)) continue;
    var wsps = alt.Descendants().Where(e => e.LocalName == "wsp").Count();
    var txbx = alt.Descendants<TextBoxContent>().Count();
    Console.WriteLine($"alt wsp={wsps} txbx={txbx}");
}
