using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Finalproj.Controllers;

// Encomendas: listagem por estado, detalhe, criar rascunho em sessão, aceitar/rejeitar, preparar (FIFO) e concluir.
[Authorize]
public class EncomendasController : Controller
{
    private const string SessionKeyDraft = "EncomendaDraft";
    private readonly FinalprojContext _context;
    private readonly ILogSistemaService _logSistema;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IStockDisponivelService _stockDisponivel;
    private readonly IEncomendaService _encomendaService;

    public EncomendasController(FinalprojContext context, ILogSistemaService logSistema, UserManager<IdentityUser> userManager, IStockDisponivelService stockDisponivel, IEncomendaService encomendaService)
    {
        _context = context;
        _logSistema = logSistema;
        _userManager = userManager;
        _stockDisponivel = stockDisponivel;
        _encomendaService = encomendaService;
    }

    // Lê rascunho da encomenda da sessão (JSON)
    private EncomendaDraftViewModel? GetDraft()
    {
        var json = HttpContext.Session.GetString(SessionKeyDraft);
        if (string.IsNullOrEmpty(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<EncomendaDraftViewModel>(json);
        }
        catch { return null; }
    }

    // Guarda rascunho na sessão
    private void SetDraft(EncomendaDraftViewModel draft)
    {
        HttpContext.Session.SetString(SessionKeyDraft, JsonSerializer.Serialize(draft));
    }

    // Limpa rascunho da sessão
    private void ClearDraft()
    {
        HttpContext.Session.Remove(SessionKeyDraft);
    }

    // Lista encomendas com filtro por estado e paginação
    public async Task<IActionResult> Index(string? estado, int pagina = 1, int itensPorPagina = 20, CancellationToken cancellationToken = default)
    {
        if (pagina < 1) pagina = 1;
        if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 20;

        IQueryable<Encomenda> query = _context.Encomendas
            .AsNoTracking()
            .Include(e => e.Cliente);

        if (!string.IsNullOrEmpty(estado) && ConstantesEncomenda.TodosEstados.Contains(estado))
            query = query.Where(e => e.Estado == estado);

        query = query.OrderBy(e => e.DataEntrega == null).ThenBy(e => e.DataEntrega ?? DateTime.MaxValue).ThenByDescending(e => e.DataCriacao);

        var totalRegistos = await query.CountAsync(cancellationToken);
        var lista = await query
            .Skip((pagina - 1) * itensPorPagina)
            .Take(itensPorPagina)
            .ToListAsync(cancellationToken);

        var totaisPorEstado = await _context.Encomendas
            .AsNoTracking()
            .GroupBy(e => e.Estado)
            .Select(g => new { Estado = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.Estado, x => x.Total, cancellationToken);
        var totalGeral = totaisPorEstado.Values.Sum();

        ViewData["Estado"] = estado ?? "";
        ViewData["EstadosParaFiltro"] = ConstantesEncomenda.TodosEstados;
        ViewData["TotaisPorEstado"] = totaisPorEstado;
        ViewData["TotalGeral"] = totalGeral;
        ViewData["PaginaAtual"] = pagina;
        ViewData["ItensPorPagina"] = itensPorPagina;
        ViewData["TotalRegistos"] = totalRegistos;
        return View(lista);
    }

    // Detalhe da encomenda + stock actual por produto (para UI)
    public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();

        var encomenda = await _context.Encomendas
            .AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .Include(e => e.Servicos)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (encomenda == null) return NotFound();

        var stockPorProduto = await _stockDisponivel.ObterStockDisponivelPorProdutoAsync(cancellationToken);
        ViewData["StockPorProduto"] = stockPorProduto;

        var userIds = new List<string>();
        if (!string.IsNullOrEmpty(encomenda.FuncionarioAceiteUserId)) userIds.Add(encomenda.FuncionarioAceiteUserId);
        if (!string.IsNullOrEmpty(encomenda.FuncionarioPreparouUserId) && !userIds.Contains(encomenda.FuncionarioPreparouUserId)) userIds.Add(encomenda.FuncionarioPreparouUserId);
        var nomesPorUserId = new Dictionary<string, string>();
        if (userIds.Count > 0)
        {
            var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToListAsync(cancellationToken);
            foreach (var u in users)
                nomesPorUserId[u.Id] = u.UserName ?? u.Id;
        }
        string? funcionarioAceiteNome = null;
        string? funcionarioPreparouNome = null;
        if (!string.IsNullOrEmpty(encomenda.FuncionarioAceiteUserId))
            funcionarioAceiteNome = nomesPorUserId.GetValueOrDefault(encomenda.FuncionarioAceiteUserId) ?? encomenda.FuncionarioAceiteUserId;
        if (!string.IsNullOrEmpty(encomenda.FuncionarioPreparouUserId))
            funcionarioPreparouNome = nomesPorUserId.GetValueOrDefault(encomenda.FuncionarioPreparouUserId) ?? encomenda.FuncionarioPreparouUserId;
        ViewData["FuncionarioAceiteNome"] = funcionarioAceiteNome;
        ViewData["FuncionarioPreparouNome"] = funcionarioPreparouNome;

        if (TempData["EncomendaCriada"] as bool? == true)
            TempData["MensagemSucesso"] = "Encomenda registada. Aguarde aceitação pela equipa.";
        if (TempData["EncomendaAceite"] as bool? == true)
            TempData["MensagemSucesso"] = "Encomenda aceite.";
        if (TempData["EncomendaRejeitada"] as bool? == true)
            TempData["MensagemSucesso"] = "Encomenda rejeitada e stock libertado.";
        if (TempData["EncomendaPreparacao"] as bool? == true)
            TempData["MensagemSucesso"] = "Preparação registada. Pode marcar como concluída quando os materiais forem entregues.";
        if (TempData["EncomendaConcluida"] as bool? == true)
            TempData["MensagemSucesso"] = "Encomenda concluída.";

        return View(encomenda);
    }

    [Authorize(Roles = "Admin")]
    // GET: formulário para escolher cliente; depois segue para AdicionarItens
    public async Task<IActionResult> Create(int? clienteId, CancellationToken cancellationToken = default)
    {
        var clientes = await _context.Clientes.OrderBy(c => c.Nome).ToListAsync(cancellationToken);
        ViewData["ClienteId"] = new SelectList(clientes, "Id", "Nome", clienteId);
        return View(new EncomendaCriarViewModel { ClienteId = clienteId ?? 0 });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(EncomendaCriarViewModel model, CancellationToken cancellationToken = default)
    {
        var cliente = await _context.Clientes.FindAsync(model.ClienteId);
        if (cliente == null)
            ModelState.AddModelError(nameof(model.ClienteId), "Selecione o cliente que fez a encomenda.");

        if (!ModelState.IsValid)
        {
            var clientes = await _context.Clientes.OrderBy(c => c.Nome).ToListAsync(cancellationToken);
            ViewData["ClienteId"] = new SelectList(clientes, "Id", "Nome", model.ClienteId);
            return View(model);
        }

        return RedirectToAction(nameof(AdicionarItens), new { clienteId = model.ClienteId });
    }

    [Authorize(Roles = "Admin")]
    // GET: escolher produtos para o rascunho (filtros como no catálogo)
    public async Task<IActionResult> AdicionarItens(
        int clienteId,
        string? pesquisa,
        string? classificacao,
        string? grupoCompatibilidade,
        string? filtroTecnico,
        string? calibre,
        CancellationToken cancellationToken = default)
    {
        var cliente = await _context.Clientes.FindAsync(clienteId);
        if (cliente == null) return NotFound();

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId)
        {
            draft = new EncomendaDraftViewModel { ClienteId = clienteId, Itens = new List<EncomendaItemCriarViewModel>() };
            SetDraft(draft);
        }

        var query = _context.Produtos.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(pesquisa))
            query = query.Where(p => p.Nome.Contains(pesquisa));
        if (!string.IsNullOrEmpty(classificacao))
            query = query.Where(p => p.FamiliaRisco == classificacao);
        if (!string.IsNullOrEmpty(grupoCompatibilidade))
            query = query.Where(p => p.GrupoCompatibilidade == grupoCompatibilidade);
        if (!string.IsNullOrEmpty(filtroTecnico))
            query = query.Where(p => p.FiltroTecnico == filtroTecnico);
        if (!string.IsNullOrEmpty(calibre))
            query = query.Where(p => p.Calibre == calibre);

        var produtosFiltrados = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);

        ViewData["ClienteNome"] = cliente.Nome;
        ViewData["ClienteId"] = clienteId;
        ViewData["Pesquisa"] = pesquisa ?? "";
        ViewData["Classificacao"] = classificacao ?? "";
        ViewData["GrupoCompatibilidade"] = grupoCompatibilidade ?? "";
        ViewData["FiltroTecnico"] = filtroTecnico ?? "";
        ViewData["Calibre"] = calibre ?? "";
        ViewData["ProdutosFiltrados"] = produtosFiltrados;
        ViewData["ItensRascunho"] = draft.Itens;

        return View(new EncomendaCriarViewModel { ClienteId = clienteId, Itens = draft.Itens });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Adiciona produto ao rascunho (ou soma quantidade se já existir)
    public async Task<IActionResult> AdicionarItem(
        int clienteId,
        int produtoId,
        decimal quantidade,
        string? pesquisa,
        string? classificacao,
        string? grupoCompatibilidade,
        string? filtroTecnico,
        string? calibre,
        CancellationToken cancellationToken = default)
    {
        if (quantidade <= 0)
            return RedirectToAction(nameof(AdicionarItens), new { clienteId, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre });

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId)
            draft = new EncomendaDraftViewModel { ClienteId = clienteId, Itens = new List<EncomendaItemCriarViewModel>() };

        var produto = await _context.Produtos.FindAsync(produtoId);
        if (produto == null)
            return RedirectToAction(nameof(AdicionarItens), new { clienteId, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre });

        var existente = draft.Itens.FirstOrDefault(i => i.ProdutoId == produtoId);
        if (existente != null)
            existente.Quantidade += quantidade;
        else
            draft.Itens.Add(new EncomendaItemCriarViewModel { ProdutoId = produtoId, ProdutoNome = produto.Nome, Quantidade = quantidade });

        SetDraft(draft);
        TempData["ItemAdicionado"] = $"{produto.Nome} ({quantidade}) adicionado à encomenda.";
        return RedirectToAction(nameof(AdicionarItens), new { clienteId, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Remove produto do rascunho
    public IActionResult RemoverItem(int clienteId, int produtoId, string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre)
    {
        var draft = GetDraft();
        if (draft != null && draft.ClienteId == clienteId)
        {
            draft.Itens.RemoveAll(i => i.ProdutoId == produtoId);
            SetDraft(draft);
        }
        return RedirectToAction(nameof(AdicionarItens), new { clienteId, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Cria encomenda e reservas a partir do rascunho; estado Pendente
    public async Task<IActionResult> AdicionarItens(int clienteId, DateTime? dataEntrega, string? observacoes, CancellationToken cancellationToken = default)
    {
        var cliente = await _context.Clientes.FindAsync(clienteId);
        if (cliente == null)
        {
            ClearDraft();
            return RedirectToAction(nameof(Create));
        }

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId || draft.Itens.Count == 0)
        {
            TempData["Erro"] = "Adicione pelo menos um produto à encomenda.";
            return RedirectToAction(nameof(AdicionarItens), new { clienteId });
        }

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.PENDENTE,
            DataCriacao = DateTime.UtcNow,
            DataEntrega = dataEntrega,
            Observacoes = string.IsNullOrWhiteSpace(observacoes) ? null : observacoes.Trim().Length > 2000 ? observacoes.Trim()[..2000] : observacoes.Trim()
        };
        _context.Encomendas.Add(encomenda);
        await _context.SaveChangesAsync(cancellationToken);

        foreach (var item in draft.Itens)
        {
            _context.EncomendaItems.Add(new EncomendaItem
            {
                EncomendaId = encomenda.Id,
                ProdutoId = item.ProdutoId,
                QuantidadePedida = item.Quantidade
            });
            _context.Reservas.Add(new Reserva
            {
                EncomendaId = encomenda.Id,
                ProdutoId = item.ProdutoId,
                Quantidade = item.Quantidade
            });
        }
        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_CRIADA", userId, User?.Identity?.Name, new { encomenda_id = encomenda.Id, cliente_id = encomenda.ClienteId }, cancellationToken);

        ClearDraft();
        TempData["EncomendaCriada"] = true;
        return RedirectToAction(nameof(Details), new { id = encomenda.Id });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Passa encomenda de Pendente → Aceite; guarda quem aceitou e regista no log
    public async Task<IActionResult> Aceitar(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.FindAsync(id);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE)
        {
            TempData["Erro"] = "Apenas encomendas pendentes podem ser aceites.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        encomenda.Estado = ConstantesEncomenda.ACEITE;
        encomenda.FuncionarioAceiteUserId = userId;
        await _context.SaveChangesAsync(cancellationToken);

        await _logSistema.RegistarAsync("ENCOMENDA_ACEITE", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        TempData["EncomendaAceite"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }

    [Authorize(Roles = "Admin")]
    // GET: formulário de rejeição (motivo opcional)
    public async Task<IActionResult> Rejeitar(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var encomenda = await _context.Encomendas.AsNoTracking().Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
        {
            TempData["Erro"] = "Apenas encomendas pendentes ou aceites podem ser rejeitadas.";
            return RedirectToAction(nameof(Details), new { id });
        }
        return View(encomenda);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Rejeita encomenda, remove reservas de stock e regista no log
    public async Task<IActionResult> Rejeitar(int id, string? motivoRejeicao, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.Include(e => e.Itens).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
        {
            TempData["Erro"] = "Apenas encomendas pendentes ou aceites podem ser rejeitadas.";
            return RedirectToAction(nameof(Details), new { id });
        }

        encomenda.Estado = ConstantesEncomenda.REJEITADA;
        encomenda.MotivoRejeicao = string.IsNullOrWhiteSpace(motivoRejeicao) ? null : motivoRejeicao.Trim();
        var reservas = await _context.Reservas.Where(r => r.EncomendaId == id).ToListAsync(cancellationToken);
        _context.Reservas.RemoveRange(reservas);
        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_REJEITADA", userId, User?.Identity?.Name, new { encomenda_id = id, motivo = encomenda.MotivoRejeicao }, cancellationToken);

        TempData["EncomendaRejeitada"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }

    [Authorize(Roles = "Admin")]
    // GET: vista de preparação com stock por paiol e entradas FIFO
    public async Task<IActionResult> Preparar(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var encomenda = await _context.Encomendas
            .AsNoTracking()
            .Include(e => e.Cliente)
            .Include(e => e.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.ACEITE)
        {
            TempData["Erro"] = "Apenas encomendas aceites podem ser preparadas.";
            return RedirectToAction(nameof(Details), new { id });
        }

        var user = await _userManager.GetUserAsync(User!);
        var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
        var idsPaióisComAcesso = await _context.PaiolAcessos
            .Where(a => rolesDoUtilizador.Contains(a.RoleName))
            .Select(a => a.PaiolId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var paióis = await _context.Paiol
            .AsNoTracking()
            .Where(p => idsPaióisComAcesso.Contains(p.Id))
            .OrderBy(p => p.Nome)
            .ToListAsync(cancellationToken);

        var entradasPorPaiolProduto = await _context.EntradasPaiol
            .AsNoTracking()
            .Where(e => idsPaióisComAcesso.Contains(e.PaiolId))
            .GroupBy(e => new { e.PaiolId, e.ProdutoId })
            .Select(g => new { g.Key.PaiolId, g.Key.ProdutoId, Total = g.Sum(e => e.Quantidade) })
            .ToListAsync(cancellationToken);
        var saidasPorPaiolProduto = await _context.SaidasPaiol
            .AsNoTracking()
            .Where(s => idsPaióisComAcesso.Contains(s.PaiolId))
            .GroupBy(s => new { s.PaiolId, s.ProdutoId })
            .Select(g => new { g.Key.PaiolId, g.Key.ProdutoId, Total = g.Sum(s => s.Quantidade) })
            .ToListAsync(cancellationToken);

        var stockPaiolProduto = new Dictionary<string, decimal>();
        foreach (var e in entradasPorPaiolProduto)
            stockPaiolProduto[$"{e.PaiolId}_{e.ProdutoId}"] = e.Total;
        foreach (var s in saidasPorPaiolProduto)
        {
            var key = $"{s.PaiolId}_{s.ProdutoId}";
            stockPaiolProduto[key] = stockPaiolProduto.GetValueOrDefault(key) - s.Total;
        }
        foreach (var k in stockPaiolProduto.Keys.ToList())
            if (stockPaiolProduto[k] < 0) stockPaiolProduto[k] = 0;

        var stockPorProduto = await _stockDisponivel.ObterStockDisponivelPorProdutoAsync(cancellationToken);
        ViewData["StockPorProduto"] = stockPorProduto;
        ViewData["Paiols"] = paióis;
        ViewData["StockPaiolProduto"] = stockPaiolProduto;
        return View(encomenda);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Grava retiradas via EncomendaService (FIFO) e marca encomenda como Em preparação
    public async Task<IActionResult> RegistarPreparacao(int id, List<RetiradaPreparacaoInput>? retiradas, CancellationToken cancellationToken = default)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.GetUserAsync(User!);
        var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
        var idsPaióisComAcesso = await _context.PaiolAcessos
            .Where(a => rolesDoUtilizador.Contains(a.RoleName))
            .Select(a => a.PaiolId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var (sucesso, erro) = await _encomendaService.RegistarPreparacaoAsync(
            id,
            userId,
            idsPaióisComAcesso,
            retiradas ?? new List<RetiradaPreparacaoInput>(),
            User?.Identity?.Name,
            cancellationToken);

        if (!sucesso)
        {
            TempData["Erro"] = erro ?? "Erro ao registar preparação.";
            return RedirectToAction(nameof(Preparar), new { id });
        }

        TempData["EncomendaPreparacao"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Marca encomenda como Concluída, remove reservas e regista no log
    public async Task<IActionResult> Concluir(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.FindAsync(id);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.EM_PREPARACAO)
        {
            TempData["Erro"] = "Apenas encomendas em preparação podem ser concluídas.";
            return RedirectToAction(nameof(Details), new { id });
        }

        encomenda.Estado = ConstantesEncomenda.CONCLUIDA;
        encomenda.DataConclusao = DateTime.UtcNow;
        var reservas = await _context.Reservas.Where(r => r.EncomendaId == id).ToListAsync(cancellationToken);
        _context.Reservas.RemoveRange(reservas);
        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_CONCLUIDA", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        TempData["EncomendaConcluida"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }
}
