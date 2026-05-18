using System.Net;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Entities;
using Finalproj.Domain.Enums;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Security;

public class IdorTests : IntegrationTestBase
{
    [Fact]
    public async Task DownloadDocumentoFuncionario_OutroUtilizador_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();

        var funcB = new Funcionario { NomeCompleto = "Func B", Email = "func-b@teste.pt", Cargo = ConstantesRoles.Comercial };
        context.Funcionarios.Add(funcB);
        await context.SaveChangesAsync();
        funcB.UserId = "outro-utilizador-id";
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/funcionarios/{funcB.Id}/documentos?tipo=cc");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminUtilizadores_Gestor_Returns403()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.GetAsync("/api/admin/utilizadores");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Servicos_Lista_Armazem_Returns403()
    {
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync("/api/servicos");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Paiol_SemAcesso_Armazem_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var paiolSemAcesso = new Paiol
        {
            Nome = "Paiol IDOR",
            Localizacao = "Teste",
            LimiteMLE = 100m,
            PerfilRisco = "1.1G",
            Estado = ConstantesPaiol.EstadoAtivo
        };
        context.Paiol.Add(paiolSemAcesso);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/paiol/{paiolSemAcesso.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Encomenda_Armazem_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
        var clienteId = TestDataSeeder.GetSeedClienteId(scope.ServiceProvider);
        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.PENDENTE,
            DataCriacao = DateTime.UtcNow
        };
        context.Encomendas.Add(encomenda);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/encomendas/{encomenda.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Servico_DownloadLicenca_Armazem_Returns403()
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
            Local = "Local teste",
            Distrito = "Lisboa"
        };
        context.Servicos.Add(servico);
        await context.SaveChangesAsync();
        var licenca = new ServicoLicenca
        {
            ServicoId = servico.Id,
            TipoLicenca = TipoLicencaServico.LICENCA_PSP,
            FicheiroPath = "documentos/servicos/1/lic.pdf"
        };
        context.ServicoLicencas.Add(licenca);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/servicos/{servico.Id}/licenca/{licenca.Id}/ficheiro");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Servico_DownloadDocumentoExtra_Armazem_Returns403()
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
            Local = "Local"
        };
        context.Servicos.Add(servico);
        await context.SaveChangesAsync();

        var docExtra = new ServicoDocumentoExtra
        {
            ServicoId = servico.Id,
            Nome = "Planta",
            Caminho = "documentos/servicos/1/planta.pdf"
        };
        context.ServicoDocumentoExtras.Add(docExtra);
        await context.SaveChangesAsync();

        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Armazem);
        var response = await client.GetAsync($"/api/servicos/{servico.Id}/documentos/{docExtra.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Put_AdminUtilizador_Gestor_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var (user, _) = await TestDataSeeder.EnsureUserAsync(
            scope.ServiceProvider,
            "admin-put-target@pirofafe.pt",
            ConstantesRoles.Comercial);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Gestor);
        var response = await client.SendAuthorizedAsync(
            HttpMethod.Put,
            $"/api/admin/utilizadores/{user.Id}",
            System.Net.Http.Json.JsonContent.Create(new { id = user.Id, roles = Array.Empty<object>() }));
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Put_Funcionario_Comercial_Returns403()
    {
        await using var scope = Factory.Services.CreateAsyncScope();
        var funcionarioId = TestDataSeeder.GetSeedFuncionarioId(scope.ServiceProvider);
        var client = await Factory.CreateAuthenticatedClientAsync(ConstantesRoles.Comercial);
        var response = await client.SendAuthorizedAsync(
            HttpMethod.Put,
            $"/api/funcionarios/{funcionarioId}",
            AuthClientExtensions.EmptyMultipartContent());
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
