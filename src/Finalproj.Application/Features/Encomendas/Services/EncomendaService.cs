using Finalproj.Application.Features.Encomendas.Interfaces;
using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Services;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Encomendas.Services;

/// <summary>
/// Regras de domínio para encomendas: preparação com saídas FIFO, validações de estado e acesso a paióis.
/// </summary>
public class EncomendaService : IEncomendaService
{
    private readonly IEncomendaRepository _encomendaRepository;
    private readonly IEntradaPaiolRepository _entradaPaiolRepository;
    private readonly ISaidaPaiolRepository _saidaPaiolRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogSistemaService _logSistema;

    public EncomendaService(
        IEncomendaRepository encomendaRepository,
        IEntradaPaiolRepository entradaPaiolRepository,
        ISaidaPaiolRepository saidaPaiolRepository,
        IUnitOfWork unitOfWork,
        ILogSistemaService logSistema)
    {
        _encomendaRepository = encomendaRepository;
        _entradaPaiolRepository = entradaPaiolRepository;
        _saidaPaiolRepository = saidaPaiolRepository;
        _unitOfWork = unitOfWork;
        _logSistema = logSistema;
    }

    /// <inheritdoc />
    public async Task<(bool Sucesso, string? Erro)> RegistarPreparacaoAsync(
        int encomendaId,
        string? userId,
        IReadOnlyList<int> idsPaióisComAcesso,
        List<RetiradaPreparacaoInput> retiradas,
        string? userName,
        CancellationToken cancellationToken = default)
    {
        var encomenda = await _encomendaRepository.GetByIdWithItensAndProdutosTrackedAsync(encomendaId, cancellationToken);
        if (encomenda == null)
            return (false, "Encomenda não encontrada.");
        if (encomenda.Estado != ConstantesEncomenda.ACEITE)
            return (false, "Apenas encomendas aceites podem ser preparadas.");

        var erroCred = ValidarCoordenadorCred(encomenda);
        if (erroCred != null)
            return (false, erroCred);

        var retiradasComQuantidade = (retiradas ?? new List<RetiradaPreparacaoInput>()).Where(r => r.Quantidade > 0).ToList();
        var itensPorId = encomenda.Itens.ToDictionary(i => i.Id);

        foreach (var r in retiradasComQuantidade)
        {
            if (!itensPorId.ContainsKey(r.EncomendaItemId))
                return (false, "Dados de preparação inválidos (item não pertence à encomenda).");
            if (!idsPaióisComAcesso.Contains(r.PaiolId))
                return (false, "Não tem acesso a um dos paióis selecionados.");
        }

        foreach (var item in encomenda.Itens)
        {
            var somaRetiradas = retiradasComQuantidade.Where(rt => rt.EncomendaItemId == item.Id).Sum(rt => rt.Quantidade);
            if (Math.Abs(somaRetiradas - item.QuantidadePedida) > 0.0001m)
                return (false, $"Para o produto {item.Produto?.Nome}, a soma das quantidades a retirar ({somaRetiradas:N2}) deve ser igual à quantidade pedida ({item.QuantidadePedida:N2}).");
        }

        var produtoIds = retiradasComQuantidade
            .Select(r => itensPorId[r.EncomendaItemId].ProdutoId)
            .Distinct()
            .ToList();

        var entradasComSaldo = await _entradaPaiolRepository.ListComSaldoParaPreparacaoAsync(
            idsPaióisComAcesso.ToList(),
            produtoIds,
            cancellationToken);
        var restantePorEntrada = entradasComSaldo.ToDictionary(e => e.Id, e => e.QuantidadeRestante);

        foreach (var r in retiradasComQuantidade)
        {
            var item = itensPorId[r.EncomendaItemId];
            var falta = r.Quantidade;
            var entradasPaiolProduto = entradasComSaldo
                .Where(e => e.PaiolId == r.PaiolId && e.ProdutoId == item.ProdutoId && restantePorEntrada.GetValueOrDefault(e.Id, 0) > 0)
                .ToList();

            foreach (var ent in entradasPaiolProduto)
            {
                if (falta <= 0) break;
                var rest = restantePorEntrada.GetValueOrDefault(ent.Id, 0);
                if (rest <= 0) continue;
                var qty = Math.Min(falta, rest);
                await _saidaPaiolRepository.AddAsync(new SaidaPaiol
                {
                    PaiolId = ent.PaiolId,
                    ProdutoId = ent.ProdutoId,
                    Quantidade = qty,
                    DataSaida = DateTime.UtcNow,
                    EncomendaId = encomenda.Id,
                    EntradaPaiolId = ent.Id,
                    FuncionarioRetirouUserId = userId
                }, cancellationToken);
                restantePorEntrada[ent.Id] = rest - qty;
                falta -= qty;

                await _logSistema.RegistarAsync("SAIDA_STOCK", userId, userName, new
                {
                    produto_id = ent.ProdutoId,
                    numero_lote = ent.NumeroLote,
                    quantidade_retirada_kg = qty,
                    paiol_id = ent.PaiolId,
                    paiol_nome = ent.PaiolNome,
                    encomenda_id = encomenda.Id
                }, cancellationToken);
            }

            if (falta > 0)
                return (false, $"Stock insuficiente no paiol selecionado para o produto {item.Produto?.Nome}. Reduza a quantidade ou escolha outro paiol.");
        }

        encomenda.Estado = ConstantesEncomenda.EM_PREPARACAO;
        encomenda.FuncionarioPreparouUserId = userId;
        encomenda.DataEmPreparacao ??= DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (true, null);
    }

    /// <summary>
    /// Antecipa validação PSP: se a encomenda tem coordenador pirotécnico, exige n.º CRED na ficha
    /// antes de alocar stock (FIFO) e mudar para «Em preparação».
    /// </summary>
    private static string? ValidarCoordenadorCred(Encomenda encomenda)
    {
        if (!encomenda.CoordenadorPirotecnicoId.HasValue)
            return null;

        var coord = encomenda.CoordenadorPirotecnico;
        if (coord == null)
        {
            return $"{ConstantesEncomenda.CodigoCoordenadorSemCred}: Coordenador pirotécnico associado à encomenda não foi encontrado.";
        }

        if (string.IsNullOrWhiteSpace(coord.NumeroCredencial))
        {
            return $"{ConstantesEncomenda.CodigoCoordenadorSemCred}: O coordenador «{coord.NomeCompleto}» não tem n.º CRED na ficha. " +
                   "Preencha em Funcionários → editar → «N.º credencial (CRED)».";
        }

        return null;
    }
}
