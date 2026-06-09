namespace Finalproj.Api.Models;

public class ErrorViewModel
{
    public string? RequestId { get; set; }

    /// <summary>Quando true, mostrar RequestId na página (apenas em desenvolvimento).</summary>
    public bool IsDevelopment { get; set; }

    public bool ShowRequestId => IsDevelopment && !string.IsNullOrEmpty(RequestId);
}
