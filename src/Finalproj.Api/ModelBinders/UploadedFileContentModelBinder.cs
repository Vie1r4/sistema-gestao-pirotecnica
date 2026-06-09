using Finalproj.Application.Common.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Finalproj.ModelBinders;

/// <summary>
/// Converte <see cref="IFormFile"/> do multipart/form-data em <see cref="UploadedFileContent"/> na fronteira HTTP.
/// </summary>
public sealed class UploadedFileContentModelBinder : IModelBinder
{
    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        ArgumentNullException.ThrowIfNull(bindingContext);

        var file = bindingContext.HttpContext.Request.Form.Files.GetFile(bindingContext.ModelName);
        if (file == null || file.Length == 0)
        {
            bindingContext.Result = ModelBindingResult.Success(null);
            return;
        }

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms, bindingContext.HttpContext.RequestAborted);
        bindingContext.Result = ModelBindingResult.Success(new UploadedFileContent
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Content = ms.ToArray()
        });
    }
}

public sealed class UploadedFileContentModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        var type = context.Metadata.ModelType;
        if (type == typeof(UploadedFileContent))
            return new UploadedFileContentModelBinder();
        return null;
    }
}
