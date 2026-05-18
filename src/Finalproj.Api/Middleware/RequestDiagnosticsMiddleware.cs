using System.Diagnostics;
using Microsoft.Extensions.Primitives;

namespace Finalproj.Middleware;

/// <summary>
/// Gera ou aceita <c>X-Correlation-Id</c>, repete-o na resposta, adiciona scope ao <see cref="ILogger"/>
/// e regista latência por pedido (métrica em forma de log estruturado).
/// </summary>
public sealed class RequestDiagnosticsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestDiagnosticsMiddleware> _logger;

    private const int MaxCorrelationIdLength = 128;

    public RequestDiagnosticsMiddleware(RequestDelegate next, ILogger<RequestDiagnosticsMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (ShouldSkip(context))
        {
            await _next(context);
            return;
        }

        var correlationId = ResolveCorrelationId(context);
        context.Items[CorrelationIdConstants.ItemKey] = correlationId;

        context.Response.OnStarting(() =>
        {
            if (!context.Response.Headers.ContainsKey(CorrelationIdConstants.HttpHeaderName))
                context.Response.Headers.Append(CorrelationIdConstants.HttpHeaderName, correlationId);
            return Task.CompletedTask;
        });

        using var logScope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["TraceId"] = context.TraceIdentifier
        });

        var sw = Stopwatch.StartNew();
        Exception? failure = null;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            failure = ex;
            throw;
        }
        finally
        {
            sw.Stop();
            var method = context.Request.Method;
            var path = context.Request.Path.Value ?? string.Empty;
            var elapsedMs = (long)sw.Elapsed.TotalMilliseconds;

            if (failure != null)
            {
                var status = context.Response.HasStarted
                    ? context.Response.StatusCode
                    : StatusCodes.Status500InternalServerError;
                _logger.LogError(failure,
                    "HTTP {HttpMethod} {RequestPath} failed with status {StatusCode} after {ElapsedMilliseconds} ms",
                    method, path, status, elapsedMs);
            }
            else
            {
                _logger.LogInformation(
                    "HTTP {HttpMethod} {RequestPath} completed with status {StatusCode} in {ElapsedMilliseconds} ms",
                    method, path, context.Response.StatusCode, elapsedMs);
            }
        }
    }

    private static bool ShouldSkip(HttpContext context)
    {
        if (HttpMethods.IsOptions(context.Request.Method))
            return true;
        var p = context.Request.Path.Value ?? string.Empty;
        if (p.StartsWith("/_framework/", StringComparison.OrdinalIgnoreCase))
            return true;
        return false;
    }

    private static string ResolveCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(CorrelationIdConstants.HttpHeaderName, out StringValues incoming))
        {
            var s = incoming.ToString().Trim();
            if (s.Length > 0 && s.Length <= MaxCorrelationIdLength && IsSafeCorrelationToken(s))
                return s;
        }

        return Guid.NewGuid().ToString("N");
    }

    private static bool IsSafeCorrelationToken(string s)
    {
        foreach (var c in s)
        {
            if (char.IsAsciiLetterOrDigit(c) || c is '-' or '_')
                continue;
            return false;
        }

        return true;
    }
}
