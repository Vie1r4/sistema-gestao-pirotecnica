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
    public async Task Refresh_TokenJaUsado_Returns401()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, "refresh-rotate@pirofafe.pt", "Admin");

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "refresh-rotate@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });
        login.EnsureSuccessStatusCode();

        var oldCookie = ExtractRefreshCookie(login);
        Assert.False(string.IsNullOrEmpty(oldCookie));

        var firstRefresh = await client.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.OK, firstRefresh.StatusCode);

        var replayClient = Factory.CreateClient();
        var replayRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh")
        {
            Content = JsonContent.Create(new { refreshToken = oldCookie })
        };
        var replay = await replayClient.SendAsync(replayRequest);
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
    }

    [Fact]
    public async Task Refresh_TokenExpirado_Returns401()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var (user, _) = await TestDataSeeder.EnsureUserAsync(sp, "refresh-exp@pirofafe.pt", "Admin");

        await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "refresh-exp@pirofafe.pt",
            password = TestDataSeeder.DefaultPassword
        });

        var context = sp.GetRequiredService<Finalproj.Infrastructure.Persistence.Data.FinalprojContext>();
        var token = context.RefreshTokens.First(t => t.UserId == user.Id);
        token.ExpiresAtUtc = DateTime.UtcNow.AddMinutes(-10);
        await context.SaveChangesAsync();

        var refresh = await client.PostAsJsonAsync("/api/auth/refresh", new { });
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
    }

    private static string? ExtractRefreshCookie(HttpResponseMessage response)
    {
        if (!response.Headers.TryGetValues("Set-Cookie", out var values))
            return null;
        foreach (var header in values)
        {
            const string prefix = "pirofafe_rt=";
            var idx = header.IndexOf(prefix, StringComparison.Ordinal);
            if (idx < 0) continue;
            var start = idx + prefix.Length;
            var end = header.IndexOf(';', start);
            return end < 0 ? header[start..] : header[start..end];
        }
        return null;
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
