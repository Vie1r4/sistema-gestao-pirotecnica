using System.Text;
using Finalproj.Application.Features.Clientes.Import;
using Xunit;

namespace Finalproj.Tests.Clientes;

public sealed class ClienteCsvParserTests
{
    [Fact]
    public void Parse_erp_semicolon_com_decimais_portugueses()
    {
        const string csv = """
            "CÓDIGO";"NOME";"NIF";"INACTIVO?";"DESCONTO %"
            "1";"Empresa Teste Lda";"123456789";"Não";"0,00"
            "2";"Inactivo SA";"987654321";"Sim";"0,00"
            """;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = ClienteCsvParser.Parse(stream);

        Assert.Null(result.ErroGlobal);
        Assert.Equal(2, result.Rows.Count);
        Assert.Equal("Empresa Teste Lda", result.Rows[0].NomeResolvido);
        Assert.False(result.Rows[0].EstaInactivo);
        Assert.True(result.Rows[1].EstaInactivo);
    }

    [Fact]
    public void Parse_erp_com_preambulo_corrupto()
    {
        const string csv = """
            "25","FREGUESIA DE LOMAR E ARCOS","","RUA DR. JXXXXX - XXXXX - ANGOLA

            "CÓDIGO","NOME","NIF","INACTIVO?"
            "25","FREGUESIA DE LOMAR E ARCOS","512346364","Não"
            """;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(csv));
        var result = ClienteCsvParser.Parse(stream);

        Assert.Null(result.ErroGlobal);
        Assert.Single(result.Rows);
        Assert.Equal("512346364", result.Rows[0].Nif);
    }
}
