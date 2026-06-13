using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.DocumentacaoRegulatoria;
using Finalproj.Tests.TestHelpers;
using Xunit;

namespace Finalproj.Tests.DocumentacaoRegulatoria;

public class GeradorDeclaracaoPspServiceTests
{
    private static string ApiTemplatesDir => Path.GetFullPath(Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "..",
        "src", "Finalproj.Api", "Templates", "psp"));

    private static string SourcePath => Path.Combine(ApiTemplatesDir, "declaracao-psp-source.docx");
    private static string TemplatePath => Path.Combine(ApiTemplatesDir, "declaracao-psp.docx");

    [Fact]
    public void Preparador_CriaTemplateComMarcadores()
    {
        if (!File.Exists(SourcePath))
            return;

        PspDeclaracaoTemplatePreparador.Prepare(SourcePath, TemplatePath);

        Assert.True(File.Exists(TemplatePath));
        using var doc = WordprocessingDocument.Open(TemplatePath, false);
        var text = doc.MainDocumentPart!.Document.Body!.InnerText;
        Assert.Contains("PIROFAFE, LDA", text);
        Assert.Contains("Evento:", text);
        Assert.DoesNotContain("{{EMPRESA_DESIGNACAO}}", text);
    }

    [Fact]
    public void Gerar_ComTemplateOficial_ProduzDocxValido()
    {
        if (!File.Exists(SourcePath))
            return;

        if (!File.Exists(TemplatePath))
            PspDeclaracaoTemplatePreparador.Prepare(SourcePath, TemplatePath);

        var servico = CriarServicoFixture();
        var empresa = new EmpresaPirotecnicaOptions
        {
            Designacao = "PIROFAFE, LDA",
            Morada = "Travessa das Lages, 67 — Paços de Fafe",
            Alvara = "06/2018",
            Contactos = "914748483"
        };

        var gerador = new GeradorDeclaracaoPspService();
        var bytes = gerador.Gerar(servico, empresa, TemplatePath);

        Assert.NotEmpty(bytes);
        Assert.Equal(0x50, bytes[0]); // PK zip header

        using var ms = new MemoryStream(bytes);
        using var doc = WordprocessingDocument.Open(ms, false);
        var text = doc.MainDocumentPart!.Document.Body!.InnerText;
        Assert.Contains("FESTA TESTE PSP", text);
        Assert.Contains("TRAVESSA DAS LAGES, 67 4820-114 PAÇOS-FAFE", text);
        Assert.Contains("914748483/914201477/916048699", text);
        Assert.Contains("Zona de lançamento n.º 1", text);
        var artigosTable = doc.MainDocumentPart!.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase));
        var artigoRow = artigosTable.Elements<TableRow>().Skip(1).First();
        Assert.Contains("Baterias", artigoRow.Elements<TableCell>().First().InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("BALONAS", artigoRow.InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("{{NOME_EVENTO}}", text);
        Assert.DoesNotContain("{{EMPRESA_DESIGNACAO}}", text);
        var declPara = doc.MainDocumentPart.Document.Body!.Descendants<Paragraph>()
            .First(p => p.InnerText.Contains("DECLARA", StringComparison.OrdinalIgnoreCase));
        Assert.Null(declPara.ParagraphProperties?.ParagraphBorders);

        var empresaTable = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Empresa pirotécnica", StringComparison.OrdinalIgnoreCase)
                        && t.InnerText.Contains("Designação:", StringComparison.OrdinalIgnoreCase));
        var empresaCell = empresaTable.Descendants<TableCell>().First();
        Assert.StartsWith("Empresa pirotécnica:", empresaCell.InnerText, StringComparison.Ordinal);
        Assert.Contains("914748483/914201477/916048699", empresaCell.InnerText);
        Assert.Equal(5, empresaCell.Elements<Paragraph>().Count());
        var empresaParas = empresaCell.Elements<Paragraph>().ToList();
        Assert.NotNull(empresaParas[0].Elements<Run>().First().RunProperties?.Bold);
        foreach (var para in empresaParas.Skip(1))
            Assert.Null(para.Elements<Run>().First().RunProperties?.Bold);

        var promotorTable = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Promotor:", StringComparison.OrdinalIgnoreCase)
                        && t.InnerText.Contains("FESTA TESTE PSP", StringComparison.Ordinal));
        var promotorCell = promotorTable.Descendants<TableCell>().First();
        Assert.StartsWith("Promotor:", promotorCell.InnerText, StringComparison.Ordinal);
        Assert.Contains("Local: PÓVOA DE LANHOSO – FAFE", promotorCell.InnerText);
        Assert.Contains("Data: 5 A 7 DE ABRIL DE 2026", promotorCell.InnerText, StringComparison.Ordinal);
        Assert.Equal(1 + 3, promotorCell.Elements<Paragraph>().Count());
        var promotorParas = promotorCell.Elements<Paragraph>().ToList();
        Assert.NotNull(promotorParas[0].Elements<Run>().First().RunProperties?.Bold);
        foreach (var para in promotorParas.Skip(1))
            Assert.Null(para.Elements<Run>().First().RunProperties?.Bold);

        Assert.DoesNotContain(doc.MainDocumentPart.Document.Body!.Descendants<TextBoxContent>()
            .Select(t => t.InnerText), t => t.Contains("PIROFAFE", StringComparison.Ordinal));

        var coordTable = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Coordenador pirotécnico", StringComparison.OrdinalIgnoreCase));
        var coordCell = coordTable.Descendants<TableCell>().First();
        foreach (var paragraph in coordCell.Elements<Paragraph>())
        {
            var jc = paragraph.ParagraphProperties?.Justification?.Val?.Value;
            Assert.Equal(JustificationValues.Left, jc);
        }

        Assert.Contains("Coordenador Teste", text);
        Assert.Contains("3412", text);
        Assert.DoesNotContain("{{COORDENADOR_CRED}}", text);

        foreach (var footerPart in doc.MainDocumentPart!.FooterParts)
        {
            var rodape = footerPart.Footer!.InnerText.Replace('\n', ' ').Trim();
            Assert.Contains("pirofafe@gmail.com", rodape, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("253 506 944", rodape, StringComparison.Ordinal);
            Assert.Contains(" | ", rodape, StringComparison.Ordinal);
            Assert.DoesNotContain("616712", rodape, StringComparison.Ordinal);
        }

        var zonaTable = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Zona de lançamento", StringComparison.OrdinalIgnoreCase));
        var dataRow = zonaTable.Elements<TableRow>().Skip(3).First();
        var dataCells = dataRow.Elements<TableCell>().ToList();
        Assert.Contains("Baterias", dataCells[2].InnerText, StringComparison.Ordinal);
        Assert.Contains("60MM", dataCells[2].InnerText, StringComparison.Ordinal);
        Assert.Contains("/", dataCells[2].InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("BALONAS", dataCells[2].InnerText, StringComparison.Ordinal);
        foreach (var cell in dataCells)
        {
            var jc = cell.Elements<Paragraph>().First().ParagraphProperties?.Justification?.Val?.Value;
            Assert.Equal(JustificationValues.Center, jc);
        }

        var pdfBytes = DocxParaPdfConverter.Converter(bytes);
        Assert.NotEmpty(pdfBytes);
        Assert.Equal(0x25, pdfBytes[0]); // %
        Assert.Equal(0x50, pdfBytes[1]); // P
        Assert.Equal(0x44, pdfBytes[2]); // D
        Assert.Equal(0x46, pdfBytes[3]); // F

        foreach (var sectPr in doc.MainDocumentPart.Document.Body!.Descendants<SectionProperties>())
        {
            var pgMar = sectPr.GetFirstChild<PageMargin>();
            Assert.NotNull(pgMar);
            Assert.True(pgMar!.Bottom!.Value >= 2178u, "Margem inferior insuficiente — risco de sobrepor o rodapé.");
            Assert.NotNull(sectPr.GetFirstChild<FooterReference>());
        }
    }

    [Fact]
    public void Gerar_ArtigosPirotecnia_CalculaTotalNemCorretamente()
    {
        if (!File.Exists(TemplatePath))
            return;

        var servico = CriarServicoFixture();
        // 10 + 5 (zona 1) = 15 unidades × 8,8 kg/un = 132 kg
        var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), TemplatePath);

        using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
        var artigosTable = doc.MainDocumentPart!.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase));
        var totalRow = artigosTable.Elements<TableRow>()
            .Last(r => r.InnerText.Contains("Total", StringComparison.OrdinalIgnoreCase));
        var totalCells = totalRow.Elements<TableCell>().ToList();

        Assert.True(totalCells.Count >= 3, "Linha Total deve ter pelo menos 3 células no template PSP.");
        Assert.Contains("15", totalCells[1].InnerText, StringComparison.Ordinal);
        Assert.Contains("132", totalCells[^1].InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("20,475", artigosTable.InnerText, StringComparison.Ordinal);
    }

    [Fact]
    public void Gerar_ComDuasZonas_DuplicaBlocosNoDocumento()
    {
        if (!File.Exists(TemplatePath))
            return;

        var servico = CriarServicoFixture();
        var zona2 = new ServicoZonaLancamento
        {
            Id = 2,
            Designacao = "Zona secundária",
            ResponsavelPirotecnico = new Funcionario
            {
                Id = 3,
                NomeCompleto = "Técnico Zona 2",
                NumeroCredencial = "8888"
            },
            Linhas =
            [
                new ServicoZonaLinha
                {
                    Id = 3,
                    Data = new DateTime(2026, 4, 7),
                    HoraInicio = TimeSpan.FromHours(22),
                    HoraFim = TimeSpan.FromHours(23),
                    ProdutoId = 1,
                    Produto = servico.ZonasLancamento!.First().Linhas!.First().Produto!,
                    Quantidade = 3
                }
            ]
        };
        servico.ZonasLancamento = servico.ZonasLancamento!.Append(zona2).ToList();

        var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), TemplatePath);

        using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
        var text = doc.MainDocumentPart!.Document.Body!.InnerText;
        var zonaTables = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .Where(t => t.InnerText.Contains("Zona de lan", StringComparison.OrdinalIgnoreCase))
            .ToList();
        var artigosTables = doc.MainDocumentPart.Document.Body!.Descendants<Table>()
            .Where(t => t.InnerText.Contains("Artigos de pirotecnia", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Assert.Equal(2, zonaTables.Count);
        Assert.Single(artigosTables);
        Assert.Contains("Zona de lançamento n.º 1", text, StringComparison.Ordinal);
        Assert.Contains("Zona de lançamento n.º 2", text, StringComparison.Ordinal);
        Assert.Contains("Zona secundária", text, StringComparison.Ordinal);
        Assert.Contains("Técnico Zona 2", text, StringComparison.Ordinal);
        // 10 + 5 (zona 1) + 3 (zona 2) = 18 unidades consolidadas
        Assert.Contains("18", artigosTables[0].InnerText, StringComparison.Ordinal);

        var pdfBytes = DocxParaPdfConverter.Converter(bytes);
        Assert.NotEmpty(pdfBytes);
        Assert.Equal(0x25, pdfBytes[0]); // %PDF
    }

    [Fact]
    public void Gerar_LocalPromotor_MostraCidadeEConcelho()
    {
        if (!File.Exists(TemplatePath))
            return;

        var servico = CriarServicoFixture();
        servico.Cidade = "Vila Real";
        servico.Municipio = "Chaves";

        var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), TemplatePath);

        using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
        var promotorTable = doc.MainDocumentPart!.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Promotor:", StringComparison.OrdinalIgnoreCase));
        Assert.Contains("Local: CHAVES – VILA REAL", promotorTable.InnerText, StringComparison.Ordinal);
    }

    [Fact]
    public void Gerar_LocalPromotor_NaoColapsaQuandoCidadeEConcelhoIguais()
    {
        if (!File.Exists(TemplatePath))
            return;

        var servico = CriarServicoFixture();
        servico.Cidade = "Fafe";
        servico.Municipio = "Fafe";

        var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), TemplatePath);

        using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
        var promotorTable = doc.MainDocumentPart!.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Promotor:", StringComparison.OrdinalIgnoreCase));
        Assert.Contains("Local: FAFE – FAFE", promotorTable.InnerText, StringComparison.Ordinal);
    }

    [Fact]
    public void Gerar_ComUmDiaEvento_MostraDataUnicaNoPromotor()
    {
        if (!File.Exists(TemplatePath))
            return;

        var servico = CriarServicoFixture();
        servico.ZonasLancamento!.First().Linhas = servico.ZonasLancamento.First().Linhas!.Take(1).ToList();

        var bytes = new GeradorDeclaracaoPspService().Gerar(servico, new EmpresaPirotecnicaOptions(), TemplatePath);

        using var doc = WordprocessingDocument.Open(new MemoryStream(bytes), false);
        var promotorTable = doc.MainDocumentPart!.Document.Body!.Descendants<Table>()
            .First(t => t.InnerText.Contains("Promotor:", StringComparison.OrdinalIgnoreCase));
        Assert.Contains("Data: 5 DE ABRIL DE 2026", promotorTable.InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain(" A ", promotorTable.InnerText, StringComparison.Ordinal);
    }

    private static Servico CriarServicoFixture()
    {
        var produto = new Produto
        {
            Id = 1,
            Nome = "BALONAS",
            FamiliaRisco = "1.3G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = "60MM",
            Categoria = "F4 / FP",
            GrupoCompatibilidade = TestProdutoDefaults.GrupoCompatibilidade,
            NEMPorUnidade = 8.8m
        };

        var responsavel = new Funcionario
        {
            Id = 1,
            NomeCompleto = "Técnico Teste",
            NumeroCredencial = "9999"
        };

        var linha1 = new ServicoZonaLinha
        {
            Id = 1,
            Data = new DateTime(2026, 4, 5),
            HoraInicio = new TimeSpan(21, 0, 0),
            HoraFim = new TimeSpan(22, 0, 0),
            ProdutoId = 1,
            Produto = produto,
            Quantidade = 10
        };

        var linha2 = new ServicoZonaLinha
        {
            Id = 2,
            Data = new DateTime(2026, 4, 7),
            HoraInicio = new TimeSpan(21, 30, 0),
            HoraFim = new TimeSpan(22, 30, 0),
            ProdutoId = 1,
            Produto = produto,
            Quantidade = 5
        };

        var zona = new ServicoZonaLancamento
        {
            Id = 1,
            Designacao = "Zona principal",
            ResponsavelPirotecnico = responsavel,
            Linhas = new List<ServicoZonaLinha> { linha1, linha2 }
        };

        return new Servico
        {
            Id = 42,
            NomeEvento = "FESTA TESTE PSP",
            Local = "Rendufinho",
            Municipio = "Póvoa de Lanhoso",
            Cidade = "Fafe",
            DataServico = new DateTime(2026, 4, 5),
            Cliente = new Cliente { Nome = "Junta de Freguesia Teste" },
            CoordenadorPirotecnicoId = 2,
            CoordenadorPirotecnico = new Funcionario
            {
                Id = 2,
                NomeCompleto = "Coordenador Teste",
                NumeroCredencial = "3412",
            },
            ZonasLancamento = new List<ServicoZonaLancamento> { zona }
        };
    }
}
