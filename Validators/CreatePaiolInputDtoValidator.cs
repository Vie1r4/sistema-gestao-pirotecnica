using Finalproj.Models;
using FluentValidation;

namespace Finalproj.Validators;

/// <summary>
/// Validação do DTO de criação de paiol. Mensagens em português.
/// </summary>
public class CreatePaiolInputDtoValidator : AbstractValidator<CreatePaiolInputDto>
{
    public CreatePaiolInputDtoValidator()
    {
        RuleFor(x => x.Paiol)
            .NotNull()
            .WithMessage("Os dados do paiol são obrigatórios.");

        When(x => x.Paiol != null, () =>
        {
            RuleFor(x => x.Paiol!.Nome)
                .NotEmpty()
                .WithMessage("O nome do paiol é obrigatório.")
                .MaximumLength(200)
                .WithMessage("O nome não pode exceder 200 caracteres.");

            RuleFor(x => x.Paiol!.Localizacao)
                .MaximumLength(500)
                .WithMessage("A localização não pode exceder 500 caracteres.");

            RuleFor(x => x.Paiol!.LimiteMLE)
                .GreaterThanOrEqualTo(0.01m)
                .WithMessage("O limite MLE deve ser um valor positivo (mínimo 0,01 kg).");

            RuleFor(x => x.Paiol!.PerfilRisco)
                .NotEmpty()
                .WithMessage("O perfil de risco é obrigatório.")
                .Must(v => ConstantesPaiol.PerfisRisco.Contains(v))
                .WithMessage("Perfil de risco inválido. Valores permitidos: 1.1 a 1.6.");

            RuleFor(x => x.Paiol!.Estado)
                .NotEmpty()
                .WithMessage("O estado é obrigatório.")
                .Must(v => ConstantesPaiol.Estados.Contains(v))
                .WithMessage("Estado inválido. Use \"Ativo\" ou \"Em Manutenção\".");

            RuleFor(x => x.Paiol!.NumeroLicenca)
                .MaximumLength(50)
                .WithMessage("O número da licença não pode exceder 50 caracteres.");
        });
    }
}
