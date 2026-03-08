using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Catálogo e gestão de produtos: NEM por unidade, família de risco, grupo compatibilidade, calibre
    [Authorize]
    public class ProdutosController : Controller
    {
        private readonly FinalprojContext _context;

        public ProdutosController(FinalprojContext context)
        {
            _context = context;
        }

        // Catálogo com pesquisa e filtros (classificação, grupo, filtro técnico, calibre)
        public async Task<IActionResult> Index(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre)
        {
            ViewData["Pesquisa"] = pesquisa;
            ViewData["Classificacao"] = classificacao;
            ViewData["GrupoCompatibilidade"] = grupoCompatibilidade;
            ViewData["FiltroTecnico"] = filtroTecnico;
            ViewData["Calibre"] = calibre;

            var query = _context.Produtos.AsQueryable();
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

            var lista = await query.OrderBy(p => p.Nome).ToListAsync();
            return View(lista);
        }

        // Gestão com os mesmos filtros do catálogo
        public async Task<IActionResult> Gerir(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre)
        {
            ViewData["Pesquisa"] = pesquisa ?? "";
            ViewData["Classificacao"] = classificacao ?? "";
            ViewData["GrupoCompatibilidade"] = grupoCompatibilidade ?? "";
            ViewData["FiltroTecnico"] = filtroTecnico ?? "";
            ViewData["Calibre"] = calibre ?? "";

            var query = _context.Produtos.AsQueryable();
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

            var lista = await query.OrderBy(p => p.Nome).ToListAsync();
            return View(lista);
        }

        // Detalhe do produto
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null) return NotFound();
            return View(produto);
        }

        [Authorize(Roles = "Admin")]
        // GET: formulário novo produto; dropdowns família, grupo, filtro, calibre
        public IActionResult Create()
        {
            ViewData["FamiliaRisco"] = new SelectList(ConstantesPaiol.FamiliasParaDropdown(), "Value", "Text");
            ViewData["GrupoCompatibilidade"] = new SelectList(ConstantesCatalogo.GruposParaDropdown(), "Value", "Text");
            ViewData["FiltroTecnico"] = new SelectList(ConstantesCatalogo.FiltrosTecnicosParaDropdown(), "Value", "Text");
            ViewData["Calibre"] = new SelectList(ConstantesCatalogo.CalibresParaDropdown(), "Value", "Text");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Admin")]
        // Grava novo produto
        public async Task<IActionResult> Create([Bind("Nome,NEMPorUnidade,FamiliaRisco,GrupoCompatibilidade,FiltroTecnico,Calibre")] Produto produto)
        {
            if (ModelState.IsValid)
            {
                _context.Add(produto);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["FamiliaRisco"] = new SelectList(ConstantesPaiol.FamiliasParaDropdown(), "Value", "Text", produto.FamiliaRisco);
            ViewData["GrupoCompatibilidade"] = new SelectList(ConstantesCatalogo.GruposParaDropdown(), "Value", "Text", produto.GrupoCompatibilidade);
            ViewData["FiltroTecnico"] = new SelectList(ConstantesCatalogo.FiltrosTecnicosParaDropdown(), "Value", "Text", produto.FiltroTecnico);
            ViewData["Calibre"] = new SelectList(ConstantesCatalogo.CalibresParaDropdown(), "Value", "Text", produto.Calibre);
            return View(produto);
        }

        // GET: formulário edição com dropdowns
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null) return NotFound();
            ViewData["FamiliaRisco"] = new SelectList(ConstantesPaiol.FamiliasParaDropdown(), "Value", "Text", produto.FamiliaRisco);
            ViewData["GrupoCompatibilidade"] = new SelectList(ConstantesCatalogo.GruposParaDropdown(), "Value", "Text", produto.GrupoCompatibilidade);
            ViewData["FiltroTecnico"] = new SelectList(ConstantesCatalogo.FiltrosTecnicosParaDropdown(), "Value", "Text", produto.FiltroTecnico);
            ViewData["Calibre"] = new SelectList(ConstantesCatalogo.CalibresParaDropdown(), "Value", "Text", produto.Calibre);
            return View(produto);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        // Actualiza produto
        public async Task<IActionResult> Edit(int id, [Bind("Id,Nome,NEMPorUnidade,FamiliaRisco,Unidade,GrupoCompatibilidade,FiltroTecnico,Calibre")] Produto produto)
        {
            if (id != produto.Id) return NotFound();
            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(produto);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Produtos.AnyAsync(e => e.Id == produto.Id))
                        return NotFound();
                    throw;
                }
                return RedirectToAction(nameof(Gerir));
            }
            ViewData["FamiliaRisco"] = new SelectList(ConstantesPaiol.FamiliasParaDropdown(), "Value", "Text", produto.FamiliaRisco);
            ViewData["GrupoCompatibilidade"] = new SelectList(ConstantesCatalogo.GruposParaDropdown(), "Value", "Text", produto.GrupoCompatibilidade);
            ViewData["FiltroTecnico"] = new SelectList(ConstantesCatalogo.FiltrosTecnicosParaDropdown(), "Value", "Text", produto.FiltroTecnico);
            ViewData["Calibre"] = new SelectList(ConstantesCatalogo.CalibresParaDropdown(), "Value", "Text", produto.Calibre);
            return View(produto);
        }

        // GET: confirmação antes de apagar
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FirstOrDefaultAsync(m => m.Id == id);
            if (produto == null) return NotFound();
            return View(produto);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        // Apaga produto
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var produto = await _context.Produtos.FindAsync(id);
            if (produto != null)
            {
                _context.Produtos.Remove(produto);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Gerir));
        }
    }
}
