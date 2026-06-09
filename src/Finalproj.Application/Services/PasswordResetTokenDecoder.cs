using System.Text;

namespace Finalproj.Application.Services;

/// <summary>
/// Decodifica tokens de reset enviados no link do email (Base64Url sobre UTF-8 do token Identity).
/// Tolerante a quebras de linha/espaços introduzidos por clientes de email.
/// </summary>
public static class PasswordResetTokenDecoder
{
    /// <summary>
    /// Devolve o token Identity em texto; lança <see cref="FormatException"/> se inválido.
    /// </summary>
    public static string Decode(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new FormatException("Token em falta.");

        var normalized = NormalizeForDecode(token);

        try
        {
            var bytes = Base64UrlDecode(normalized);
            return Encoding.UTF8.GetString(bytes);
        }
        catch (FormatException)
        {
            // Links antigos ou clientes de email que convertem '+' em espaço (Base64 clássico).
            if (normalized.Contains(' '))
            {
                var withPlus = normalized.Replace(' ', '+');
                try
                {
                    var bytes = Base64UrlDecode(withPlus);
                    return Encoding.UTF8.GetString(bytes);
                }
                catch (FormatException) { }
            }

            throw new FormatException("Token inválido.");
        }
    }

    /// <summary>Remove espaços/quebras que alguns clientes de email inserem no meio do token.</summary>
    public static string NormalizeForDecode(string token) =>
        token.Trim().Replace("\r", "", StringComparison.Ordinal)
            .Replace("\n", "", StringComparison.Ordinal)
            .Replace(" ", "", StringComparison.Ordinal);

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2:
                padded += "==";
                break;
            case 3:
                padded += "=";
                break;
        }

        return Convert.FromBase64String(padded);
    }
}
