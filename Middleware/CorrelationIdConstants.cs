namespace Finalproj.Middleware;

/// <summary>Chave em <see cref="Microsoft.AspNetCore.Http.HttpContext.Items"/> e nome do header HTTP.</summary>
public static class CorrelationIdConstants
{
    public const string HttpHeaderName = "X-Correlation-Id";
    public const string ItemKey = "CorrelationId";
}
