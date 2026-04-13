using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Finalproj.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Finalproj.Controllers;

// Encomendas: listagem por estado, detalhe, criar rascunho em sessão, aceitar/rejeitar, preparar (FIFO) e concluir.
[Route("api/encomendas")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class EncomendasController : ControllerBase
{
    private const string SessionKeyDraft = "EncomendaDraft";
    private readonly FinalprojContext _context;
    private readonly ILogSistemaService _logSistema;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IStockDisponivelService _stockDisponivel;
    private readonly IEncomendaService _encomendaService;
    private readonly IValidator<EditEncomendaDto> _editEncomendaValidator;

    public EncomendasController(FinalprojContext context, ILogSistemaService logSistema, UserManager<IdentityUser> userManager, IStockDisponivelService stockDisponivel, IEncomendaService encomendaService, IValidator<EditEncomendaDto> editEncomendaValidator)
    {
        _context = context;
        _logSistema = logSistema;
        _userManager = userManager;
        _stockDisponivel = stockDisponivel;
        _encomendaService = encomendaService;
        _editEncomendaValidator = editEncomendaValidator;
    }

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

    private void SetDraft(EncomendaDraftViewModel draft)
    {
        HttpContext.Session.SetString(SessionKeyDraft, JsonSerializer.Serialize(draft));
    }

    private void ClearDraft()
    {
        HttpContext.Session.Remove(SessionKeyDraft);
    }

    private async Task<EncomendaDetailResponseDto?> LoadEncomendaDetailDtoAsync(int id, CancellationToken cancellationToken = default)
    {
        var e = await _context.Encomendas
            .AsNoTracking()
            .Include(x => x.Cliente)
            .Include(x => x.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return e == null ? null : EncomendaResponseDtoMapping.MapToDetail(e);
    }

    // Lista encomendas com filtro por estado e paginação
    [HttpGet]
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
        var items = lista.Select(EncomendaResponseDtoMapping.MapToList).ToList();

        var totaisPorEstado = await _context.Encomendas
            .AsNoTracking()
            .GroupBy(e => e.Estado)
            .Select(g => new { Estado = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.Estado, x => x.Total, cancellationToken);
        var totalGeral = totaisPorEstado.Values.Sum();

        return Ok(new
        {
            items,
            estado = estado ?? string.Empty,
            estadosParaFiltro = ConstantesEncomenda.TodosEstados,
            totaisPorEstado,
            totalGeral,
            paginaAtual = pagina,
            itensPorPagina,
            totalRegistos
        });
    }

    // Detalhe da encomenda + stock actual por produto
    [HttpGet("{id:int}")]
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
        var funcionarioAceiteNome = !string.IsNullOrEmpty(encomenda.FuncionarioAceiteUserId) ? (nomesPorUserId.GetValueOrDefault(encomenda.FuncionarioAceiteUserId) ?? encomenda.FuncionarioAceiteUserId) : null;
        var funcionarioPreparouNome = !string.IsNullOrEmpty(encomenda.FuncionarioPreparouUserId) ? (nomesPorUserId.GetValueOrDefault(encomenda.FuncionarioPreparouUserId) ?? encomenda.FuncionarioPreparouUserId) : null;

        var encomendaDto = EncomendaResponseDtoMapping.MapToDetail(encomenda);
        return Ok(new
        {
            encomenda = encomendaDto,
            stockPorProduto,
            funcionarioAceiteNome,
            funcionarioPreparouNome
        });
    }

    [HttpGet("create")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Create(int? clienteId, CancellationToken cancellationToken = default)
    {
        var clientesEnt = await _context.Clientes.AsNoTracking().OrderBy(c => c.Nome).ToListAsync(cancellationToken);
        var clientes = clientesEnt.Select(c => new EncomendaClienteResumoDto { Id = c.Id, Nome = c.Nome }).ToList();
        return Ok(new
        {
            clientes,
            model = new EncomendaCriarViewModel { ClienteId = clienteId ?? 0 }
        });
    }

    [HttpPost("create")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Create([FromBody] EncomendaCriarViewModel model, CancellationToken cancellationToken = default)
    {
        var cliente = await _context.Clientes.FindAsync(model.ClienteId);
        if (cliente == null)
            ModelState.AddModelError(nameof(model.ClienteId), "Selecione o cliente que fez a encomenda.");

        if (!ModelState.IsValid)
        {
            var clientesEnt = await _context.Clientes.OrderBy(c => c.Nome).ToListAsync(cancellationToken);
            var clientes = clientesEnt.Select(c => new EncomendaClienteResumoDto { Id = c.Id, Nome = c.Nome }).ToList();
            return BadRequest(new { model, clientes, errors = ModelState });
        }

        return Ok(new { nextStep = "AdicionarItens", clienteId = model.ClienteId });
    }

    [HttpGet("adicionar-itens")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
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

        var produtosFiltradosEnt = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);
        var produtosFiltrados = produtosFiltradosEnt.Select(ProdutoResponseDtoMapping.Map).ToList();
        var clienteResumo = cliente != null ? new EncomendaClienteResumoDto { Id = cliente.Id, Nome = cliente.Nome } : null;

        return Ok(new
        {
            cliente = clienteResumo,
            clienteId,
            pesquisa = pesquisa ?? string.Empty,
            classificacao = classificacao ?? string.Empty,
            grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
            filtroTecnico = filtroTecnico ?? string.Empty,
            calibre = calibre ?? string.Empty,
            produtosFiltrados,
            itensRascunho = draft.Itens,
            model = new EncomendaCriarViewModel { ClienteId = clienteId, Itens = draft.Itens }
        });
    }

    [HttpPost("adicionar-item")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
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
            return BadRequest(new { error = "A quantidade deve ser positiva." });

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId)
            draft = new EncomendaDraftViewModel { ClienteId = clienteId, Itens = new List<EncomendaItemCriarViewModel>() };

        var produto = await _context.Produtos.FindAsync(produtoId);
        if (produto == null)
            return NotFound();

        var existente = draft.Itens.FirstOrDefault(i => i.ProdutoId == produtoId);
        if (existente != null)
            existente.Quantidade += quantidade;
        else
            draft.Itens.Add(new EncomendaItemCriarViewModel { ProdutoId = produtoId, ProdutoNome = produto.Nome, Quantidade = quantidade });

        SetDraft(draft);
        return Ok(new { draft, message = $"{produto.Nome} ({quantidade}) adicionado à encomenda." });
    }

    [HttpPost("remover-item")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public IActionResult RemoverItem(int clienteId, int produtoId, string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre)
    {
        var draft = GetDraft();
        if (draft != null && draft.ClienteId == clienteId)
        {
            draft.Itens.RemoveAll(i => i.ProdutoId == produtoId);
            SetDraft(draft);
        }
        return Ok(new { draft });
    }

    [HttpPost("submeter")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    // Cria encomenda e reservas a partir do rascunho; estado Pendente
    public async Task<IActionResult> SubmeterEncomenda([FromBody] SubmeterEncomendaDto input, CancellationToken cancellationToken = default)
    {
        var clienteId = input.ClienteId;
        var cliente = await _context.Clientes.FindAsync(clienteId);
        if (cliente == null)
        {
            ClearDraft();
            return BadRequest(new { error = "Cliente não encontrado." });
        }

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId || draft.Itens.Count == 0)
        {
            return BadRequest(new { error = "Adicione pelo menos um produto à encomenda." });
        }

        var encomenda = new Encomenda
        {
            ClienteId = clienteId,
            Estado = ConstantesEncomenda.PENDENTE,
            DataCriacao = DateTime.UtcNow,
            DataEntrega = input.DataEntrega,
            Observacoes = string.IsNullOrWhiteSpace(input.Observacoes) ? null : input.Observacoes.Trim().Length > 2000 ? input.Observacoes.Trim()[..2000] : input.Observacoes.Trim()
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
        var encomendaDto = await LoadEncomendaDetailDtoAsync(encomenda.Id, cancellationToken);
        return CreatedAtAction(nameof(Details), new { id = encomenda.Id }, new { encomenda = encomendaDto, encomendaCriada = true });
    }

    /// <summary>
    /// Atualiza encomenda (data entrega, observações e itens). Apenas quando estado é Pendente ou Aceite.
    /// Atualiza reservas para refletir as novas quantidades por produto.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Update(int id, [FromBody] EditEncomendaDto input, CancellationToken cancellationToken = default)
    {
        var validationResult = await _editEncomendaValidator.ValidateAsync(input, cancellationToken);
        ModelState.AddValidationResult(validationResult);
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Dados inválidos.", errors = ModelState });

        var encomenda = await _context.Encomendas
            .Include(e => e.Itens)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (encomenda == null) return NotFound();

        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
            return BadRequest(new { error = "Apenas encomendas Pendente ou Aceite podem ser editadas." });

        if (input.Itens == null || input.Itens.Count == 0)
            return BadRequest(new { error = "A encomenda tem de ter pelo menos um item com quantidade positiva." });

        // Validar produtos existem e quantidades
        foreach (var item in input.Itens)
        {
            if (item.Quantidade < 0.0001m)
                return BadRequest(new { error = "A quantidade deve ser positiva." });
            var produto = await _context.Produtos.FindAsync(item.ProdutoId);
            if (produto == null)
                return BadRequest(new { error = $"Produto com id {item.ProdutoId} não encontrado." });
        }

        // Atualizar dados da encomenda
        encomenda.DataEntrega = input.DataEntrega;
        encomenda.Observacoes = string.IsNullOrWhiteSpace(input.Observacoes)
            ? null
            : input.Observacoes.Trim().Length > 2000 ? input.Observacoes.Trim()[..2000] : input.Observacoes.Trim();

        // Remover itens e reservas antigos
        var reservas = await _context.Reservas.Where(r => r.EncomendaId == id).ToListAsync(cancellationToken);
        _context.Reservas.RemoveRange(reservas);
        _context.EncomendaItems.RemoveRange(encomenda.Itens);

        // Adicionar novos itens e reservas
        foreach (var item in input.Itens)
        {
            _context.EncomendaItems.Add(new EncomendaItem
            {
                EncomendaId = id,
                ProdutoId = item.ProdutoId,
                QuantidadePedida = item.Quantidade
            });
            _context.Reservas.Add(new Reserva
            {
                EncomendaId = id,
                ProdutoId = item.ProdutoId,
                Quantidade = item.Quantidade
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_EDITADA", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDto = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDto, encomendaEditada = true });
    }

    [HttpPost("{id:int}/aceitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Aceitar(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.FindAsync(id);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE)
            return BadRequest(new { error = "Apenas encomendas pendentes podem ser aceites." });

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        encomenda.Estado = ConstantesEncomenda.ACEITE;
        encomenda.FuncionarioAceiteUserId = userId;
        await _context.SaveChangesAsync(cancellationToken);

        await _logSistema.RegistarAsync("ENCOMENDA_ACEITE", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDto = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDto, encomendaAceite = true });
    }

    [HttpGet("{id:int}/rejeitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> RejeitarGet(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var encomenda = await _context.Encomendas.AsNoTracking().Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
            return BadRequest(new { error = "Apenas encomendas pendentes ou aceites podem ser rejeitadas." });
        return Ok(EncomendaResponseDtoMapping.MapToDetail(encomenda));
    }

    [HttpPost("{id:int}/rejeitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Rejeitar(int id, [FromBody] RejeitarEncomendaDto? input, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.Include(e => e.Itens).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
            return BadRequest(new { error = "Apenas encomendas pendentes ou aceites podem ser rejeitadas." });

        var motivoRejeicao = input?.MotivoRejeicao;
        encomenda.Estado = ConstantesEncomenda.REJEITADA;
        encomenda.MotivoRejeicao = string.IsNullOrWhiteSpace(motivoRejeicao) ? null : motivoRejeicao.Trim();
        var reservas = await _context.Reservas.Where(r => r.EncomendaId == id).ToListAsync(cancellationToken);
        _context.Reservas.RemoveRange(reservas);
        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_REJEITADA", userId, User?.Identity?.Name, new { encomenda_id = id, motivo = encomenda.MotivoRejeicao }, cancellationToken);

        var encomendaDtoRej = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDtoRej, encomendaRejeitada = true });
    }

    [HttpGet("{id:int}/preparar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
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
            return BadRequest(new { error = "Apenas encomendas aceites podem ser preparadas." });

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

        var encomendaDto = EncomendaResponseDtoMapping.MapToDetail(encomenda);
        var paióisDto = paióis.Select(PaiolResponseDtoMapping.Map).ToList();

        return Ok(new
        {
            encomenda = encomendaDto,
            stockPorProduto,
            paióis = paióisDto,
            stockPaiolProduto
        });
    }

    [HttpPost("{id:int}/registar-preparacao")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> RegistarPreparacao(int id, [FromBody] List<RetiradaPreparacaoInput>? retiradas, CancellationToken cancellationToken = default)
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
            return BadRequest(new { error = erro ?? "Erro ao registar preparação." });

        return Ok(new { encomendaPreparacao = true });
    }

    [HttpPost("{id:int}/concluir")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Concluir(int id, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.FindAsync(id);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.EM_PREPARACAO)
            return BadRequest(new { error = "Apenas encomendas em preparação podem ser concluídas." });

        encomenda.Estado = ConstantesEncomenda.CONCLUIDA;
        encomenda.DataConclusao = DateTime.UtcNow;
        var reservas = await _context.Reservas.Where(r => r.EncomendaId == id).ToListAsync(cancellationToken);
        _context.Reservas.RemoveRange(reservas);
        await _context.SaveChangesAsync(cancellationToken);

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_CONCLUIDA", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDtoConc = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDtoConc, encomendaConcluida = true });
    }
}
