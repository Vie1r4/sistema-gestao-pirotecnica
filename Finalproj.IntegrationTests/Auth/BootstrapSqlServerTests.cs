using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.IntegrationTests.Infrastructure;
using Testcontainers.MsSql;
using Xunit;

namespace Finalproj.IntegrationTests.Auth;

/// <summary>
/// Bootstrap do 1.º admin contra SQL Server real — deteta migrações em falta (ex.: coluna Perfis.Tema).
/// </summary>
[Trait("Category", "Docker")]
public sealed class BootstrapSqlServerTests : IAsyncLifetime
{
    private MsSqlContainer? _sql;
    private SqlServerWebApplicationFactory? _factory;
    private bool _dockerDisponivel = true;

    public async Task InitializeAsync()
    {
        try
        {
            _sql = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .Build();

            await _sql.StartAsync();
            _factory = new SqlServerWebApplicationFactory(_sql.GetConnectionString());
            await _factory.InitializeBootstrapOnlyAsync();
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException or TimeoutException)
        {
            _dockerDisponivel = false;
        }
    }

    public async Task DisposeAsync()
    {
        if (_factory is not null)
            await _factory.DisposeAsync();
        if (_sql is not null)
            await _sql.DisposeAsync();
    }

    [SkippableFact]
    public async Task RegistarPrimeiroUtilizador_OnSqlServer_PersisteNomeNoPerfil_E_Me()
    {
        Skip.IfNot(_dockerDisponivel, "Docker não disponível — teste de bootstrap SQL ignorado.");

        const string email = "bootstrap-sql@pirofafe.pt";
        const string nome = "Admin Bootstrap SQL";

        var client = _factory!.CreateClient(new() { HandleCookies = true });
        var register = await client.PostAsJsonAsync("/api/auth/registar-primeiro-utilizador", new
        {
            email,
            password = TestDataSeeder.DefaultPassword,
            nome
        });

        Assert.Equal(HttpStatusCode.OK, register.StatusCode);
        var registerJson = await register.Content.ReadFromJsonAsync<JsonElement>();
        var token = registerJson.GetProperty("token").GetString();
        Assert.False(string.IsNullOrEmpty(token));

        client.DefaultRequestHeaders.Authorization = new("Bearer", token);
        var me = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var meJson = await me.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(nome, meJson.GetProperty("nome").GetString());
    }
}
