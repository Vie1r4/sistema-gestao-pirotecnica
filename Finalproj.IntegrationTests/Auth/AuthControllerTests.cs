using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Finalproj.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
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
    public async Task ResetPassword_ValidToken_AllowsLoginWithNewPassword()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var email = "reset-ok@pirofafe.pt";
        await TestDataSeeder.EnsureUserAsync(sp, email, "Admin");

        var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);

        var rawToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
        var linkToken = Uri.UnescapeDataString(Uri.EscapeDataString(encodedToken));
        const string newPassword = "NovaPass123!Z";

        var reset = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            email,
            token = linkToken,
            newPassword,
            confirmPassword = newPassword
        });
        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = newPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_TokenWithWhitespaceInMiddle_Succeeds()
    {
        var client = Factory.CreateClient();
        await using var scope = Factory.Services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var email = "reset-ws@pirofafe.pt";
        await TestDataSeeder.EnsureUserAsync(sp, email, "Admin");

        var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);

        var rawToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
        var corrupted = encoded.Insert(encoded.Length / 2, " ");

        var response = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            email,
            token = corrupted,
            newPassword = "OutraPass456!X",
            confirmPassword = "OutraPass456!X"
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_UnconfirmedEmail_AllowsLoginAfterReset()
    {
        var client = Factory.CreateClient(new() { HandleCookies = true });
        await using var scope = Factory.Services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var email = "reset-unconf@pirofafe.pt";
        var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();

        var existing = await userManager.FindByEmailAsync(email);
        if (existing != null)
            await userManager.DeleteAsync(existing);

        var user = new IdentityUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = false
        };
        var create = await userManager.CreateAsync(user, TestDataSeeder.DefaultPassword);
        Assert.True(create.Succeeded);
        await userManager.AddToRoleAsync(user, "Admin");

        var rawToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
        const string newPassword = "ResetConf789!Q";

        var reset = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            email,
            token = encodedToken,
            newPassword,
            confirmPassword = newPassword
        });
        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = newPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_PasswordTooWeak_Returns400WithDetails()
    {
        var client = Factory.CreateClient();
        await using var scope = Factory.Services.CreateAsyncScope();
        var sp = scope.ServiceProvider;
        var email = "reset-weak@pirofafe.pt";
        await TestDataSeeder.EnsureUserAsync(sp, email, "Admin");

        var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);

        var rawToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));

        var response = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            email,
            token = encodedToken,
            newPassword = "abc123",
            confirmPassword = "abc123"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("A palavra-passe não cumpre os requisitos.", json.GetProperty("error").GetString());
        Assert.True(json.TryGetProperty("details", out var details));
        Assert.True(details.GetArrayLength() > 0);
    }

    [Fact]
    public async Task ExistemUtilizadores_NaoExpoeCampoExistem()
    {
        var client = Factory.CreateClient();
        var response = await client.GetAsync("/api/auth/existem-utilizadores");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("primeiroRegistoDisponivel", out var disponivel));
        Assert.True(disponivel.ValueKind is JsonValueKind.True or JsonValueKind.False);
        Assert.False(json.TryGetProperty("existem", out _));
    }

    [Fact]
    public async Task RegistarPrimeiroUtilizador_PasswordTooWeak_Returns400WithDetails()
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/registar-primeiro-utilizador", new
        {
            email = "primeiro-weak@pirofafe.pt",
            password = "abc123",
            nome = "Admin"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("A palavra-passe não cumpre os requisitos.", json.GetProperty("error").GetString());
        Assert.True(json.TryGetProperty("details", out var details));
        Assert.True(details.GetArrayLength() > 0);
    }

    [Fact]
    public async Task RegistarPrimeiroUtilizador_PersisteNomeNoPerfil_E_Me()
    {
        const string email = "bootstrap-perfil@pirofafe.pt";
        const string nome = "Admin Bootstrap Perfil";

        var client = Factory.CreateClient(new() { HandleCookies = true });
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
        Assert.Equal(email, meJson.GetProperty("email").GetString());
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
