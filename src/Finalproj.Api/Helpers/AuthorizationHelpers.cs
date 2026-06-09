using System.Security.Claims;
using Finalproj.Domain.Constants;

namespace Finalproj.Api.Helpers;

public static class AuthorizationHelpers
{
    public static bool PodeGerirDocumentacaoRegulatoria(ClaimsPrincipal user) =>
        user.IsInRole(ConstantesRoles.Admin) || user.IsInRole(ConstantesRoles.Gestor);
}
