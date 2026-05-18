using System.Text;
using Finalproj.Authorization;
using Finalproj.Application.Common.Models;
using Finalproj.Application.Common.Validators;
using Finalproj.Application.Features.Funcionarios.DTOs;
using Finalproj.Application.Features.Funcionarios.Interfaces;
using Finalproj.Application.Features.Home.Interfaces;
using Finalproj.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Finalproj.Controllers
{
    // Funcionários: CRUD, documentos (CC, ADR, licença), associação a conta Identity; acesso por cargo
    [Route("api/funcionarios")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class FuncionariosController : ControllerBase
    {
        private readonly IFuncionarioApplicationService _funcionarios;
        private readonly IHomeAnalyticsService _homeAnalytics;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;
        private readonly IValidator<CreateFuncionarioInputDto> _createFuncionarioValidator;
        private const string PastaDocumentosFuncionarios = "Documentos/Funcionarios";
        private static readonly string[] RolesParaConta = ConstantesRoles.ParaContaFuncionario;

        private static string NormalizarCargo(string? cargo)
        {
            var c = (cargo ?? "").Trim();
            // Compatibilidade: cargo antigo "Técnico" foi renomeado para "Gestor"
            if (string.Equals(c, "Técnico", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(c, "Tecnico", StringComparison.OrdinalIgnoreCase))
                return ConstantesRoles.Gestor;
            return c;
        }

        public FuncionariosController(
            IFuncionarioApplicationService funcionarios,
            IHomeAnalyticsService homeAnalytics,
            IWebHostEnvironment env,
            UserManager<IdentityUser> userManager,
            IDocumentoStorageService documentoStorage,
            IEmailSender emailSender,
            IConfiguration configuration,
            IValidator<CreateFuncionarioInputDto> createFuncionarioValidator)
        {
            _funcionarios = funcionarios;
            _homeAnalytics = homeAnalytics;
            _env = env;
            _userManager = userManager;
            _documentoStorage = documentoStorage;
            _emailSender = emailSender;
            _configuration = configuration;
            _createFuncionarioValidator = createFuncionarioValidator;
        }

        // Lista com pesquisa e filtro por cargo (sem NSS, IBAN nem caminhos de ficheiros)
        [HttpGet]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> Index(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default)
        {
            var lista = await _funcionarios.SearchAsync(pesquisa, cargo, ordenar, cancellationToken);

            var userIdsComConta = lista.Where(f => !string.IsNullOrEmpty(f.UserId)).Select(f => f.UserId!).Distinct().ToList();
            var userIdsConfirmados = new HashSet<string>();
            foreach (var uid in userIdsComConta)
            {
                var user = await _userManager.FindByIdAsync(uid);
                if (user != null && user.EmailConfirmed)
                    userIdsConfirmados.Add(uid);
            }

            var items = lista.Select(f =>
            {
                bool? emailConf = null;
                if (!string.IsNullOrEmpty(f.UserId))
                    emailConf = userIdsConfirmados.Contains(f.UserId);
                return FuncionarioResponseDtoMapping.Map(f, includeSensitive: false, contaEmailConfirmada: emailConf);
            }).ToList();
            return Ok(new
            {
                items,
                pesquisa = pesquisa ?? string.Empty,
                cargo = cargo ?? string.Empty,
                ordenar = ordenar ?? "nome",
                cargos = DropdownSelectLists.CargosParaDropdown()
            });
        }

        // Detalhe do funcionário (sem NSS, IBAN nem caminhos de ficheiros)
        [HttpGet("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _funcionarios.GetByIdAsync(id.Value, includeDocumentos: true, cancellationToken);
            if (item == null)
                return NotFound();
            string? contaEmail = null;
            bool contaEmailConfirmada = false;
            if (!string.IsNullOrEmpty(item.UserId))
            {
                var user = await _userManager.FindByIdAsync(item.UserId);
                contaEmail = user?.Email ?? user?.UserName;
                contaEmailConfirmada = user != null && user.EmailConfirmed;
            }
            var currentUserId = _userManager.GetUserId(User);
            var associadoAoUtilizadorAtual = !string.IsNullOrEmpty(item.UserId) && item.UserId == currentUserId;
            bool? emailConfParaDto = string.IsNullOrEmpty(item.UserId) ? null : contaEmailConfirmada;
            return Ok(new
            {
                item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false, contaEmailConfirmada: emailConfParaDto),
                contaEmail,
                contaEmailConfirmada,
                associadoAoUtilizadorAtual
            });
        }

        // GET: formulário criar funcionário; dropdown cargo e roles para conta (sem paths)
        [HttpGet("create")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public IActionResult Create()
        {
            var cargos = DropdownSelectLists.CargosParaDropdown();
            var rolesConta = DropdownSelectLists.CargosParaDropdown();
            var funcionario = FuncionarioResponseDtoMapping.Map(new Funcionario(), includeSensitive: false);
            return Ok(new { funcionario, cargos, rolesConta });
        }

        [HttpPost]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // Grava funcionário, opcionalmente cria conta de acesso; CC/ADR/licença e documentos extras
        public async Task<IActionResult> Create([FromForm] CreateFuncionarioInputDto input, CancellationToken cancellationToken = default)
        {
            var funcionario = input.Funcionario;
            var criarConta = input.CriarConta;
            var contaEmail = input.ContaEmail;
            var contaPassword = input.ContaPassword;
            var contaConfirmPassword = input.ContaConfirmPassword;
            var contaRole = input.ContaRole;
            var documentosExtras = input.DocumentosExtras;

            funcionario.Cargo = NormalizarCargo(funcionario.Cargo);

            var validationResult = await _createFuncionarioValidator.ValidateAsync(input, cancellationToken);
            ModelState.AddValidationResult(validationResult);

            if (criarConta)
            {
                var email = (contaEmail ?? funcionario.Email ?? "").Trim();
                if (string.IsNullOrEmpty(email))
                    ModelState.AddModelError("ContaEmail", "O email é obrigatório para criar a conta de acesso.");
                else if (await _userManager.FindByEmailAsync(email) != null)
                    ModelState.AddModelError("ContaEmail", "Já existe uma conta com este email.");
                if (string.IsNullOrEmpty(contaPassword))
                    ModelState.AddModelError("ContaPassword", "A palavra-passe é obrigatória.");
                else if (contaPassword != contaConfirmPassword)
                    ModelState.AddModelError("ContaConfirmPassword", "A confirmação da palavra-passe não coincide.");
                var roleFromCargo = NormalizarCargo(funcionario.Cargo);
                if (string.IsNullOrEmpty(roleFromCargo) || !RolesParaConta.Contains(roleFromCargo))
                    ModelState.AddModelError("ContaRole", "O cargo do funcionário deve ser um perfil de acesso válido para a conta.");
                contaRole = roleFromCargo;
            }

            if (ModelState.IsValid)
            {
                await _funcionarios.CreateAsync(funcionario, null, cancellationToken);

                if (input.CartaoCidadaoFicheiro != null && _documentoStorage.ExtensaoPermitida(input.CartaoCidadaoFicheiro.FileName))
                {
                    funcionario.CartaoCidadaoCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, input.CartaoCidadaoFicheiro, "cc", cancellationToken);
                }
                if (input.DocumentoADDRFicheiro != null && _documentoStorage.ExtensaoPermitida(input.DocumentoADDRFicheiro.FileName))
                {
                    funcionario.DocumentoADDRCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, input.DocumentoADDRFicheiro, "addr", cancellationToken);
                }
                if (input.LicencaOperadorFicheiro != null && _documentoStorage.ExtensaoPermitida(input.LicencaOperadorFicheiro.FileName))
                {
                    funcionario.LicencaOperadorCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, input.LicencaOperadorFicheiro, "licenca", cancellationToken);
                }
                if (documentosExtras != null)
                {
                    var idx = 0;
                    foreach (var ext in documentosExtras)
                    {
                        if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                        {
                            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                            if (nome.Length > 100) nome = nome[..100];
                            var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, ext.Ficheiro, "extra_" + idx, cancellationToken);
                            await _funcionarios.AddDocumentosExtrasAsync(funcionario.Id, [new FuncionarioDocumentoExtra { FuncionarioId = funcionario.Id, Nome = nome, Caminho = caminho }], cancellationToken);
                            idx++;
                        }
                    }
                }
                if (criarConta)
                {
                    var email = (contaEmail ?? funcionario.Email ?? "").Trim();
                    var user = new IdentityUser { UserName = email, Email = email };
                    var createResult = await _userManager.CreateAsync(user, contaPassword!);
                    if (createResult.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, contaRole!);
                        funcionario.UserId = user.Id;
                        await _funcionarios.UpdateAsync(funcionario.Id, funcionario, cancellationToken: cancellationToken);
                        await _homeAnalytics.SavePerfilAsync(user.Id, funcionario.NomeCompleto, funcionario.Telefone, cancellationToken);
                        var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        var confirmCodeEncoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmCode));
                        var baseUrl = (_configuration["Frontend:BaseUrl"] ?? "").Trim();
                        if (string.IsNullOrWhiteSpace(baseUrl))
                            baseUrl = "http://localhost:3000";
                        baseUrl = baseUrl.TrimEnd('/');
                        var confirmUrl = $"{baseUrl}/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(confirmCodeEncoded)}";
                        await EnviarEmailContaCriadaAsync(email, funcionario.NomeCompleto, contaPassword!, confirmUrl, baseUrl);
                    }
                    else
                    {
                        foreach (var err in createResult.Errors)
                            ModelState.AddModelError("ContaPassword", err.Description);
                        return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(funcionario, includeSensitive: false), cargos = DropdownSelectLists.CargosParaDropdown(), rolesConta = DropdownSelectLists.CargosParaDropdown(), errors = ModelState });
                    }
                }

                var created = await _funcionarios.GetByIdAsync(funcionario.Id, includeDocumentos: true, cancellationToken);
                if (created == null) return NotFound();
                var body = new { funcionario = FuncionarioResponseDtoMapping.Map(created, includeSensitive: false), funcionarioCriado = true };
                return CreatedAtAction(nameof(Details), new { id = funcionario.Id }, body);
            }
            var dtoBadRequest = FuncionarioResponseDtoMapping.Map(funcionario, includeSensitive: false);
            return BadRequest(new { funcionario = dtoBadRequest, cargos = DropdownSelectLists.CargosParaDropdown(), rolesConta = DropdownSelectLists.CargosParaDropdown(), errors = ModelState });
        }

        [HttpGet("{id:int}/edit")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // GET: edição com dropdown cargo; secção Criar conta se não tiver UserId
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _funcionarios.GetByIdAsync(id.Value, includeDocumentos: true, cancellationToken);
            if (item == null)
                return NotFound();
            string? contaEmail = null;
            bool? contaEmailConfirmada = null;
            if (!string.IsNullOrEmpty(item.UserId))
            {
                var user = await _userManager.FindByIdAsync(item.UserId);
                contaEmail = user?.Email ?? user?.UserName;
                if (user != null) contaEmailConfirmada = user.EmailConfirmed;
            }
            var cargos = DropdownSelectLists.CargosParaDropdown();
            var rolesConta = DropdownSelectLists.CargosParaDropdown();
            return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: true, contaEmailConfirmada: contaEmailConfirmada), cargos, rolesConta, contaEmail, contaEmailConfirmada });
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // Actualiza ficha, documentos; opcionalmente cria conta (quando UserId é null)
        public async Task<IActionResult> Edit(int id, [FromForm] EditFuncionarioInputDto input, CancellationToken cancellationToken = default)
        {
            var funcionario = input.Funcionario;
            var criarConta = input.CriarConta;
            var contaEmail = input.ContaEmail;
            var contaPassword = input.ContaPassword;
            var contaConfirmPassword = input.ContaConfirmPassword;
            var contaRole = input.ContaRole;
            var documentosExtras = input.DocumentosExtras;
            var removerDocumentoExtraIds = input.RemoverDocumentoExtraIds;
            var removerOutrosAntigo = input.RemoverOutrosAntigo;
            var removerCartaoCidadao = input.RemoverCartaoCidadao;
            var removerDocumentoADDR = input.RemoverDocumentoADDR;
            var removerLicencaOperador = input.RemoverLicencaOperador;

            if (id != funcionario.Id)
                return NotFound();

            var existing = await _funcionarios.GetByIdAsync(id, includeDocumentos: true, cancellationToken);
            if (existing == null)
                return NotFound();

            existing.NomeCompleto = funcionario.NomeCompleto;
            existing.NIF = funcionario.NIF;
            existing.Email = funcionario.Email;
            existing.Telefone = funcionario.Telefone;
            existing.Morada = funcionario.Morada;
            existing.NumeroSegurancaSocial = funcionario.NumeroSegurancaSocial;
            existing.IBAN = funcionario.IBAN;
            existing.Cargo = NormalizarCargo(funcionario.Cargo);
            existing.Notas = funcionario.Notas;
            existing.UserId = funcionario.UserId;

            if (criarConta && string.IsNullOrEmpty(funcionario.UserId))
            {
                var email = (contaEmail ?? funcionario.Email ?? "").Trim();
                if (string.IsNullOrEmpty(email))
                    ModelState.AddModelError("ContaEmail", "O email é obrigatório para criar a conta de acesso.");
                else if (await _userManager.FindByEmailAsync(email) != null)
                    ModelState.AddModelError("ContaEmail", "Já existe uma conta com este email.");
                if (string.IsNullOrEmpty(contaPassword))
                    ModelState.AddModelError("ContaPassword", "A palavra-passe é obrigatória.");
                else if (contaPassword != contaConfirmPassword)
                    ModelState.AddModelError("ContaConfirmPassword", "A confirmação da palavra-passe não coincide.");
                var roleFromCargo = NormalizarCargo(existing.Cargo ?? funcionario.Cargo);
                if (string.IsNullOrEmpty(roleFromCargo) || !RolesParaConta.Contains(roleFromCargo))
                    ModelState.AddModelError("ContaRole", "O cargo do funcionário deve ser um perfil de acesso válido para a conta.");
                contaRole = roleFromCargo;
            }

            if (ModelState.IsValid)
            {
                try
                {
                    if (removerDocumentoExtraIds != null)
                        foreach (var docId in removerDocumentoExtraIds)
                            _documentoStorage.ApagarFicheiroSeExistir(await _funcionarios.GetDocumentoPathAsync(id, "extra", docId, cancellationToken));
                    if (removerOutrosAntigo && !string.IsNullOrEmpty(existing.OutrosCaminho))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.OutrosCaminho);
                        existing.OutrosCaminho = null;
                    }
                    else if (!string.IsNullOrEmpty(funcionario.OutrosCaminho))
                        existing.OutrosCaminho = funcionario.OutrosCaminho;

                    if (removerCartaoCidadao && !string.IsNullOrEmpty(existing.CartaoCidadaoCaminho))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.CartaoCidadaoCaminho);
                        existing.CartaoCidadaoCaminho = null;
                    }
                    else if (input.CartaoCidadaoFicheiro != null && _documentoStorage.ExtensaoPermitida(input.CartaoCidadaoFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.CartaoCidadaoCaminho);
                        var caminhoCc = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, existing.Id, input.CartaoCidadaoFicheiro, "cc", cancellationToken);
                        existing.CartaoCidadaoCaminho = caminhoCc;
                    }
                    else if (!string.IsNullOrEmpty(funcionario.CartaoCidadaoCaminho))
                        existing.CartaoCidadaoCaminho = funcionario.CartaoCidadaoCaminho;

                    if (removerDocumentoADDR && !string.IsNullOrEmpty(existing.DocumentoADDRCaminho))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.DocumentoADDRCaminho);
                        existing.DocumentoADDRCaminho = null;
                    }
                    else if (input.DocumentoADDRFicheiro != null && _documentoStorage.ExtensaoPermitida(input.DocumentoADDRFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.DocumentoADDRCaminho);
                        var caminhoAddr = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, existing.Id, input.DocumentoADDRFicheiro, "addr", cancellationToken);
                        existing.DocumentoADDRCaminho = caminhoAddr;
                    }
                    else if (!string.IsNullOrEmpty(funcionario.DocumentoADDRCaminho))
                        existing.DocumentoADDRCaminho = funcionario.DocumentoADDRCaminho;

                    if (removerLicencaOperador && !string.IsNullOrEmpty(existing.LicencaOperadorCaminho))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.LicencaOperadorCaminho);
                        existing.LicencaOperadorCaminho = null;
                    }
                    else if (input.LicencaOperadorFicheiro != null && _documentoStorage.ExtensaoPermitida(input.LicencaOperadorFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(existing.LicencaOperadorCaminho);
                        var caminhoLic = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, existing.Id, input.LicencaOperadorFicheiro, "licenca", cancellationToken);
                        existing.LicencaOperadorCaminho = caminhoLic;
                    }
                    else if (!string.IsNullOrEmpty(funcionario.LicencaOperadorCaminho))
                        existing.LicencaOperadorCaminho = funcionario.LicencaOperadorCaminho;

                    var novosDocs = new List<FuncionarioDocumentoExtra>();
                    if (documentosExtras != null)
                    {
                        var idx = 0;
                        foreach (var ext in documentosExtras)
                        {
                            if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                            {
                                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                                if (nome.Length > 100) nome = nome[..100];
                                var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, existing.Id, ext.Ficheiro, "extra_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                                novosDocs.Add(new FuncionarioDocumentoExtra { FuncionarioId = existing.Id, Nome = nome, Caminho = caminho });
                                idx++;
                            }
                        }
                    }

                    if (criarConta && string.IsNullOrEmpty(existing.UserId))
                    {
                        var email = (contaEmail ?? existing.Email ?? "").Trim();
                        var user = new IdentityUser { UserName = email, Email = email };
                        var createResult = await _userManager.CreateAsync(user, contaPassword!);
                        if (createResult.Succeeded)
                        {
                            await _userManager.AddToRoleAsync(user, contaRole!);
                            existing.UserId = user.Id;
                            await _homeAnalytics.SavePerfilAsync(user.Id, existing.NomeCompleto, existing.Telefone, cancellationToken);

                            var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                            var confirmCodeEncoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmCode));
                            var baseUrl = (_configuration["Frontend:BaseUrl"] ?? "").Trim();
                            if (string.IsNullOrWhiteSpace(baseUrl))
                                baseUrl = "http://localhost:3000";
                            baseUrl = baseUrl.TrimEnd('/');
                            var confirmUrl = $"{baseUrl}/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(confirmCodeEncoded)}";
                            await EnviarEmailContaCriadaAsync(email, existing.NomeCompleto, contaPassword!, confirmUrl, baseUrl);
                        }
                        else
                        {
                            foreach (var err in createResult.Errors)
                                ModelState.AddModelError("ContaPassword", err.Description);
                            return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(existing, includeSensitive: true), cargos = DropdownSelectLists.CargosParaDropdown(), rolesConta = DropdownSelectLists.CargosParaDropdown(), errors = ModelState });
                        }
                    }

                    var updated = await _funcionarios.UpdateAsync(id, existing, novosDocs, removerDocumentoExtraIds, cancellationToken);
                    if (updated == null)
                        return NotFound();
                    return Ok(new { funcionario = FuncionarioResponseDtoMapping.Map(updated, includeSensitive: false), funcionarioEditado = true });
                }
                catch (InvalidOperationException)
                {
                    throw;
                }
            }
            return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(existing, includeSensitive: true), cargos = DropdownSelectLists.CargosParaDropdown(), rolesConta = DropdownSelectLists.CargosParaDropdown(), errors = ModelState });
        }

        [HttpGet("{id:int}/delete")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // GET: confirmação antes de apagar (conta Identity não é apagada)
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _funcionarios.GetByIdAsync(id.Value, false, cancellationToken);
            if (item == null)
                return NotFound();
            return Ok(FuncionarioResponseDtoMapping.Map(item, includeSensitive: false));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // Apaga ficha, pasta de documentos e conta Identity associada (se não for a conta do utilizador atual)
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var item = await _funcionarios.GetByIdAsync(id, false, cancellationToken);
            if (item != null)
            {
                var currentUserId = _userManager.GetUserId(User);
                if (!string.IsNullOrEmpty(item.UserId) && item.UserId != currentUserId)
                {
                    var user = await _userManager.FindByIdAsync(item.UserId);
                    if (user != null)
                    {
                        await _funcionarios.DesassociarUserIdAsync(item.UserId, false, cancellationToken);
                        await _userManager.DeleteAsync(user);
                    }
                }
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosFuncionarios, id.ToString()));
                await _funcionarios.DeleteAsync(id, cancellationToken);
            }
            return NoContent();
        }

        [HttpGet("{id:int}/desassociar")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> DesassociarConta(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var item = await _funcionarios.GetByIdAsync(id.Value, false, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId)) return NotFound();
            return Ok(FuncionarioResponseDtoMapping.Map(item, includeSensitive: false));
        }

        [HttpPost("{id:int}/desassociar")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> DesassociarContaConfirmar(int id, CancellationToken cancellationToken = default)
        {
            var item = await _funcionarios.GetByIdAsync(id, false, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId))
                return NotFound();
            var userId = item.UserId;
            var currentUserId = _userManager.GetUserId(User);
            if (currentUserId == userId)
                return BadRequest(new { error = "Não pode desassociar a sua própria conta." });
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                await _funcionarios.DesassociarContaAsync(id, cancellationToken);
                return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false), contaDesassociada = true });
            }
            await _funcionarios.DesassociarUserIdAsync(userId, true, cancellationToken);
            var result = await _userManager.DeleteAsync(user);
            var message = result.Succeeded ? null : "Não foi possível remover a conta. A ficha foi desassociada.";
            return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false), contaDesassociada = true, aviso = message });
        }

        // Devolve documento (CC, ADR, licença, outros ou extra por id) inline. Admin/Gestor podem ver qualquer; outros apenas os seus.
        [HttpGet("{id:int}/documentos")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> Download(int id, string tipo, int? extraId = null, CancellationToken cancellationToken = default)
        {
            var funcionario = await _funcionarios.GetByIdAsync(id, false, cancellationToken);
            if (funcionario == null)
                return NotFound();
            var currentUserId = _userManager.GetUserId(User);
            if (!User.IsInRole(ConstantesRoles.Admin) && !User.IsInRole(ConstantesRoles.Gestor) && funcionario.UserId != currentUserId)
                return Forbid();

            string? caminhoRelativo = await _funcionarios.GetDocumentoPathAsync(id, tipo, extraId, cancellationToken);
            if (string.IsNullOrEmpty(caminhoRelativo))
                return NotFound();
            return ServirFicheiro(caminhoRelativo);
        }

        // Envia ficheiro do disco com Content-Type e nome para inline
        private IActionResult ServirFicheiro(string caminhoRelativo)
        {
            var caminhoFisico = Path.Combine(_env.WebRootPath, caminhoRelativo);
            if (!System.IO.File.Exists(caminhoFisico))
                return NotFound();
            var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
            var contentType = ext switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
            var nomeFicheiro = Path.GetFileName(caminhoRelativo);
            Response.Headers["Content-Disposition"] = "inline; filename=\"" + nomeFicheiro.Replace("\"", "\\\"") + "\"";
            return PhysicalFile(caminhoFisico, contentType);
        }

        private async Task EnviarEmailContaCriadaAsync(
            string email,
            string nomeFuncionario,
            string password,
            string? confirmarEmailUrl = null,
            string? frontendBaseUrl = null)
        {
            var assunto = "Conta de acesso criada – confirme o seu email";
            var baseUrl = (frontendBaseUrl ?? "").Trim().TrimEnd('/');
            if (string.IsNullOrWhiteSpace(baseUrl))
                baseUrl = "http://localhost:3000";
            var loginUrl = $"{baseUrl}/login";

            var safeNome = System.Net.WebUtility.HtmlEncode(nomeFuncionario);
            var safeEmail = System.Net.WebUtility.HtmlEncode(email);
            var safePassword = System.Net.WebUtility.HtmlEncode(password);
            var safeLoginUrl = System.Net.WebUtility.HtmlEncode(loginUrl);
            var safeConfirmUrl = string.IsNullOrWhiteSpace(confirmarEmailUrl)
                ? ""
                : System.Net.WebUtility.HtmlEncode(confirmarEmailUrl);

            var corpo =
                $"""
                <!doctype html>
                <html lang="pt">
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="color-scheme" content="light dark" />
                    <meta name="supported-color-schemes" content="light dark" />
                    <title>PIROFAFE — Conta criada</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f8f7f5;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:28px 14px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                            <tr>
                              <td style="padding:0 0 14px 0;text-align:center;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-weight:800; letter-spacing:-0.02em; font-size:18px; color:#ea580c;">
                                  PIROFAFE
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:22px 22px 18px 22px;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:22px; line-height:1.25; font-weight:800; letter-spacing:-0.02em; color:#111827;">
                                  Conta de acesso criada
                                </div>
                                <div style="height:10px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                                  Olá {safeNome}, foi criada uma conta de acesso para si.
                                </div>
                                <div style="height:14px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                                  <strong>Email:</strong> {safeEmail}<br/>
                                  <strong>Palavra-passe:</strong> {safePassword}
                                </div>
                                <div style="height:18px;"></div>
                                {(string.IsNullOrWhiteSpace(confirmarEmailUrl) ? "" : $"""
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                                  <strong>Confirme o seu email</strong> para ativar a conta.
                                </div>
                                <div style="height:12px;"></div>
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="background:#f97316;border-radius:14px;">
                                      <a href="{confirmarEmailUrl}" style="display:inline-block;padding:12px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; font-weight:700; color:#111827; text-decoration:none;">
                                        Confirmar email e ativar conta
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                <div style="height:12px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Se o botão não funcionar, copie e cole este link no browser:<br />
                                  <a href="{confirmarEmailUrl}" style="color:#ea580c;text-decoration:underline;word-break:break-all;">{safeConfirmUrl}</a>
                                </div>
                                <div style="height:16px;"></div>
                                """ )}
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Depois pode iniciar sessão em: <a href="{loginUrl}" style="color:#ea580c;text-decoration:underline;">{safeLoginUrl}</a>
                                </div>
                                <div style="height:14px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Recomendamos que altere a palavra-passe após o primeiro login.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """;
            try
            {
                await _emailSender.SendEmailAsync(email, assunto, corpo);
            }
            catch
            {
                // Não falhar a criação da conta se o email falhar (ex.: SMTP não configurado)
            }
        }

    }
}
