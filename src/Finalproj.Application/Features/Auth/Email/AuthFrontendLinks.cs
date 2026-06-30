using Microsoft.Extensions.Configuration;

namespace Finalproj.Application.Features.Auth.Email;

public static class AuthFrontendLinks
{
    public static string BaseUrl(IConfiguration configuration)
    {
        var baseUrl = configuration["Frontend:BaseUrl"]?.Trim();
        if (string.IsNullOrWhiteSpace(baseUrl))
            baseUrl = "http://localhost:3000";
        return baseUrl.TrimEnd('/');
    }

    public static string PasswordReset(IConfiguration configuration, string email, string encodedToken) =>
        $"{BaseUrl(configuration)}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(encodedToken)}";

    public static string ConfirmEmail(IConfiguration configuration, string userId, string encodedCode) =>
        $"{BaseUrl(configuration)}/confirm-email?userId={Uri.EscapeDataString(userId)}&code={Uri.EscapeDataString(encodedCode)}";
}
