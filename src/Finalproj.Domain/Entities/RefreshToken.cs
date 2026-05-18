namespace Finalproj.Domain.Entities;

/// <summary>
/// Refresh token para renovar o JWT sem novo login.
/// Armazenamos o hash do token (nunca o valor em claro na BD).
/// </summary>
public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    /// <summary> Hash SHA256 do token (valor enviado ao cliente). </summary>
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
}
