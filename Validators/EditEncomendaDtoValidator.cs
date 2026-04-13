using Finalproj.Models;
using FluentValidation;

namespace Finalproj.Validators;

/// <summary>
/// Validação do DTO de edição de encomenda. Mensagens em português.
/// </summary>
public class EditEncomendaDtoValidator : AbstractValidator<EditEncomendaDto>
{
    public EditEncomendaDtoValidator()
    {
        RuleFor(x => x.Observacoes)
            .MaximumLength(2000)
            .WithMessage("As observações não podem exceder 2000 caracteres.");

        RuleForEach(x => x.Itens).ChildRules(item =>
        {
            item.RuleFor(x => x.ProdutoId)
                .GreaterThan(0)
                .WithMessage("Cada item deve referir um produto válido.");

            item.RuleFor(x => x.Quantidade)
                .GreaterThan(0)
                .WithMessage("A quantidade de cada item deve ser positiva.");
        });
    }
}
