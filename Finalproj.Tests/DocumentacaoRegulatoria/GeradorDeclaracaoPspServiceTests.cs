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
        Assert.Contains("BALONAS", text);
        Assert.DoesNotContain("{{NOME_EVENTO}}", text);
        Assert.DoesNotContain("{{EMPRESA_DESIGNACAO}}", text);
        var txbxEmpresa = doc.MainDocumentPart!.Document.Body!.Descendants<TextBoxContent>()
            .First(t => t.InnerText.Contains("PIROFAFE, LDA", StringComparison.Ordinal));
        Assert.DoesNotContain("Empresa pirotécnica:", txbxEmpresa.InnerText, StringComparison.Ordinal);
        Assert.Contains("914748483/914201477/916048699", txbxEmpresa.InnerText);
        Assert.DoesNotContain("{{EMPRESA_", txbxEmpresa.InnerText, StringComparison.Ordinal);

        var txbxEvento = doc.MainDocumentPart!.Document.Body!.Descendants<TextBoxContent>()
            .First(t => t.InnerText.Contains("FESTA TESTE PSP", StringComparison.Ordinal));
        Assert.Contains("Local: Fafe", txbxEvento.InnerText);
        Assert.Contains("Data: 5 DE ABRIL DE 2026", txbxEvento.InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("Promotor:", txbxEvento.InnerText, StringComparison.Ordinal);
        Assert.DoesNotContain("{{NOME_EVENTO}}", txbxEvento.InnerText, StringComparison.Ordinal);

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
        foreach (var cell in dataRow.Elements<TableCell>())
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

        var linha = new ServicoZonaLinha
        {
            Id = 1,
            Data = new DateTime(2026, 4, 5),
            HoraInicio = new TimeSpan(21, 0, 0),
            HoraFim = new TimeSpan(22, 0, 0),
            ProdutoId = 1,
            Produto = produto,
            Quantidade = 10
        };

        var zona = new ServicoZonaLancamento
        {
            Id = 1,
            Designacao = "Zona principal",
            ResponsavelPirotecnico = responsavel,
            Linhas = new List<ServicoZonaLinha> { linha }
        };

        return new Servico
        {
            Id = 42,
            NomeEvento = "FESTA TESTE PSP",
            Local = "Fafe",
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
