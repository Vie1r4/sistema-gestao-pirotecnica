using Finalproj.Models;
using FluentValidation;

namespace Finalproj.Validators;

/// <summary>
/// Validação do formulário de entrada de produto no paiol. Mensagens em português.
/// </summary>
public class EntradaPaiolViewModelValidator : AbstractValidator<EntradaPaiolViewModel>
{
    public EntradaPaiolViewModelValidator()
    {
        RuleFor(x => x.PaiolId)
            .GreaterThan(0)
            .WithMessage("Deve selecionar um paiol válido.");

        RuleFor(x => x.ProdutoId)
            .GreaterThan(0)
            .WithMessage("Deve selecionar um produto válido.");

        RuleFor(x => x.Quantidade)
            .GreaterThanOrEqualTo(0.0001m)
            .WithMessage("A quantidade deve ser um valor positivo (mínimo 0,0001).");

        RuleFor(x => x.NumeroLote)
            .MaximumLength(50)
            .WithMessage("O número de lote não pode exceder 50 caracteres.");
    }
}
