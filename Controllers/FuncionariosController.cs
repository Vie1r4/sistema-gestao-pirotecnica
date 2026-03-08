using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
        private const string PastaDocumentosFuncionarios = "Documentos/Funcionarios";
        private static readonly string[] ExtensoesPermitidas = { ".pdf", ".jpg", ".jpeg", ".png" };

        public FuncionariosController(FinalprojContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
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
            return View(item);
        }

        // GET: formulário criar funcionário; dropdown cargo
        [Authorize(Roles = "Admin")]
        public IActionResult Create()
        {
            PreencherDropdownCargo(null);
            return View(new Funcionario());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        // Grava funcionário, CC/ADR/licença e documentos extras
        public async Task<IActionResult> Create(
            [Bind("NomeCompleto,NIF,Email,Telefone,Morada,NumeroSegurancaSocial,IBAN,Cargo,Notas")] Funcionario funcionario,
            IFormFile? cartaoCidadaoFicheiro,
            IFormFile? documentoADDRFicheiro,
            IFormFile? licencaOperadorFicheiro,
            List<DocumentoExtraInput>? documentosExtras,
            CancellationToken cancellationToken = default)
        {
            if (ModelState.IsValid)
            {
                funcionario.DataRegisto = DateTime.UtcNow;
                _context.Funcionarios.Add(funcionario);
                await _context.SaveChangesAsync(cancellationToken);

                var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosFuncionarios, funcionario.Id.ToString());
                if (Directory.Exists(pastaBase) == false)
                    Directory.CreateDirectory(pastaBase);

                if (cartaoCidadaoFicheiro != null && FicheiroPermitido(cartaoCidadaoFicheiro.FileName))
                {
                    funcionario.CartaoCidadaoCaminho = await GuardarFicheiro(cartaoCidadaoFicheiro, pastaBase, "cc");
                }
                if (documentoADDRFicheiro != null && FicheiroPermitido(documentoADDRFicheiro.FileName))
                {
                    funcionario.DocumentoADDRCaminho = await GuardarFicheiro(documentoADDRFicheiro, pastaBase, "addr");
                }
                if (licencaOperadorFicheiro != null && FicheiroPermitido(licencaOperadorFicheiro.FileName))
                {
                    funcionario.LicencaOperadorCaminho = await GuardarFicheiro(licencaOperadorFicheiro, pastaBase, "licenca");
                }
                if (documentosExtras != null)
                {
                    var idx = 0;
                    foreach (var ext in documentosExtras)
                    {
                        if (ext?.Ficheiro != null && FicheiroPermitido(ext.Ficheiro.FileName))
                        {
                            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                            if (nome.Length > 100) nome = nome[..100];
                            var caminho = await GuardarFicheiro(ext.Ficheiro, pastaBase, "extra_" + idx);
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

                TempData["FuncionarioCriado"] = true;
                return RedirectToAction(nameof(Details), new { id = funcionario.Id });
            }
            PreencherDropdownCargo(funcionario.Cargo);
            return View(funcionario);
        }

        [Authorize(Roles = "Admin")]
        // GET: edição com dropdown cargo e utilizadores (para UserId)
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Funcionarios.Include(f => f.DocumentosExtras).FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            PreencherDropdownCargo(item.Cargo);
            await PreencherDropdownUtilizadores(item.UserId);
            return View(item);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        // Actualiza ficha, documentos e associação utilizador (um user só num funcionário)
        public async Task<IActionResult> Edit(
            int id,
            [Bind("Id,NomeCompleto,NIF,Email,Telefone,Morada,NumeroSegurancaSocial,IBAN,Cargo,Notas,UserId,DataRegisto,CartaoCidadaoCaminho,DocumentoADDRCaminho,LicencaOperadorCaminho,OutrosCaminho")] Funcionario funcionario,
            IFormFile? cartaoCidadaoFicheiro,
            IFormFile? documentoADDRFicheiro,
            IFormFile? licencaOperadorFicheiro,
            List<DocumentoExtraInput>? documentosExtras,
            List<int>? removerDocumentoExtraIds,
            bool removerOutrosAntigo = false,
            CancellationToken cancellationToken = default)
        {
            if (id != funcionario.Id)
                return NotFound();
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
                            ApagarFicheiroSeExistir(_env.WebRootPath, e.Caminho);
                            _context.FuncionarioDocumentoExtras.Remove(e);
                        }
                    }
                    if (removerOutrosAntigo && !string.IsNullOrEmpty(funcionario.OutrosCaminho))
                    {
                        ApagarFicheiroSeExistir(_env.WebRootPath, funcionario.OutrosCaminho);
                        funcionario.OutrosCaminho = null;
                    }

                    var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosFuncionarios, funcionario.Id.ToString());
                    if (Directory.Exists(pastaBase) == false)
                        Directory.CreateDirectory(pastaBase);

                    if (cartaoCidadaoFicheiro != null && FicheiroPermitido(cartaoCidadaoFicheiro.FileName))
                    {
                        ApagarFicheiroSeExistir(_env.WebRootPath, funcionario.CartaoCidadaoCaminho);
                        funcionario.CartaoCidadaoCaminho = await GuardarFicheiro(cartaoCidadaoFicheiro, pastaBase, "cc");
                    }
                    if (documentoADDRFicheiro != null && FicheiroPermitido(documentoADDRFicheiro.FileName))
                    {
                        ApagarFicheiroSeExistir(_env.WebRootPath, funcionario.DocumentoADDRCaminho);
                        funcionario.DocumentoADDRCaminho = await GuardarFicheiro(documentoADDRFicheiro, pastaBase, "addr");
                    }
                    if (licencaOperadorFicheiro != null && FicheiroPermitido(licencaOperadorFicheiro.FileName))
                    {
                        ApagarFicheiroSeExistir(_env.WebRootPath, funcionario.LicencaOperadorCaminho);
                        funcionario.LicencaOperadorCaminho = await GuardarFicheiro(licencaOperadorFicheiro, pastaBase, "licenca");
                    }
                    if (documentosExtras != null)
                    {
                        var idx = 0;
                        foreach (var ext in documentosExtras)
                        {
                            if (ext?.Ficheiro != null && FicheiroPermitido(ext.Ficheiro.FileName))
                            {
                                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                                if (nome.Length > 100) nome = nome[..100];
                                var caminho = await GuardarFicheiro(ext.Ficheiro, pastaBase, "extra_" + Guid.NewGuid().ToString("N")[..8]);
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

                    // Associação utilizador: um utilizador só pode estar ligado a um funcionário
                    if (!string.IsNullOrEmpty(funcionario.UserId))
                    {
                        var outrosComMesmoUser = await _context.Funcionarios
                            .Where(f => f.UserId == funcionario.UserId && f.Id != funcionario.Id)
                            .ToListAsync(cancellationToken);
                        foreach (var o in outrosComMesmoUser)
                            o.UserId = null;
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
        // Apaga ficha e pasta de documentos; mantém conta Identity
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var item = await _context.Funcionarios.FindAsync(id);
            if (item != null)
            {
                // Apagar apenas a ficha do funcionário e os documentos. A conta de utilizador (Identity) associada (UserId) NÃO é apagada — continua a poder fazer login.
                var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosFuncionarios, id.ToString());
                if (Directory.Exists(pastaBase))
                {
                    try
                    {
                        Directory.Delete(pastaBase, recursive: true);
                    }
                    catch
                    {
                        // Ignorar falha ao apagar pasta (ex.: ficheiros em uso)
                    }
                }
                _context.Funcionarios.Remove(item);
                await _context.SaveChangesAsync(cancellationToken);
                TempData["FuncionarioEliminado"] = true;
            }
            return RedirectToAction(nameof(Index));
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

        // Só permite extensões da lista (pdf, jpg, etc.)
        private static bool FicheiroPermitido(string fileName)
        {
            var ext = Path.GetExtension(fileName);
            return !string.IsNullOrEmpty(ext) && ExtensoesPermitidas.Contains(ext.ToLowerInvariant());
        }

        // Grava IFormFile na pasta com nome único; devolve caminho relativo
        private static async Task<string> GuardarFicheiro(IFormFile ficheiro, string pastaBase, string prefixo)
        {
            var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
            var nomeUnico = $"{prefixo}_{Guid.NewGuid():N}{ext}";
            var caminhoFisico = Path.Combine(pastaBase, nomeUnico);
            await using var stream = new FileStream(caminhoFisico, FileMode.Create);
            await ficheiro.CopyToAsync(stream);
            var idPasta = Path.GetFileName(pastaBase.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
            var relativo = Path.Combine(PastaDocumentosFuncionarios, idPasta, nomeUnico).Replace('\\', '/');
            return relativo;
        }

        // Apaga ficheiro em wwwroot se existir (ignora erros)
        private static void ApagarFicheiroSeExistir(string webRoot, string? caminhoRelativo)
        {
            if (string.IsNullOrEmpty(caminhoRelativo)) return;
            var caminhoFisico = Path.Combine(webRoot, caminhoRelativo);
            if (System.IO.File.Exists(caminhoFisico))
            {
                try { System.IO.File.Delete(caminhoFisico); } catch { /* ignorar */ }
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

        // Preenche ViewData com SelectList de utilizadores (para associar conta)
        private async Task PreencherDropdownUtilizadores(string? userIdSelecionado)
        {
            var users = await _userManager.Users
                .OrderBy(u => u.UserName)
                .Select(u => new { u.Id, u.UserName })
                .ToListAsync();
            ViewData["Utilizadores"] = new SelectList(
                users,
                "Id",
                "UserName",
                userIdSelecionado);
        }
    }
}
