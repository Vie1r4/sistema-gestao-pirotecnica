using Finalproj.Authorization;
using Finalproj.Application.Common.Validators;
using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Features.Encomendas.Interfaces;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Finalproj.Controllers;

// Encomendas: listagem por estado, detalhe, criar rascunho em sessão, aceitar/rejeitar, preparar (FIFO) e concluir.
[Route("api/encomendas")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class EncomendasController : ControllerBase
{
    private const string SessionKeyDraft = "EncomendaDraft";
    private readonly ILogSistemaService _logSistema;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IStockDisponivelService _stockDisponivel;
    private readonly IEncomendaService _encomendaService;
    private readonly IEncomendaWorkflowService _workflow;
    private readonly IValidator<EditEncomendaDto> _editEncomendaValidator;

    public EncomendasController(ILogSistemaService logSistema, UserManager<IdentityUser> userManager, IStockDisponivelService stockDisponivel, IEncomendaService encomendaService, IEncomendaWorkflowService workflow, IValidator<EditEncomendaDto> editEncomendaValidator)
    {
        _logSistema = logSistema;
        _userManager = userManager;
        _stockDisponivel = stockDisponivel;
        _encomendaService = encomendaService;
        _workflow = workflow;
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
        return await _workflow.GetDetailDtoAsync(id, cancellationToken);
    }

    // Lista encomendas com filtro por estado e paginação
    [HttpGet]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Index(string? estado, int pagina = 1, int itensPorPagina = 20, CancellationToken cancellationToken = default)
    {
        if (pagina < 1) pagina = 1;
        if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 20;

        return Ok(await _workflow.ListAsync(estado, pagina, itensPorPagina, cancellationToken));
    }

    // Detalhe da encomenda + stock actual por produto
    [HttpGet("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();

        var encomenda = await _workflow.GetDetailAsync(id.Value, cancellationToken);

        if (encomenda == null) return NotFound();

        var stockPorProduto = await _stockDisponivel.ObterStockDisponivelPorProdutoAsync(cancellationToken);

        var userIds = new List<string>();
        if (!string.IsNullOrEmpty(encomenda.FuncionarioAceiteUserId)) userIds.Add(encomenda.FuncionarioAceiteUserId);
        if (!string.IsNullOrEmpty(encomenda.FuncionarioPreparouUserId) && !userIds.Contains(encomenda.FuncionarioPreparouUserId)) userIds.Add(encomenda.FuncionarioPreparouUserId);
        var nomesPorUserId = new Dictionary<string, string>();
        if (userIds.Count > 0)
        {
            var users = _userManager.Users.Where(u => userIds.Contains(u.Id)).ToList();
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
        return Ok(await _workflow.GetCreateDataAsync(clienteId, cancellationToken));
    }

    [HttpPost("create")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Create([FromBody] EncomendaCriarViewModel model, CancellationToken cancellationToken = default)
    {
        if (!await _workflow.ClienteExistsAsync(model.ClienteId, cancellationToken))
            ModelState.AddModelError(nameof(model.ClienteId), "Selecione o cliente que fez a encomenda.");

        if (!ModelState.IsValid)
        {
            return BadRequest(new { model, data = await _workflow.GetCreateDataAsync(model.ClienteId, cancellationToken), errors = ModelState });
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
        if (!await _workflow.ClienteExistsAsync(clienteId, cancellationToken)) return NotFound();

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId)
        {
            draft = new EncomendaDraftViewModel { ClienteId = clienteId, Itens = new List<EncomendaItemCriarViewModel>() };
            SetDraft(draft);
        }

        return Ok(await _workflow.GetAdicionarItensDataAsync(clienteId, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, draft.Itens, cancellationToken));
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

        var produto = await _workflow.GetProdutoAsync(produtoId, cancellationToken);
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
        if (!await _workflow.ClienteExistsAsync(clienteId, cancellationToken))
        {
            ClearDraft();
            return BadRequest(new { error = "Cliente não encontrado." });
        }

        var draft = GetDraft();
        if (draft == null || draft.ClienteId != clienteId || draft.Itens.Count == 0)
        {
            return BadRequest(new { error = "Adicione pelo menos um produto à encomenda." });
        }

        var encomenda = await _workflow.SubmeterAsync(clienteId, input.DataEntrega, input.Observacoes, draft.Itens, cancellationToken);
        if (encomenda == null) return BadRequest(new { error = "Cliente não encontrado ou encomenda sem itens." });

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

        var (encomenda, erro) = await _workflow.UpdateAsync(id, input, cancellationToken);
        if (encomenda == null) return NotFound();
        if (erro != null) return BadRequest(new { error = erro });

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_EDITADA", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDto = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDto, encomendaEditada = true });
    }

    [HttpPost("{id:int}/aceitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Aceitar(int id, CancellationToken cancellationToken = default)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var (encomenda, erro) = await _workflow.AceitarAsync(id, userId, cancellationToken);
        if (encomenda == null) return NotFound();
        if (erro != null) return BadRequest(new { error = erro });

        await _logSistema.RegistarAsync("ENCOMENDA_ACEITE", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDto = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDto, encomendaAceite = true });
    }

    [HttpGet("{id:int}/rejeitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> RejeitarGet(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var encomenda = await _workflow.GetDetailAsync(id.Value, cancellationToken);
        if (encomenda == null) return NotFound();
        if (encomenda.Estado != ConstantesEncomenda.PENDENTE && encomenda.Estado != ConstantesEncomenda.ACEITE)
            return BadRequest(new { error = "Apenas encomendas pendentes ou aceites podem ser rejeitadas." });
        return Ok(EncomendaResponseDtoMapping.MapToDetail(encomenda));
    }

    [HttpPost("{id:int}/rejeitar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> Rejeitar(int id, [FromBody] RejeitarEncomendaDto? input, CancellationToken cancellationToken = default)
    {
        var motivoRejeicao = input?.MotivoRejeicao;
        var (encomenda, erro) = await _workflow.RejeitarAsync(id, motivoRejeicao, cancellationToken);
        if (encomenda == null) return NotFound();
        if (erro != null) return BadRequest(new { error = erro });

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
        var user = await _userManager.GetUserAsync(User!);
        var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
        var data = await _workflow.PrepararDataAsync(id.Value, rolesDoUtilizador, cancellationToken);
        if (data == null) return NotFound();
        return Ok(data);
    }

    [HttpPost("{id:int}/registar-preparacao")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirEncomendas)]
    public async Task<IActionResult> RegistarPreparacao(int id, [FromBody] List<RetiradaPreparacaoInput>? retiradas, CancellationToken cancellationToken = default)
    {
        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.GetUserAsync(User!);
        var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
        var idsPaióisComAcesso = await _workflow.GetPaiolIdsComAcessoAsync(rolesDoUtilizador, cancellationToken);

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
        var (encomenda, erro) = await _workflow.ConcluirAsync(id, cancellationToken);
        if (encomenda == null) return NotFound();
        if (erro != null) return BadRequest(new { error = erro });

        var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        await _logSistema.RegistarAsync("ENCOMENDA_CONCLUIDA", userId, User?.Identity?.Name, new { encomenda_id = id }, cancellationToken);

        var encomendaDtoConc = await LoadEncomendaDetailDtoAsync(id, cancellationToken);
        return Ok(new { encomenda = encomendaDtoConc, encomendaConcluida = true });
    }
}
