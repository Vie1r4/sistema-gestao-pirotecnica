using System;
using System.IO;
using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.DocumentacaoRegulatoria;
using Finalproj.Tests.TestHelpers;

var tpl = Path.GetFullPath("src/Finalproj.Api/Templates/psp/declaracao-psp.docx");
if (!File.Exists(tpl)) PspDeclaracaoTemplatePreparador.Prepare(
    Path.GetFullPath("src/Finalproj.Api/Templates/psp/declaracao-psp-source.docx"), tpl);

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
File.WriteAllBytes("temp-psp-fix/generated.docx", bytes);

using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
var body = doc.MainDocumentPart!.Document.Body!;
var declPara = body.Descendants<Paragraph>().First(p => p.InnerText.Contains("DECLARA", StringComparison.OrdinalIgnoreCase));
Console.WriteLine("DECLARA pBdr: " + (declPara.ParagraphProperties?.ParagraphBorders != null));
var pBdrCount = body.Descendants<ParagraphBorders>().Count();
Console.WriteLine("Total pBdr paragraphs: " + pBdrCount);
foreach (var tx in body.Descendants<TextBoxContent>()) {
    var t = tx.InnerText.Replace('\n',' ').Trim();
    if (t.Length > 120) t = t[..120] + "...";
    var hasPromotor = t.Contains("Promotor:", StringComparison.Ordinal);
    var hasEmpresa = t.Contains("Empresa pirot", StringComparison.OrdinalIgnoreCase);
    var hasDesign = t.Contains("Designação", StringComparison.OrdinalIgnoreCase);
    var firstLine = tx.Elements<Paragraph>().FirstOrDefault()?.InnerText ?? "";
    Console.WriteLine($"TXBX first='{firstLine}' promotor={hasPromotor} empresa={hasEmpresa} design={hasDesign} paras={tx.Elements<Paragraph>().Count()}");
}
