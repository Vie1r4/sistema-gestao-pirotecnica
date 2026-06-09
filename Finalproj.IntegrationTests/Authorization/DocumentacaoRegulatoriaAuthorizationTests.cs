using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Enums;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Authorization;

public class DocumentacaoRegulatoriaAuthorizationTests : IntegrationTestBase
{
    [Theory]
    [InlineData(null, HttpStatusCode.Unauthorized)]
    [InlineData(ConstantesRoles.Comercial, HttpStatusCode.NotFound)]
    [InlineData(ConstantesRoles.Armazem, HttpStatusCode.NotFound)]
    public async Task GerarDeclaracaoPsp_ReturnsExpectedStatus(string? role, HttpStatusCode expected)
    {
        HttpClient client = role == null
            ? Factory.CreateClient()
            : await Factory.CreateAuthenticatedClientAsync(role);

        var response = await client.PostAsync("/api/servicos/1/licenca/gerar", null);
        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task GerarDeclaracaoPsp_Gestor_ComServicoValido_ReturnsOk()
    {
        var servicoId = await CriarServicoComZonaAsync();
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);

        var response = await client.PostAsync($"/api/servicos/{servicoId}/licenca/gerar", null);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("licencaId", out var licId) || json.TryGetProperty("LicencaId", out licId));
        Assert.True(licId.GetInt32() > 0);

        await using var logScope = Factory.Services.CreateAsyncScope();
        var logContext = logScope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var ultimoLog = logContext.LogSistema
            .Where(l => l.Acao == "DocumentacaoRegulatoria.GerarDeclaracaoPsp")
            .OrderByDescending(l => l.Id)
            .FirstOrDefault();
        Assert.NotNull(ultimoLog);
        Assert.False(string.IsNullOrWhiteSpace(ultimoLog.UserName));
        Assert.Equal("gestor-test@pirofafe.pt", ultimoLog.UserName);
    }

    [Fact]
    public async Task DownloadDeclaracaoPsp_PedidoGerado_Comercial_ReturnsNotFound()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            DataCriacao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();

        var servico = new Servico
        {
            ClienteId = clienteId,
            EncomendaId = encomenda.Id,
            DataServico = DateTime.UtcNow.Date,
            NomeEvento = "Evento teste",
            Local = "Local"
        };
        context.Servicos.Add(servico);
        await context.SaveChangesAsync();

        var licenca = new ServicoLicenca
        {
            ServicoId = servico.Id,
            TipoLicenca = TipoLicencaServico.LICENCA_PSP,
            OrigemRegisto = OrigemRegistoServicoLicenca.PedidoGerado,
            FicheiroPath = "Documentos/Servico/1/Licencas/teste.docx"
        };
        context.ServicoLicencas.Add(licenca);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Comercial);
        var response = await client.GetAsync($"/api/servicos/{servico.Id}/licenca/{licenca.Id}/ficheiro");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<int> CriarServicoComZonaAsync()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var produtoId = context.Produtos.Select(p => p.Id).First();

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.CONCLUIDA,
            Nome = "Festas do Concelho",
            DataCriacao = DateTime.UtcNow,
            DataConclusao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();
        context.EncomendaItems.Add(new EncomendaItem
        {
            EncomendaId = encomenda.Id,
            ProdutoId = produtoId,
            QuantidadePedida = 5m
        });
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var body = new
        {
            encomendaId = encomenda.Id,
            nomeEvento = "Festas do Concelho",
            dataServico = DateTime.Today.ToString("yyyy-MM-dd"),
            publicoPrivado = "Público",
            zonas = new[]
            {
                new
                {
                    designacao = "Campo",
                    coordenadasLat = 41.5m,
                    coordenadasLng = -8.4m,
                    linhas = new[]
                    {
                        new
                        {
                            data = DateTime.Today.ToString("yyyy-MM-dd"),
                            produtoId,
                            quantidade = 2m,
                            horaInicio = "22:00:00",
                            horaFim = "22:30:00"
                        }
                    }
                }
            }
        };

        var response = await client.PostAsJsonAsync("/api/servicos", body);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var servico = json.GetProperty("servico");
        return servico.TryGetProperty("id", out var idProp) ? idProp.GetInt32() : servico.GetProperty("Id").GetInt32();
    }
}
