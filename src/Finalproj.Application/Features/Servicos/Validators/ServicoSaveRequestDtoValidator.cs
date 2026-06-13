using Finalproj.Application.Features.Servicos.DTOs;
using FluentValidation;

namespace Finalproj.Application.Features.Servicos.Validators;

/// <summary>
/// Validação estrutural do pedido JSON de criar/editar serviço (zonas, coords, horários, quantidades).
/// A alocação de material face à encomenda valida-se em <see cref="Services.ServicoService"/>.
/// </summary>
public sealed class ServicoSaveRequestDtoValidator : AbstractValidator<ServicoSaveRequestDto>
{
    public ServicoSaveRequestDtoValidator()
    {
        RuleFor(x => x.EncomendaId)
            .GreaterThan(0)
            .WithMessage("Selecione uma encomenda válida.");

        RuleFor(x => x.DataServico)
            .NotEmpty()
            .WithMessage("A data do serviço é obrigatória.");

        RuleFor(x => x.NomeEvento)
            .MaximumLength(200)
            .WithMessage("O nome do evento não pode exceder 200 caracteres.");

        RuleFor(x => x.Local).MaximumLength(300);
        RuleFor(x => x.MoradaCompleta).MaximumLength(500);
        RuleFor(x => x.Distrito).MaximumLength(100);
        RuleFor(x => x.Cidade).MaximumLength(100);
        RuleFor(x => x.Municipio).MaximumLength(100);
        RuleFor(x => x.PublicoPrivado).MaximumLength(20);
        RuleFor(x => x.Observacoes).MaximumLength(2000);

        RuleFor(x => x.Zonas)
            .NotEmpty()
            .WithMessage("O serviço deve ter pelo menos uma zona de lançamento.");

        RuleForEach(x => x.Zonas).ChildRules(zona =>
        {
            zona.RuleFor(z => z.CoordenadasLat)
                .NotNull()
                .WithMessage("Cada zona deve ter coordenadas no mapa (latitude).");
            zona.RuleFor(z => z.CoordenadasLng)
                .NotNull()
                .WithMessage("Cada zona deve ter coordenadas no mapa (longitude).");
            zona.RuleFor(z => z.Designacao).MaximumLength(200);
            zona.RuleFor(z => z.Observacoes).MaximumLength(500);
            zona.RuleFor(z => z.Linhas)
                .NotEmpty()
                .WithMessage("Cada zona deve ter pelo menos uma linha de lançamento (data, hora e material).");

            zona.RuleForEach(z => z.Linhas).ChildRules(linha =>
            {
                linha.RuleFor(l => l.ProdutoId)
                    .GreaterThan(0)
                    .WithMessage("Cada linha deve referir um produto válido.");
                linha.RuleFor(l => l.Quantidade)
                    .GreaterThan(0)
                    .WithMessage("A quantidade de cada linha deve ser positiva.");
                linha.RuleFor(l => l.Data)
                    .NotEmpty()
                    .WithMessage("A data de lançamento é obrigatória em cada linha.");
                linha.RuleFor(l => l.HoraInicio)
                    .NotNull()
                    .WithMessage("A hora de início é obrigatória em cada linha de lançamento.");
                linha.RuleFor(l => l.HoraFim)
                    .NotNull()
                    .WithMessage("A hora de fim é obrigatória em cada linha de lançamento.");
                linha.RuleFor(l => l)
                    .Must(l => !l.HoraInicio.HasValue || !l.HoraFim.HasValue || l.HoraFim > l.HoraInicio)
                    .WithMessage("A hora de fim deve ser posterior à hora de início em cada linha de lançamento.");
            });
        });
    }
}
