using System.Net;
using System.Net.Http.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Paiols;

/// <summary>
/// Garante que a API rejeita entradas incompatíveis segundo MotorValidacaoPaiol (ADR 7.2.5).
/// </summary>
public class EntradaPaiolCompatibilidadeTests : IntegrationTestBase
{
    [Fact]
    public async Task Post_Registar_EntradaGrupoB_ComStockGrupoG_ReturnsBadRequestComErro004()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();

        var paiol = new Paiol
        {
            Nome = "Paiol Compatibilidade Teste",
            Localizacao = "Braga",
            LimiteMLE = 1000m,
            PerfilRisco = "1.1G",
            Estado = ConstantesPaiol.EstadoAtivo,
            NumeroLicenca = "LIC-TEST-001",
            DataValidadeLicenca = DateTime.UtcNow.Date.AddYears(1),
        };
        context.Paiol.Add(paiol);
        await context.SaveChangesAsync();

        context.PaiolAcessos.Add(new PaiolAcesso
        {
            PaiolId = paiol.Id,
            RoleName = ConstantesRoles.Gestor,
        });
        await context.SaveChangesAsync();

        var produtoGrupoG = new Produto
        {
            Nome = "Produto Grupo G",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = "G",
        };
        var produtoGrupoB = new Produto
        {
            Nome = "Produto Grupo B",
            NEMPorUnidade = 1m,
            FamiliaRisco = "1.1G",
            FiltroTecnico = TestProdutoDefaults.FiltroTecnico,
            Calibre = TestProdutoDefaults.Calibre,
            Categoria = TestProdutoDefaults.Categoria,
            GrupoCompatibilidade = "B",
        };
        context.Produtos.AddRange(produtoGrupoG, produtoGrupoB);
        await context.SaveChangesAsync();

        context.EntradasPaiol.Add(new EntradaPaiol
        {
            PaiolId = paiol.Id,
            ProdutoId = produtoGrupoG.Id,
            Quantidade = 10m,
            DataEntrada = DateTime.UtcNow,
            NumeroLote = "LOTE-G-001",
        });
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var body = new
        {
            paiolId = paiol.Id,
            produtoId = produtoGrupoB.Id,
            quantidade = 5m,
            numeroLote = "LOTE-B-001",
        };

        var response = await client.PostAsJsonAsync("/api/entrada-paiol/registar", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var jsonText = await response.Content.ReadAsStringAsync();
        Assert.Contains("ERRO_004", jsonText, StringComparison.Ordinal);
        Assert.Contains("Incompatibilidade de grupos", jsonText, StringComparison.OrdinalIgnoreCase);

        var entradasGrupoB = context.EntradasPaiol.Count(e =>
            e.PaiolId == paiol.Id && e.ProdutoId == produtoGrupoB.Id);
        Assert.Equal(0, entradasGrupoB);
    }
}
