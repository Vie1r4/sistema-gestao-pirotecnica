namespace Finalproj.Api.Services;

public sealed class AuthRefreshCookieAccessor(IHttpContextAccessor httpContextAccessor) : IAuthRefreshCookieAccessor
{
    private const string RefreshTokenCookieName = "pirofafe_rt";

    public void SetRefreshToken(string refreshToken, int days, bool isDevelopment, bool isHttps)
    {
        var options = BuildCookieOptions(isDevelopment, isHttps, DateTimeOffset.UtcNow.AddDays(Math.Max(days, 1)));
        httpContextAccessor.HttpContext?.Response.Cookies.Append(RefreshTokenCookieName, refreshToken, options);
    }

    public void ClearRefreshToken(bool isDevelopment, bool isHttps)
    {
        httpContextAccessor.HttpContext?.Response.Cookies.Delete(
            RefreshTokenCookieName,
            BuildCookieOptions(isDevelopment, isHttps));
    }

    public string? GetRefreshTokenFromCookie()
    {
        var request = httpContextAccessor.HttpContext?.Request;
        if (request?.Cookies.TryGetValue(RefreshTokenCookieName, out var value) == true
            && !string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        return null;
    }

    private static CookieOptions BuildCookieOptions(bool isDevelopment, bool isHttps, DateTimeOffset? expires = null) =>
        new()
        {
            HttpOnly = true,
            Secure = isDevelopment || isHttps,
            SameSite = isDevelopment ? SameSiteMode.None : SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = expires
        };
}
