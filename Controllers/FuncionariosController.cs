using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Funcionários: CRUD, documentos (CC, ADR, licença), associação a conta Identity; acesso por cargo
    [Authorize]
    public class FuncionariosController : Controller
    {
        private readonly FinalprojContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IEmailSender _emailSender;
        private const string PastaDocumentosFuncionarios = "Documentos/Funcionarios";
        private static readonly string[] RolesParaConta = { "Admin", "Armazém", "Técnico", "Comercial" };

        public FuncionariosController(FinalprojContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager, IDocumentoStorageService documentoStorage, IEmailSender emailSender)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
            _documentoStorage = documentoStorage;
            _emailSender = emailSender;
        }

        // Lista com pesquisa e filtro por cargo
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
            ViewData["UserIdEmailConfirmados"] = userIdsConfirmados;

            ViewData["Pesquisa"] = pesquisa ?? string.Empty;
            ViewData["Cargo"] = cargo ?? string.Empty;
            ViewData["Ordenar"] = ordenar ?? "nome";
            ViewData["Cargos"] = ConstantesFuncionariosClientes.CargosParaDropdown();
            return View(lista);
        }

        // Detalhe do funcionário com documentos
        public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().Include(f => f.DocumentosExtras).FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            if (!string.IsNullOrEmpty(item.UserId))
            {
                var user = await _userManager.FindByIdAsync(item.UserId);
                ViewData["ContaEmail"] = user?.Email ?? user?.UserName;
                ViewData["ContaEmailConfirmada"] = user != null && user.EmailConfirmed;
            }
            return View(item);
        }

        // GET: formulário criar funcionário; dropdown cargo e roles para conta
        [Authorize(Roles = "Admin")]
        public IActionResult Create()
        {
            PreencherDropdownCargo(null);
            PreencherDropdownRolesConta(null);
            return View(new Funcionario());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        // Grava funcionário, opcionalmente cria conta de acesso; CC/ADR/licença e documentos extras
        public async Task<IActionResult> Create(
            [Bind("NomeCompleto,NIF,Email,Telefone,Morada,NumeroSegurancaSocial,IBAN,Cargo,Notas")] Funcionario funcionario,
            IFormFile? cartaoCidadaoFicheiro,
            IFormFile? documentoADDRFicheiro,
            IFormFile? licencaOperadorFicheiro,
            List<DocumentoExtraInput>? documentosExtras,
            bool criarConta = false,
            string? contaEmail = null,
            string? contaPassword = null,
            string? contaConfirmPassword = null,
            string? contaRole = null,
            CancellationToken cancellationToken = default)
        {
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

                if (cartaoCidadaoFicheiro != null && _documentoStorage.ExtensaoPermitida(cartaoCidadaoFicheiro.FileName))
                {
                    funcionario.CartaoCidadaoCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, cartaoCidadaoFicheiro, "cc", cancellationToken);
                }
                if (documentoADDRFicheiro != null && _documentoStorage.ExtensaoPermitida(documentoADDRFicheiro.FileName))
                {
                    funcionario.DocumentoADDRCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, documentoADDRFicheiro, "addr", cancellationToken);
                }
                if (licencaOperadorFicheiro != null && _documentoStorage.ExtensaoPermitida(licencaOperadorFicheiro.FileName))
                {
                    funcionario.LicencaOperadorCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, licencaOperadorFicheiro, "licenca", cancellationToken);
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
                        TempData["CredenciaisCriadas"] = true;
                        TempData["CredenciaisEmail"] = email;
                        TempData["CredenciaisPassword"] = contaPassword;
                        var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        var confirmUrl = Url.Page("/Account/ConfirmEmail", null, new { area = "Identity", userId = user.Id, code = confirmCode, returnUrl = Url.Content("~/") }, Request.Scheme);
                        await EnviarEmailContaCriadaAsync(email, funcionario.NomeCompleto, contaPassword!, confirmUrl);
                    }
                    else
                    {
                        foreach (var err in createResult.Errors)
                            ModelState.AddModelError("ContaPassword", err.Description);
                        PreencherDropdownCargo(funcionario.Cargo);
                        PreencherDropdownRolesConta(contaRole);
                        return View(funcionario);
                    }
                }

                TempData["FuncionarioCriado"] = true;
                return RedirectToAction(nameof(Details), new { id = funcionario.Id });
            }
            PreencherDropdownCargo(funcionario.Cargo);
            PreencherDropdownRolesConta(contaRole);
            return View(funcionario);
        }

        [Authorize(Roles = "Admin")]
        // GET: edição com dropdown cargo; secção Criar conta se não tiver UserId
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            PreencherDropdownCargo(item.Cargo);
            PreencherDropdownRolesConta(null);
            if (!string.IsNullOrEmpty(item.UserId))
            {
                var user = await _userManager.FindByIdAsync(item.UserId);
                ViewData["ContaEmail"] = user?.Email ?? user?.UserName;
            }
            return View(item);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        // Actualiza ficha, documentos; opcionalmente cria conta (quando UserId é null)
        public async Task<IActionResult> Edit(
            int id,
            [Bind("Id,NomeCompleto,NIF,Email,Telefone,Morada,NumeroSegurancaSocial,IBAN,Cargo,Notas,UserId,DataRegisto,CartaoCidadaoCaminho,DocumentoADDRCaminho,LicencaOperadorCaminho,OutrosCaminho")] Funcionario funcionario,
            IFormFile? cartaoCidadaoFicheiro,
            IFormFile? documentoADDRFicheiro,
            IFormFile? licencaOperadorFicheiro,
            List<DocumentoExtraInput>? documentosExtras,
            List<int>? removerDocumentoExtraIds,
            bool removerOutrosAntigo = false,
            bool criarConta = false,
            string? contaEmail = null,
            string? contaPassword = null,
            string? contaConfirmPassword = null,
            string? contaRole = null,
            CancellationToken cancellationToken = default)
        {
            if (id != funcionario.Id)
                return NotFound();

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
                    if (removerOutrosAntigo && !string.IsNullOrEmpty(funcionario.OutrosCaminho))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(funcionario.OutrosCaminho);
                        funcionario.OutrosCaminho = null;
                    }

                    if (cartaoCidadaoFicheiro != null && _documentoStorage.ExtensaoPermitida(cartaoCidadaoFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(funcionario.CartaoCidadaoCaminho);
                        funcionario.CartaoCidadaoCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, cartaoCidadaoFicheiro, "cc", cancellationToken);
                    }
                    if (documentoADDRFicheiro != null && _documentoStorage.ExtensaoPermitida(documentoADDRFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(funcionario.DocumentoADDRCaminho);
                        funcionario.DocumentoADDRCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, documentoADDRFicheiro, "addr", cancellationToken);
                    }
                    if (licencaOperadorFicheiro != null && _documentoStorage.ExtensaoPermitida(licencaOperadorFicheiro.FileName))
                    {
                        _documentoStorage.ApagarFicheiroSeExistir(funcionario.LicencaOperadorCaminho);
                        funcionario.LicencaOperadorCaminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, licencaOperadorFicheiro, "licenca", cancellationToken);
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
                                var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosFuncionarios, funcionario.Id, ext.Ficheiro, "extra_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
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

                    if (criarConta && string.IsNullOrEmpty(funcionario.UserId))
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
                            TempData["CredenciaisCriadas"] = true;
                            TempData["CredenciaisEmail"] = email;
                            TempData["CredenciaisPassword"] = contaPassword;
                            var confirmCode = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                            var confirmUrl = Url.Page("/Account/ConfirmEmail", null, new { area = "Identity", userId = user.Id, code = confirmCode, returnUrl = Url.Content("~/") }, Request.Scheme);
                            await EnviarEmailContaCriadaAsync(email, funcionario.NomeCompleto, contaPassword!, confirmUrl);
                        }
                        else
                        {
                            foreach (var err in createResult.Errors)
                                ModelState.AddModelError("ContaPassword", err.Description);
                            PreencherDropdownCargo(funcionario.Cargo);
                            PreencherDropdownRolesConta(contaRole);
                            return View(funcionario);
                        }
                    }

                    _context.Update(funcionario);
                    await _context.SaveChangesAsync(cancellationToken);
                    TempData["FuncionarioEditado"] = true;
                    return RedirectToAction(nameof(Details), new { id = funcionario.Id });
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Funcionarios.AnyAsync(e => e.Id == funcionario.Id, cancellationToken))
                        return NotFound();
                    throw;
                }
            }
            PreencherDropdownCargo(funcionario.Cargo);
            PreencherDropdownRolesConta(contaRole);
            return View(funcionario);
        }

        [Authorize(Roles = "Admin")]
        // GET: confirmação antes de apagar (conta Identity não é apagada)
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            return View(item);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
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
                TempData["FuncionarioEliminado"] = true;
            }
            return RedirectToAction(nameof(Index));
        }

        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DesassociarConta(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var item = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId)) return NotFound();
            return View(item);
        }

        [HttpPost, ActionName("DesassociarConta")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DesassociarContaConfirmar(int id, CancellationToken cancellationToken = default)
        {
            var item = await _context.Funcionarios.FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null || string.IsNullOrEmpty(item.UserId))
                return NotFound();
            var userId = item.UserId;
            var currentUserId = _userManager.GetUserId(User);
            if (currentUserId == userId)
            {
                TempData["DesassociarErro"] = "Não pode desassociar a sua própria conta.";
                return RedirectToAction(nameof(Details), new { id });
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                item.UserId = null;
                await _context.SaveChangesAsync(cancellationToken);
                return RedirectToAction(nameof(Details), new { id });
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
            if (!result.Succeeded)
            {
                TempData["DesassociarErro"] = "Não foi possível remover a conta. A ficha foi desassociada.";
            }
            TempData["ContaDesassociada"] = true;
            return RedirectToAction(nameof(Details), new { id });
        }

        // Devolve documento (CC, ADR, licença, outros ou extra por id) inline
        public IActionResult Download(int id, string tipo, int? extraId = null)
        {
            if (tipo?.ToLowerInvariant() == "extra" && extraId.HasValue)
            {
                var extra = _context.FuncionarioDocumentoExtras.AsNoTracking()
                    .FirstOrDefault(e => e.Id == extraId.Value && e.FuncionarioId == id);
                if (extra == null)
                    return NotFound();
                return ServirFicheiro(extra.Caminho);
            }
            var funcionario = _context.Funcionarios.AsNoTracking().FirstOrDefault(f => f.Id == id);
            if (funcionario == null)
                return NotFound();
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
            var loginUrl = $"{Request.Scheme}://{Request.Host}/Identity/Account/Login";
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

        // Preenche ViewData com SelectList de cargos
        private void PreencherDropdownCargo(string? valorSelecionado)
        {
            ViewData["Cargo"] = new SelectList(
                ConstantesFuncionariosClientes.CargosParaDropdown(),
                "Value", "Text",
                valorSelecionado);
        }

        // Preenche ViewData com SelectList de roles para criar conta de acesso
        private void PreencherDropdownRolesConta(string? valorSelecionado)
        {
            ViewData["RolesConta"] = new SelectList(
                ConstantesFuncionariosClientes.CargosParaDropdown(),
                "Value", "Text",
                valorSelecionado);
        }
    }
}
