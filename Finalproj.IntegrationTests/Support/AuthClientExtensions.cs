using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Finalproj.Domain.Constants;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Finalproj.IntegrationTests.Infrastructure;

public static class AuthClientExtensions
{
    public static async Task<string> LoginAndGetTokenAsync(
        this HttpClient client,
        string email,
        string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var token = json.GetProperty("token").GetString();
        return token ?? throw new InvalidOperationException("Token em falta na resposta de login.");
    }

    public static async Task<HttpClient> CreateAuthenticatedClientAsync(
        this CustomWebApplicationFactory factory,
        string role)
    {
        var email = role switch
        {
            ConstantesRoles.Admin => "admin-test@pirofafe.pt",
            ConstantesRoles.Gestor => "gestor-test@pirofafe.pt",
            ConstantesRoles.Comercial => "comercial-test@pirofafe.pt",
            ConstantesRoles.Armazem => "armazem-test@pirofafe.pt",
            _ => throw new ArgumentException($"Role desconhecida: {role}", nameof(role))
        };

        await using var scope = factory.Services.CreateAsyncScope();
        await TestDataSeeder.EnsureUserAsync(scope.ServiceProvider, email, role);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = true
        });

        var token = await client.LoginAndGetTokenAsync(email, TestDataSeeder.DefaultPassword);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public static async Task<HttpResponseMessage> SendAuthorizedAsync(
        this HttpClient client,
        HttpMethod method,
        string url,
        HttpContent? content = null)
    {
        var request = new HttpRequestMessage(method, url) { Content = content };
        return await client.SendAsync(request);
    }

    /// <summary>POST/PUT com corpo vazio — suficiente para validar 401/403 antes da validação de modelo.</summary>
    public static HttpContent EmptyJsonContent() =>
        new StringContent("{}", System.Text.Encoding.UTF8, "application/json");

    public static HttpContent EmptyMultipartContent() => new MultipartFormDataContent();
}
