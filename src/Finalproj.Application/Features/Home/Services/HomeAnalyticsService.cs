using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Features.Home.DTOs;
using Finalproj.Application.Features.Home.Interfaces;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Home.Services;

public sealed class HomeAnalyticsService(
    IClienteRepository clientes,
    IServicoRepository servicos,
    IProdutoRepository produtos,
    IPaiolRepository paiois,
    IFuncionarioRepository funcionarios,
    IPerfilRepository perfis,
    IEncomendaRepository encomendas,
    IEntradaPaiolRepository entradas,
    ISaidaPaiolRepository saidas,
    IGestorAnalyticsRepository gestorAnalytics,
    IUnitOfWork unitOfWork) : IHomeAnalyticsService
{
    public async Task<object> GetStatsAsync(CancellationToken cancellationToken = default) => new
    {
        totalClientes = await clientes.CountAsync(cancellationToken),
        totalServicos = await servicos.CountAsync(cancellationToken),
        totalProdutos = await produtos.CountAsync(cancellationToken),
        totalPaioisAtivos = await paiois.CountByEstadoAsync(ConstantesPaiol.EstadoAtivo, cancellationToken)
    };

    public async Task<object> GetGestorDashboardAsync(CancellationToken cancellationToken = default)
    {
        var hoje = DateTime.UtcNow.Date;
        var ha7Dias = hoje.AddDays(-7);

        var totalClientes = await clientes.CountAsync(cancellationToken);
        var totalServicos = await servicos.CountAsync(cancellationToken);
        var totalProdutos = await produtos.CountAsync(cancellationToken);
        var totalPaioisAtivos = await paiois.CountByEstadoAsync(ConstantesPaiol.EstadoAtivo, cancellationToken);
        var totalFuncionarios = await funcionarios.CountAsync(cancellationToken);

        var clientesHa7 = await clientes.CountDisponiveisEmAsync(ha7Dias, cancellationToken);
        var servicosHa7 = await servicos.CountExistentesEmAsync(ha7Dias, cancellationToken);
        var produtosHa7 = await produtos.CountExistentesEmAsync(ha7Dias, cancellationToken);
        var paioisAtivosHa7 = await paiois.CountAtivosExistentesEmAsync(ha7Dias, cancellationToken);
        var funcionariosHa7 = await funcionarios.CountDisponiveisEmAsync(ha7Dias, cancellationToken);

        var encSemana = await gestorAnalytics.CountEncomendasCreatedBetweenAsync(ha7Dias, hoje.AddDays(1), cancellationToken);
        var encHa14 = await gestorAnalytics.CountEncomendasCreatedBetweenAsync(hoje.AddDays(-14), ha7Dias, cancellationToken);
        var paioisManut = (await paiois.GetAllAsync(cancellationToken)).Where(p => p.Estado == ConstantesPaiol.EstadoEmManutencao).ToList();

        return new
        {
            totalClientes,
            totalServicos,
            totalProdutos,
            totalPaioisAtivos,
            totalFuncionarios,
            encomendasPendentes = await encomendas.CountByEstadoAsync(ConstantesEncomenda.PENDENTE, cancellationToken),
            encomendasPorEstado = await encomendas.CountGroupedByEstadoAsync(cancellationToken),
            encomendasPorMes = (await encomendas.EncomendasPorMesUltimos6MesesAsync(cancellationToken)).Select(x => new { mes = x.MesKey, total = x.Total }).ToList(),
            paioisEmManutencao = paioisManut.Select(p => new { p.Id, p.Nome }).ToList(),
            ultimasEncomendas = (await encomendas.ListRecentWithClienteAsync(5, cancellationToken)).Select(EncomendaResponseDtoMapping.MapToList).ToList(),
            encomendasPendentesLista = (await encomendas.ListPendentesWithClienteAsync(8, cancellationToken)).Select(EncomendaResponseDtoMapping.MapToList).ToList(),
            entradasRecentes = (await entradas.ListRecentWithPaiolProdutoAsync(5, cancellationToken)).Select(e => new { tipo = "Entrada", id = e.Id, data = e.DataEntrada, paiolNome = e.Paiol?.Nome, produtoNome = e.Produto?.Nome, quantidade = e.Quantidade, encomendaId = (int?)null }).ToList(),
            saidasRecentes = (await saidas.ListRecentWithPaiolProdutoAsync(5, cancellationToken)).Select(s => new { tipo = "Saída", id = s.Id, data = s.DataSaida, paiolNome = s.Paiol?.Nome, produtoNome = s.Produto?.Nome, quantidade = s.Quantidade, encomendaId = s.EncomendaId }).ToList(),
            kpiContexto = new
            {
                encomendasPendentes = new
                {
                    deltaSemana = encSemana - encHa14,
                    recebidasSemana = encSemana,
                    texto = FormatDelta(encSemana, encHa14, "esta semana")
                },
                servicos = new { deltaSemana = totalServicos - servicosHa7, totalHa7Dias = servicosHa7, texto = FormatDeltaTotal(totalServicos, servicosHa7) },
                clientes = new { deltaSemana = totalClientes - clientesHa7, totalHa7Dias = clientesHa7, texto = FormatDeltaTotal(totalClientes, clientesHa7) },
                produtos = new { deltaSemana = totalProdutos - produtosHa7, totalHa7Dias = produtosHa7, texto = FormatDeltaTotal(totalProdutos, produtosHa7) },
                paiois = new { deltaSemana = totalPaioisAtivos - paioisAtivosHa7, totalHa7Dias = paioisAtivosHa7, emManutencao = paioisManut.Count, texto = FormatDeltaTotal(totalPaioisAtivos, paioisAtivosHa7) },
                funcionarios = new { deltaSemana = totalFuncionarios - funcionariosHa7, totalHa7Dias = funcionariosHa7, texto = FormatDeltaTotal(totalFuncionarios, funcionariosHa7) }
            }
        };
    }

    private static string FormatDeltaTotal(int totalAgora, int totalHa7Dias)
    {
        var d = totalAgora - totalHa7Dias;
        if (d == 0) return "igual a há 7 dias";
        return d > 0 ? $"+{d} vs há 7 dias" : $"{d} vs há 7 dias";
    }

    private static string FormatDelta(int atual, int anterior, string periodo)
    {
        var d = atual - anterior;
        if (d == 0) return $"+0 {periodo}";
        return d > 0 ? $"+{d} {periodo}" : $"{d} {periodo}";
    }

    public async Task<string?> GetTemaAsync(string userId, CancellationToken cancellationToken = default) =>
        (await perfis.GetByUserIdAsync(userId, cancellationToken))?.Tema;

    public async Task SaveTemaAsync(string userId, string tema, CancellationToken cancellationToken = default)
    {
        var perfil = await perfis.GetByUserIdTrackedAsync(userId, cancellationToken);
        if (perfil == null)
        {
            perfil = new Perfil { UserId = userId, DataRegisto = DateTime.UtcNow };
            await perfis.AddAsync(perfil, cancellationToken);
        }
        perfil.Tema = tema;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<PerfilEditViewModel> GetPerfilAsync(string userId, string userName, string email, IReadOnlyList<string> roles, CancellationToken cancellationToken = default)
    {
        var funcionario = await funcionarios.GetByUserIdAsync(userId, cancellationToken);
        if (funcionario != null)
        {
            return new PerfilEditViewModel
            {
                UserName = userName,
                Email = email,
                Nome = funcionario.NomeCompleto,
                Telefone = funcionario.Telefone,
                Roles = roles.ToList(),
                DataRegisto = funcionario.DataRegisto,
                EstaAssociadoAFuncionario = true
            };
        }
        var perfil = await perfis.GetByUserIdAsync(userId, cancellationToken);
        return new PerfilEditViewModel
        {
            UserName = userName,
            Email = email,
            Nome = perfil?.Nome,
            Telefone = perfil?.Telefone,
            Roles = roles.ToList(),
            DataRegisto = perfil?.DataRegisto
        };
    }

    public async Task SavePerfilAsync(string userId, string? nome, string? telefone, CancellationToken cancellationToken = default)
    {
        var funcionario = await funcionarios.GetByUserIdAsync(userId, cancellationToken);
        if (funcionario != null)
        {
            var tracked = await funcionarios.FindTrackedByIdAsync(funcionario.Id, cancellationToken);
            if (tracked != null)
            {
                tracked.NomeCompleto = nome ?? tracked.NomeCompleto;
                tracked.Telefone = telefone ?? tracked.Telefone;
            }
        }
        var perfil = await perfis.GetByUserIdTrackedAsync(userId, cancellationToken);
        if (perfil == null)
        {
            perfil = new Perfil { UserId = userId, DataRegisto = DateTime.UtcNow };
            await perfis.AddAsync(perfil, cancellationToken);
        }
        perfil.Nome = nome;
        perfil.Telefone = telefone;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
