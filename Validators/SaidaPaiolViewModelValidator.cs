using Finalproj.Models;
using FluentValidation;

namespace Finalproj.Validators;

/// <summary>
/// Validação do formulário de saída de paiol. Mensagens em português.
/// </summary>
public class SaidaPaiolViewModelValidator : AbstractValidator<SaidaPaiolViewModel>
{
    public SaidaPaiolViewModelValidator()
    {
        RuleFor(x => x.PaiolId)
            .GreaterThan(0)
            .WithMessage("Deve selecionar um paiol válido.");

        RuleFor(x => x.ProdutoId)
            .GreaterThan(0)
            .WithMessage("Deve selecionar um produto válido.");

        RuleFor(x => x.Quantidade)
            .GreaterThan(0)
            .WithMessage("A quantidade deve ser um valor positivo.");
    }
}
