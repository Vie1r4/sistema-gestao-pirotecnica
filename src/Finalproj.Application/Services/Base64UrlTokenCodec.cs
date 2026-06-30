using System.Text;

namespace Finalproj.Application.Services;

public static class Base64UrlTokenCodec
{
    public static string Encode(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public static string DecodeToString(string encoded)
    {
        var bytes = Base64UrlDecode(encoded.Trim());
        return Encoding.UTF8.GetString(bytes);
    }

    public static string DecodeToStringOrRaw(string encoded)
    {
        try
        {
            return DecodeToString(encoded);
        }
        catch (FormatException)
        {
            return encoded;
        }
    }

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
