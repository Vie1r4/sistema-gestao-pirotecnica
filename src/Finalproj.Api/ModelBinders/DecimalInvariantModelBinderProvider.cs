using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Finalproj.ModelBinders;

/// <summary>
/// Fornece o binder de decimal invariante para tipos decimal e decimal?.
/// </summary>
public class DecimalInvariantModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context == null)
            throw new ArgumentNullException(nameof(context));

        var type = context.Metadata.ModelType;
        if (type == typeof(decimal) || type == typeof(decimal?))
            return new DecimalInvariantModelBinder();

        return null;
    }
}
