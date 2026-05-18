using Finalproj.Application.Features.Clientes.DTOs;
using FluentValidation;

namespace Finalproj.Application.Features.Clientes.Validators;

/// <summary>
/// Validação do DTO de criação de cliente. Mensagens em português.
/// </summary>
public class CreateClienteInputDtoValidator : AbstractValidator<CreateClienteInputDto>
{
    public CreateClienteInputDtoValidator()
    {
        RuleFor(x => x.Cliente)
            .NotNull()
            .WithMessage("Os dados do cliente são obrigatórios.");

        When(x => x.Cliente != null, () =>
        {
            RuleFor(x => x.Cliente!.Nome)
                .NotEmpty()
                .WithMessage("O nome ou designação é obrigatório.")
                .MaximumLength(200)
                .WithMessage("O nome não pode exceder 200 caracteres.");

            RuleFor(x => x.Cliente!.TipoCliente)
                .MaximumLength(20)
                .WithMessage("O tipo de cliente não pode exceder 20 caracteres.");

            When(x => !string.IsNullOrWhiteSpace(x.Cliente!.NIF), () =>
            {
                RuleFor(x => x.Cliente!.NIF)
                    .Length(9)
                    .WithMessage("O NIF deve ter exatamente 9 dígitos.")
                    .Matches(@"^\d{9}$")
                    .WithMessage("O NIF deve conter apenas 9 dígitos.");
            });

            When(x => !string.IsNullOrWhiteSpace(x.Cliente!.Email), () =>
            {
                RuleFor(x => x.Cliente!.Email)
                    .EmailAddress()
                    .WithMessage("O email é inválido.")
                    .MaximumLength(256)
                    .WithMessage("O email não pode exceder 256 caracteres.");
            });

            RuleFor(x => x.Cliente!.Morada)
                .MaximumLength(300)
                .WithMessage("A morada não pode exceder 300 caracteres.");

            RuleFor(x => x.Cliente!.Notas)
                .MaximumLength(500)
                .WithMessage("As notas não podem exceder 500 caracteres.");
        });
    }
}
