using Finalproj.Models;
using FluentValidation;

namespace Finalproj.Validators;

/// <summary>
/// Validação do DTO de criação de funcionário. Mensagens em português.
/// </summary>
public class CreateFuncionarioInputDtoValidator : AbstractValidator<CreateFuncionarioInputDto>
{
    private static readonly string[] RolesPermitidos = ConstantesRoles.ParaContaFuncionario;

    public CreateFuncionarioInputDtoValidator()
    {
        RuleFor(x => x.Funcionario)
            .NotNull()
            .WithMessage("Os dados do funcionário são obrigatórios.");

        When(x => x.Funcionario != null, () =>
        {
            RuleFor(x => x.Funcionario!.NomeCompleto)
                .NotEmpty()
                .WithMessage("O nome completo é obrigatório.")
                .MaximumLength(200)
                .WithMessage("O nome não pode exceder 200 caracteres.");

            When(x => !string.IsNullOrWhiteSpace(x.Funcionario!.NIF), () =>
            {
                RuleFor(x => x.Funcionario!.NIF)
                    .Length(9)
                    .WithMessage("O NIF deve ter exatamente 9 dígitos.")
                    .Matches(@"^\d{9}$")
                    .WithMessage("O NIF deve conter apenas 9 dígitos.");
            });

            When(x => !string.IsNullOrWhiteSpace(x.Funcionario!.Email), () =>
            {
                RuleFor(x => x.Funcionario!.Email)
                    .EmailAddress()
                    .WithMessage("O email é inválido.")
                    .MaximumLength(256)
                    .WithMessage("O email não pode exceder 256 caracteres.");
            });

            RuleFor(x => x.Funcionario!.Morada)
                .MaximumLength(300)
                .WithMessage("A morada não pode exceder 300 caracteres.");

            RuleFor(x => x.Funcionario!.Notas)
                .MaximumLength(500)
                .WithMessage("As notas não podem exceder 500 caracteres.");
        });

        When(x => x.CriarConta, () =>
        {
            RuleFor(x => x.ContaEmail)
                .NotEmpty()
                .WithMessage("O email é obrigatório para criar a conta de acesso.")
                .EmailAddress()
                .WithMessage("O email da conta é inválido.");

            RuleFor(x => x.ContaPassword)
                .NotEmpty()
                .WithMessage("A palavra-passe é obrigatória.")
                .MinimumLength(6)
                .WithMessage("A palavra-passe deve ter pelo menos 6 caracteres.");

            RuleFor(x => x.ContaConfirmPassword)
                .Equal(x => x.ContaPassword)
                .WithMessage("A confirmação da palavra-passe não coincide.");

            RuleFor(x => x.ContaRole)
                .NotEmpty()
                .WithMessage("Selecione um perfil de acesso.")
                .Must(r => RolesPermitidos.Contains(r ?? ""))
                .WithMessage("Perfil de acesso inválido. Valores permitidos: Admin, Armazém, Gestor, Comercial.");
        });
    }
}
