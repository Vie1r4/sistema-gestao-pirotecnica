using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Uma linha de auditoria por acção (entrada/saída stock, encomenda aceite/rejeitada/concluída)
public class LogSistema
{
    public long Id { get; set; }

    [Required(ErrorMessage = "A ação do log é obrigatória.")]
    [StringLength(80, ErrorMessage = "A ação não pode exceder 80 caracteres.")]
    public string Acao { get; set; } = string.Empty;

    [StringLength(450)]
    public string? UserId { get; set; }

    [StringLength(200)]
    public string? UserName { get; set; }

    // Dados extra em JSON (IDs, quantidades, etc.)
    public string? JsonDados { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
