using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Finalproj.IntegrationTests.Auth;

public class AuthControllerTests : IntegrationTestBase
{
    [Fact]
    public async Task Login_CredenciaisValidas_ReturnsToken()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, "login-ok@pirofafe.pt", "Admin");

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "login-ok@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(string.IsNullOrEmpty(json.GetProperty("token").GetString()));
    }

    [Fact]
    public async Task Login_PasswordErrada_Returns401()
    {
        var client = Factory.CreateClient();
        await using var scope = Factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, "login-bad@pirofafe.pt", "Admin");

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "login-bad@pirofafe.pt",
            password = "WrongPassword1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_EmailInexistente_Returns401()
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "naoexiste@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_ContaNaoConfirmada_Returns401()
    {
        var client = Factory.CreateClient();
        await using var scope = Factory.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var email = "unconfirmed@pirofafe.pt";
        if (await userManager.FindByEmailAsync(email) == null)
        {
            var user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = false };
            await userManager.CreateAsync(user, TestDataSeeder.DefaultPassword);
        }

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = TestDataSeeder.DefaultPassword
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_ComToken_Returns200()
    {
        var client = await Factory.CreateAuthenticatedClientAsync("Admin");
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Me_SemToken_Returns401()
    {
        var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_ComCookieValido_ReturnsNovoToken()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, "refresh-ok@pirofafe.pt", "Admin");

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "refresh-ok@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });
        login.EnsureSuccessStatusCode();

        var refresh = await client.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
    }

    [Fact]
    public async Task Refresh_SemCookie_Returns401()
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_RevogaRefresh()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, "logout@pirofafe.pt", "Admin");

        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "logout@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });

        var logout = await client.PostAsJsonAsync("/api/auth/logout", new { });
        Assert.Equal(HttpStatusCode.OK, logout.StatusCode);

        var refresh = await client.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }
}
