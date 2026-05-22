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
        var semanaInicio = hoje.AddDays(-7);
        var semanaAnteriorInicio = hoje.AddDays(-14);
        var encSemana = await gestorAnalytics.CountEncomendasCreatedBetweenAsync(semanaInicio, hoje.AddDays(1), cancellationToken);
        var encSemanaAnt = await gestorAnalytics.CountEncomendasCreatedBetweenAsync(semanaAnteriorInicio, semanaInicio, cancellationToken);
        var srvDesde2Sem = await servicos.CountCreatedSinceAsync(semanaAnteriorInicio, cancellationToken);
        var srvSemana = await servicos.CountCreatedSinceAsync(semanaInicio, cancellationToken);
        var srvSemanaAnt = srvDesde2Sem - srvSemana;
        var clientesDesde2Sem = await gestorAnalytics.CountClientesRegistadosDesdeAsync(semanaAnteriorInicio, cancellationToken);
        var clientesSemana = await gestorAnalytics.CountClientesRegistadosDesdeAsync(semanaInicio, cancellationToken);
        var clientesSemanaAnt = clientesDesde2Sem - clientesSemana;
        var funcDesde2Sem = await funcionarios.CountRegistadosDesdeAsync(semanaAnteriorInicio, cancellationToken);
        var funcSemana = await funcionarios.CountRegistadosDesdeAsync(semanaInicio, cancellationToken);
        var funcSemanaAnt = funcDesde2Sem - funcSemana;
        var prodDesde2Sem = await produtos.CountRegistadosDesdeAsync(semanaAnteriorInicio, cancellationToken);
        var prodSemana = await produtos.CountRegistadosDesdeAsync(semanaInicio, cancellationToken);
        var prodSemanaAnt = prodDesde2Sem - prodSemana;
        var paioisManut = (await paiois.GetAllAsync(cancellationToken)).Where(p => p.Estado == ConstantesPaiol.EstadoEmManutencao).ToList();

        return new
        {
            totalClientes = await clientes.CountAsync(cancellationToken),
            totalServicos = await servicos.CountAsync(cancellationToken),
            totalProdutos = await produtos.CountAsync(cancellationToken),
            totalPaioisAtivos = await paiois.CountByEstadoAsync(ConstantesPaiol.EstadoAtivo, cancellationToken),
            totalFuncionarios = await funcionarios.CountAsync(cancellationToken),
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
                    deltaSemana = encSemana - encSemanaAnt,
                    recebidasSemana = encSemana,
                    texto = FormatDelta(encSemana, encSemanaAnt, "esta semana")
                },
                servicos = new { deltaSemana = srvSemana - srvSemanaAnt, texto = FormatDelta(srvSemana, srvSemanaAnt, "esta semana") },
                clientes = new { deltaSemana = clientesSemana - clientesSemanaAnt, novosSemana = clientesSemana, texto = FormatDelta(clientesSemana, clientesSemanaAnt, "esta semana") },
                produtos = new
                {
                    total = await produtos.CountAsync(cancellationToken),
                    deltaSemana = prodSemana - prodSemanaAnt,
                    texto = FormatDelta(prodSemana, prodSemanaAnt, "esta semana")
                },
                paiois = new { emManutencao = paioisManut.Count, texto = paioisManut.Count > 0 ? $"{paioisManut.Count} em manutenção" : "todos operacionais" },
                funcionarios = new
                {
                    deltaSemana = funcSemana - funcSemanaAnt,
                    texto = FormatDelta(funcSemana, funcSemanaAnt, "esta semana")
                }
            }
        };
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
