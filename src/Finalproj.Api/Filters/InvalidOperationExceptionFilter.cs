using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Finalproj.Filters;

/// <summary>
/// Converte <see cref="InvalidOperationException"/> em 400 Bad Request (ex.: ficheiro excede tamanho máximo).
/// </summary>
public class InvalidOperationExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is InvalidOperationException ex)
        {
            context.Result = new BadRequestObjectResult(new { message = ex.Message });
            context.ExceptionHandled = true;
        }
    }
}
