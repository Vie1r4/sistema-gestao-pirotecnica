namespace Finalproj.Middleware;

public static class HttpContextCorrelationExtensions
{
    /// <summary>Correlation id do pedido atual (definido por <see cref="RequestDiagnosticsMiddleware"/>).</summary>
    public static string? GetCorrelationId(this HttpContext context) =>
        context.Items.TryGetValue(CorrelationIdConstants.ItemKey, out var v) && v is string s ? s : null;
}
