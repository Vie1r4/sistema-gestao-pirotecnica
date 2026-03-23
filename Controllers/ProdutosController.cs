using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    [Route("api/produtos")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProdutosController : ControllerBase
    {
        private readonly FinalprojContext _context;

        public ProdutosController(FinalprojContext context)
        {
            _context = context;
        }

        // Catálogo com pesquisa e filtros (classificação, grupo, filtro técnico, calibre)
        [HttpGet]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerProdutos)]
        public async Task<IActionResult> Index(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
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

            var lista = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);
            var items = lista.Select(ProdutoResponseDtoMapping.Map).ToList();

            return Ok(new
            {
                items,
                pesquisa = pesquisa ?? string.Empty,
                classificacao = classificacao ?? string.Empty,
                grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
                filtroTecnico = filtroTecnico ?? string.Empty,
                calibre = calibre ?? string.Empty
            });
        }

        // Gestão com os mesmos filtros do catálogo
        [HttpGet("gerir")]
        public async Task<IActionResult> Gerir(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
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

            var lista = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);
            var items = lista.Select(ProdutoResponseDtoMapping.Map).ToList();

            return Ok(new
            {
                items,
                pesquisa = pesquisa ?? string.Empty,
                classificacao = classificacao ?? string.Empty,
                grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
                filtroTecnico = filtroTecnico ?? string.Empty,
                calibre = calibre ?? string.Empty
            });
        }

        // Detalhe do produto
        [HttpGet("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerProdutos)]
        public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null) return NotFound();
            return Ok(ProdutoResponseDtoMapping.Map(produto));
        }

        [HttpGet("create")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        // GET: formulário novo produto; dropdowns família, grupo, filtro, calibre
        public IActionResult Create()
        {
            return Ok(new
            {
                produto = ProdutoResponseDtoMapping.Map(new Produto()),
                familiaRisco = ConstantesPaiol.FamiliasParaDropdown(),
                grupoCompatibilidade = ConstantesCatalogo.GruposParaDropdown(),
                filtroTecnico = ConstantesCatalogo.FiltrosTecnicosParaDropdown(),
                calibre = ConstantesCatalogo.CalibresParaDropdown()
            });
        }

        [HttpPost]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Create([FromBody] Produto produto, CancellationToken cancellationToken = default)
        {
            if (ModelState.IsValid)
            {
                _context.Add(produto);
                await _context.SaveChangesAsync(cancellationToken);
                return CreatedAtAction(nameof(Details), new { id = produto.Id }, new { produto = ProdutoResponseDtoMapping.Map(produto) });
            }
            return BadRequest(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = ConstantesPaiol.FamiliasParaDropdown(),
                grupoCompatibilidade = ConstantesCatalogo.GruposParaDropdown(),
                filtroTecnico = ConstantesCatalogo.FiltrosTecnicosParaDropdown(),
                calibre = ConstantesCatalogo.CalibresParaDropdown(),
                errors = ModelState
            });
        }

        // GET: formulário edição com dropdowns
        [HttpGet("{id:int}/edit")]
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null) return NotFound();
            return Ok(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = ConstantesPaiol.FamiliasParaDropdown(),
                grupoCompatibilidade = ConstantesCatalogo.GruposParaDropdown(),
                filtroTecnico = ConstantesCatalogo.FiltrosTecnicosParaDropdown(),
                calibre = ConstantesCatalogo.CalibresParaDropdown()
            });
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Edit(int id, [FromBody] Produto produto, CancellationToken cancellationToken = default)
        {
            if (id != produto.Id) return NotFound();
            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(produto);
                    await _context.SaveChangesAsync(cancellationToken);
                    return Ok(new { produto = ProdutoResponseDtoMapping.Map(produto) });
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Produtos.AnyAsync(e => e.Id == produto.Id, cancellationToken))
                        return NotFound();
                    throw;
                }
            }
            return BadRequest(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = ConstantesPaiol.FamiliasParaDropdown(),
                grupoCompatibilidade = ConstantesCatalogo.GruposParaDropdown(),
                filtroTecnico = ConstantesCatalogo.FiltrosTecnicosParaDropdown(),
                calibre = ConstantesCatalogo.CalibresParaDropdown(),
                errors = ModelState
            });
        }

        // GET: confirmação antes de apagar
        [HttpGet("{id:int}/delete")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var produto = await _context.Produtos.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (produto == null) return NotFound();
            return Ok(ProdutoResponseDtoMapping.Map(produto));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var produto = await _context.Produtos.FindAsync(id);
            if (produto != null)
            {
                _context.Produtos.Remove(produto);
                await _context.SaveChangesAsync(cancellationToken);
            }
            return NoContent();
        }
    }
}
