using Finalproj.Domain.Constants;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Finalproj.Api.Validators;

/// <summary>
/// Extensões para adicionar erros do FluentValidation ao ModelState da API.
/// </summary>
public static class ModelStateExtensions
{
    public static void AddValidationResult(this ModelStateDictionary modelState, ValidationResult result)
    {
        if (result == null || result.IsValid) return;
        foreach (var error in result.Errors)
        {
            var key = string.IsNullOrEmpty(error.PropertyName) ? string.Empty : error.PropertyName;
            modelState.AddModelError(key, error.ErrorMessage);
        }
    }
}
