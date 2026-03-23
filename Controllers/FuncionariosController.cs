using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Finalproj.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Finalproj.Controllers
{
    // Funcionários: CRUD, documentos (CC, ADR, licença), associação a conta Identity; acesso por cargo
    [Route("api/funcionarios")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class FuncionariosController : ControllerBase
    {
        private readonly FinalprojContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IEmailSender _emailSender;
        private readonly IValidator<CreateFuncionarioInputDto> _createFuncionarioValidator;
        private const string PastaDocumentosFuncionarios = "Documentos/Funcionarios";
        private static readonly string[] RolesParaConta = ConstantesRoles.ParaContaFuncionario;

        public FuncionariosController(FinalprojContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager, IDocumentoStorageService documentoStorage, IEmailSender emailSender, IValidator<CreateFuncionarioInputDto> createFuncionarioValidator)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
            _documentoStorage = documentoStorage;
            _emailSender = emailSender;
            _createFuncionarioValidator = createFuncionarioValidator;
        }

        // Lista com pesquisa e filtro por cargo (sem NSS, IBAN nem caminhos de ficheiros)
        [HttpGet]
        public async Task<IActionResult> Index(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default)
        {
            var query = _context.Funcionarios.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(pesquisa))
            {
                var termo = pesquisa.Trim();
                query = query.Where(f =>
                    f.NomeCompleto.Contains(termo) ||
                    (f.Email != null && f.Email.Contains(termo)) ||
                    (f.Telefone != null && f.Telefone.Contains(termo)) ||
                    (f.NIF != null && f.NIF.Contains(termo)));
            }

            if (!string.IsNullOrEmpty(cargo))
                query = query.Where(f => f.Cargo == cargo);

            query = (ordenar ?? "nome") switch
            {
                "email" => query.OrderBy(f => f.Email ?? ""),
                "recentes" => query.OrderByDescending(f => f.DataRegisto ?? DateTime.MinValue),
                _ => query.OrderBy(f => f.NomeCompleto)
            };

            var lista = await query.ToListAsync(cancellationToken);

            var userIdsComConta = lista.Where(f => !string.IsNullOrEmpty(f.UserId)).Select(f => f.UserId!).Distinct().ToList();
            var userIdsConfirmados = new HashSet<string>();
            foreach (var uid in userIdsComConta)
            {
                var user = await _userManager.FindByIdAsync(uid);
                if (user != null && user.EmailConfirmed)
                    userIdsConfirmados.Add(uid);
            }

            var items = lista.Select(f => FuncionarioResponseDtoMapping.Map(f, includeSensitive: false)).ToList();
            return Ok(new
            {
                items,
                pesquisa = pesquisa ?? string.Empty,
                cargo = cargo ?? string.Empty,
                ordenar = ordenar ?? "nome",
                cargos = ConstantesFuncionariosClientes.CargosParaDropdown(),
                userIdsConfirmados = userIdsConfirmados.ToList()
            });
        }

        // Detalhe do funcionário (sem NSS, IBAN nem caminhos de ficheiros)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().Include(f => f.DocumentosExtras).FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
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
            return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false), contaEmail, contaEmailConfirmada });
        }

        // GET: formulário criar funcionário; dropdown cargo e roles para conta (sem paths)
        [HttpGet("create")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public IActionResult Create()
        {
            var cargos = ConstantesFuncionariosClientes.CargosParaDropdown();
            var rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown();
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
                if (string.IsNullOrEmpty(contaRole) || !RolesParaConta.Contains(contaRole))
                    ModelState.AddModelError("ContaRole", "Selecione um perfil de acesso.");
            }

            if (ModelState.IsValid)
            {
                funcionario.DataRegisto = DateTime.UtcNow;
                _context.Funcionarios.Add(funcionario);
                await _context.SaveChangesAsync(cancellationToken);

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
                            _context.FuncionarioDocumentoExtras.Add(new FuncionarioDocumentoExtra
                            {
                                FuncionarioId = funcionario.Id,
                                Nome = nome,
                                Caminho = caminho
                            });
                            idx++;
                        }
                    }
                }
                await _context.SaveChangesAsync(cancellationToken);

                if (criarConta)
                {
                    var email = (contaEmail ?? funcionario.Email ?? "").Trim();
                    var user = new IdentityUser { UserName = email, Email = email };
                    var createResult = await _userManager.CreateAsync(user, contaPassword!);
                    if (createResult.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, contaRole!);
                        funcionario.UserId = user.Id;
                        _context.Perfis.Add(new Perfil
                        {
                            UserId = user.Id,
                            Nome = funcionario.NomeCompleto,
                            Telefone = funcionario.Telefone,
                            DataRegisto = DateTime.UtcNow
                        });
                        await _context.SaveChangesAsync(cancellationToken);
                        var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        var confirmUrl = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(confirmCode)}";
                        await EnviarEmailContaCriadaAsync(email, funcionario.NomeCompleto, contaPassword!, confirmUrl);
                    }
                    else
                    {
                        foreach (var err in createResult.Errors)
                            ModelState.AddModelError("ContaPassword", err.Description);
                        return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(funcionario, includeSensitive: false), cargos = ConstantesFuncionariosClientes.CargosParaDropdown(), rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown(), errors = ModelState });
                    }
                }

                var created = await _context.Funcionarios.AsNoTracking().Include(f => f.DocumentosExtras).FirstAsync(f => f.Id == funcionario.Id, cancellationToken);
                var body = new { funcionario = FuncionarioResponseDtoMapping.Map(created, includeSensitive: false), funcionarioCriado = true };
                return CreatedAtAction(nameof(Details), new { id = funcionario.Id }, body);
            }
            var dtoBadRequest = FuncionarioResponseDtoMapping.Map(funcionario, includeSensitive: false);
            return BadRequest(new { funcionario = dtoBadRequest, cargos = ConstantesFuncionariosClientes.CargosParaDropdown(), rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown(), errors = ModelState });
        }

        [HttpGet("{id:int}/edit")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // GET: edição com dropdown cargo; secção Criar conta se não tiver UserId
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            string? contaEmail = null;
            if (!string.IsNullOrEmpty(item.UserId))
            {
                var user = await _userManager.FindByIdAsync(item.UserId);
                contaEmail = user?.Email ?? user?.UserName;
            }
            var cargos = ConstantesFuncionariosClientes.CargosParaDropdown();
            var rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown();
            return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: true), cargos, rolesConta, contaEmail });
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // Actualiza ficha, documentos; opcionalmente cria conta (quando UserId é null)
        public async Task<IActionResult> Edit(int id, [FromForm] EditFuncionarioInputDto input, CancellationToken cancellationToken = default)
        {
            Console.WriteLine("EDIT PUT CHAMADO, id: " + id);
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

            // Logs para verificar se os ficheiros estão a chegar
            Console.WriteLine($"CartaoCidadaoFicheiro: {input.CartaoCidadaoFicheiro?.FileName ?? "null"}");
            Console.WriteLine($"DocumentoADDRFicheiro: {input.DocumentoADDRFicheiro?.FileName ?? "null"}");
            Console.WriteLine($"LicencaOperadorFicheiro: {input.LicencaOperadorFicheiro?.FileName ?? "null"}");

            if (id != funcionario.Id)
                return NotFound();

            var existing = await _context.Funcionarios.Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (existing == null)
                return NotFound();

            existing.NomeCompleto = funcionario.NomeCompleto;
            existing.NIF = funcionario.NIF;
            existing.Email = funcionario.Email;
            existing.Telefone = funcionario.Telefone;
            existing.Morada = funcionario.Morada;
            existing.NumeroSegurancaSocial = funcionario.NumeroSegurancaSocial;
            existing.IBAN = funcionario.IBAN;
            existing.Cargo = funcionario.Cargo;
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
                if (string.IsNullOrEmpty(contaRole) || !RolesParaConta.Contains(contaRole))
                    ModelState.AddModelError("ContaRole", "Selecione um perfil de acesso.");
            }

            if (ModelState.IsValid)
            {
                try
                {
                    if (removerDocumentoExtraIds != null && removerDocumentoExtraIds.Count > 0)
                    {
                        var aRemover = await _context.FuncionarioDocumentoExtras
                            .Where(e => e.FuncionarioId == id && removerDocumentoExtraIds.Contains(e.Id))
                            .ToListAsync(cancellationToken);
                        foreach (var e in aRemover)
                        {
                            _documentoStorage.ApagarFicheiroSeExistir(e.Caminho);
                            _context.FuncionarioDocumentoExtras.Remove(e);
                        }
                    }
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
                        Console.WriteLine($"[IDocumentoStorageService] CartaoCidadao guardado: {caminhoCc}");
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
                        Console.WriteLine($"[IDocumentoStorageService] DocumentoADDR guardado: {caminhoAddr}");
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
                        Console.WriteLine($"[IDocumentoStorageService] LicencaOperador guardado: {caminhoLic}");
                        existing.LicencaOperadorCaminho = caminhoLic;
                    }
                    else if (!string.IsNullOrEmpty(funcionario.LicencaOperadorCaminho))
                        existing.LicencaOperadorCaminho = funcionario.LicencaOperadorCaminho;

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
                                _context.FuncionarioDocumentoExtras.Add(new FuncionarioDocumentoExtra
                                {
                                    FuncionarioId = existing.Id,
                                    Nome = nome,
                                    Caminho = caminho
                                });
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
                            _context.Perfis.Add(new Perfil
                            {
                                UserId = user.Id,
                                Nome = existing.NomeCompleto,
                                Telefone = existing.Telefone,
                                DataRegisto = DateTime.UtcNow
                            });
                            var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                            var confirmUrl = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(confirmCode)}";
                            await EnviarEmailContaCriadaAsync(email, existing.NomeCompleto, contaPassword!, confirmUrl);
                        }
                        else
                        {
                            foreach (var err in createResult.Errors)
                                ModelState.AddModelError("ContaPassword", err.Description);
                            return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(existing, includeSensitive: true), cargos = ConstantesFuncionariosClientes.CargosParaDropdown(), rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown(), errors = ModelState });
                        }
                    }

                    await _context.SaveChangesAsync(cancellationToken);
                    return Ok(new { funcionario = FuncionarioResponseDtoMapping.Map(existing, includeSensitive: false), funcionarioEditado = true });
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Funcionarios.AnyAsync(e => e.Id == id, cancellationToken))
                        return NotFound();
                    throw;
                }
            }
            return BadRequest(new { funcionario = FuncionarioResponseDtoMapping.Map(existing, includeSensitive: true), cargos = ConstantesFuncionariosClientes.CargosParaDropdown(), rolesConta = ConstantesFuncionariosClientes.CargosParaDropdown(), errors = ModelState });
        }

        [HttpGet("{id:int}/delete")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // GET: confirmação antes de apagar (conta Identity não é apagada)
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            return Ok(FuncionarioResponseDtoMapping.Map(item, includeSensitive: false));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        // Apaga ficha, pasta de documentos e conta Identity associada (se não for a conta do utilizador atual)
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var item = await _context.Funcionarios.FindAsync(id);
            if (item != null)
            {
                var currentUserId = _userManager.GetUserId(User);
                if (!string.IsNullOrEmpty(item.UserId) && item.UserId != currentUserId)
                {
                    var user = await _userManager.FindByIdAsync(item.UserId);
                    if (user != null)
                    {
                        foreach (var f in await _context.Funcionarios.Where(f => f.UserId == item.UserId).ToListAsync(cancellationToken))
                            f.UserId = null;
                        foreach (var c in await _context.Clientes.Where(c => c.UserId == item.UserId).ToListAsync(cancellationToken))
                            c.UserId = null;
                        var perfis = await _context.Perfis.Where(p => p.UserId == item.UserId).ToListAsync(cancellationToken);
                        _context.Perfis.RemoveRange(perfis);
                        await _context.SaveChangesAsync(cancellationToken);
                        await _userManager.DeleteAsync(user);
                    }
                }
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosFuncionarios, id.ToString()));
                _context.Funcionarios.Remove(item);
                await _context.SaveChangesAsync(cancellationToken);
            }
            return NoContent();
        }

        [HttpGet("{id:int}/desassociar")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> DesassociarConta(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId)) return NotFound();
            return Ok(FuncionarioResponseDtoMapping.Map(item, includeSensitive: false));
        }

        [HttpPost("{id:int}/desassociar")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirFuncionarios)]
        public async Task<IActionResult> DesassociarContaConfirmar(int id, CancellationToken cancellationToken = default)
        {
            var item = await _context.Funcionarios.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId))
                return NotFound();
            var userId = item.UserId;
            var currentUserId = _userManager.GetUserId(User);
            if (currentUserId == userId)
                return BadRequest(new { error = "Não pode desassociar a sua própria conta." });
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                item.UserId = null;
                await _context.SaveChangesAsync(cancellationToken);
                return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false), contaDesassociada = true });
            }
            item.UserId = null;
            foreach (var f in await _context.Funcionarios.Where(f => f.UserId == userId).ToListAsync(cancellationToken))
                f.UserId = null;
            foreach (var c in await _context.Clientes.Where(c => c.UserId == userId).ToListAsync(cancellationToken))
                c.UserId = null;
            var perfis = await _context.Perfis.Where(p => p.UserId == userId).ToListAsync(cancellationToken);
            _context.Perfis.RemoveRange(perfis);
            await _context.SaveChangesAsync(cancellationToken);
            var result = await _userManager.DeleteAsync(user);
            var message = result.Succeeded ? null : "Não foi possível remover a conta. A ficha foi desassociada.";
            return Ok(new { item = FuncionarioResponseDtoMapping.Map(item, includeSensitive: false), contaDesassociada = true, aviso = message });
        }

        // Devolve documento (CC, ADR, licença, outros ou extra por id) inline. Admin pode ver qualquer; outros apenas os seus.
        [HttpGet("{id:int}/documentos")]
        public async Task<IActionResult> Download(int id, string tipo, int? extraId = null, CancellationToken cancellationToken = default)
        {
            var funcionario = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (funcionario == null)
                return NotFound();
            var currentUserId = _userManager.GetUserId(User);
            if (!User.IsInRole(ConstantesRoles.Admin) && !User.IsInRole(ConstantesRoles.Gestor) && funcionario.UserId != currentUserId)
                return Forbid();

            if (tipo?.ToLowerInvariant() == "extra" && extraId.HasValue)
            {
                var extra = await _context.FuncionarioDocumentoExtras.AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == extraId.Value && e.FuncionarioId == id, cancellationToken);
                if (extra == null)
                    return NotFound();
                return ServirFicheiro(extra.Caminho);
            }
            string? caminhoRelativo = tipo?.ToLowerInvariant() switch
            {
                "cc" => funcionario.CartaoCidadaoCaminho,
                "addr" => funcionario.DocumentoADDRCaminho,
                "licenca" => funcionario.LicencaOperadorCaminho,
                "outros" => funcionario.OutrosCaminho,
                _ => null
            };
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

        private async Task EnviarEmailContaCriadaAsync(string email, string nomeFuncionario, string password, string? confirmarEmailUrl = null)
        {
            var req = HttpContext.Request;
            // API-only: a UI de login é do frontend (Next.js). Este link é apenas informativo.
            var loginUrl = $"{req.Scheme}://{req.Host}";
            var assunto = "Conta de acesso criada – confirme o seu email";
            var corpo = $@"
<p>Olá {nomeFuncionario},</p>
<p>Foi criada uma conta de acesso para si.</p>
<p><strong>Email:</strong> {email}<br/>
<strong>Palavra-passe:</strong> {password}</p>
";
            if (!string.IsNullOrEmpty(confirmarEmailUrl))
            {
                corpo += $@"<p><strong>Confirme o seu email</strong> clicando no link abaixo. Só depois poderá entrar no site.</p>
<p><a href=""{confirmarEmailUrl}"">Confirmar email e ativar conta</a></p>
<p>Depois de confirmar, pode entrar em: <a href=""{loginUrl}"">{loginUrl}</a></p>";
            }
            else
            {
                corpo += $@"<p>Pode entrar em: <a href=""{loginUrl}"">{loginUrl}</a></p>";
            }
            corpo += "<p>Recomendamos que altere a palavra-passe após o primeiro login.</p>";
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
