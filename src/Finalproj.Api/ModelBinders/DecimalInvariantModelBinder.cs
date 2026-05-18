using System.Globalization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Finalproj.ModelBinders;

/// <summary>
/// Faz o binding de decimal/decimal? a partir de form/query usando cultura invariante (ponto como separador decimal).
/// Evita o erro "The value 'X' is not valid for Latitude" quando o cliente envia coordenadas com ponto (ex: 40.334364035).
/// </summary>
public class DecimalInvariantModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null)
            throw new ArgumentNullException(nameof(bindingContext));

        var modelName = bindingContext.ModelName;
        var valueProviderResult = bindingContext.ValueProvider.GetValue(modelName);
        if (valueProviderResult == ValueProviderResult.None)
            return Task.CompletedTask;

        bindingContext.ModelState.SetModelValue(modelName, valueProviderResult);
        var value = valueProviderResult.FirstValue;
        if (string.IsNullOrWhiteSpace(value))
            return Task.CompletedTask;

        if (decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var result))
        {
            bindingContext.Result = ModelBindingResult.Success(result);
            return Task.CompletedTask;
        }

        bindingContext.ModelState.TryAddModelError(
            modelName,
            bindingContext.ModelMetadata.DisplayName != null
                ? $"O valor '{value}' não é válido para {bindingContext.ModelMetadata.DisplayName}."
                : $"O valor '{value}' não é válido.");
        return Task.CompletedTask;
    }
}
