namespace Finalproj.Api.Services;

public interface IAuthRefreshCookieAccessor
{
    void SetRefreshToken(string refreshToken, int days, bool isDevelopment, bool isHttps);
    void ClearRefreshToken(bool isDevelopment, bool isHttps);
    string? GetRefreshTokenFromCookie();
}
