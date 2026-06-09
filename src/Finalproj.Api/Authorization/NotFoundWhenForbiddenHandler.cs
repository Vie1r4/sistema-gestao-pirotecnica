using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;

namespace Finalproj.Authorization;

/// <summary>Devolve 404 em vez de 403 para políticas de documentação regulatória (não revelar existência do recurso).</summary>
public sealed class NotFoundWhenForbiddenHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _default = new();

    public async Task HandleAsync(
        RequestDelegate next,
        HttpContext context,
        AuthorizationPolicy policy,
        PolicyAuthorizationResult authorizeResult)
    {
        if (authorizeResult.Forbidden &&
            policy.Requirements.Any(r => r is DocumentacaoRegulatoriaRequirement))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        await _default.HandleAsync(next, context, policy, authorizeResult);
    }
}

public sealed class DocumentacaoRegulatoriaRequirement : IAuthorizationRequirement;

public sealed class DocumentacaoRegulatoriaRequirementHandler : AuthorizationHandler<DocumentacaoRegulatoriaRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DocumentacaoRegulatoriaRequirement requirement)
    {
        if (context.User.IsInRole(ConstantesRoles.Admin) || context.User.IsInRole(ConstantesRoles.Gestor))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
