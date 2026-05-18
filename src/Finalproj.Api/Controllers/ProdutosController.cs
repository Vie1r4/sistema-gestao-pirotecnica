using Finalproj.Authorization;
using Finalproj.Application.Common.Models;
using Finalproj.Application.Features.Produtos.DTOs;
using Finalproj.Application.Features.Produtos.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    [Route("api/produtos")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProdutosController : ControllerBase
    {
        private readonly IProdutoApplicationService _produtos;

        public ProdutosController(IProdutoApplicationService produtos)
        {
            _produtos = produtos;
        }

        // Catálogo com pesquisa e filtros (classificação, grupo, filtro técnico, calibre)
        [HttpGet]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerProdutos)]
        public async Task<IActionResult> Index(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
            var lista = await _produtos.SearchAsync(pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);
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
            var lista = await _produtos.SearchAsync(pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);
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
            var produto = await _produtos.GetByIdAsync(id.Value, cancellationToken);
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
                familiaRisco = DropdownSelectLists.FamiliasParaDropdown(),
                grupoCompatibilidade = DropdownSelectLists.GruposParaDropdown(),
                filtroTecnico = DropdownSelectLists.FiltrosTecnicosParaDropdown(),
                calibre = DropdownSelectLists.CalibresParaDropdown()
            });
        }

        [HttpPost]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Create([FromBody] Produto produto, CancellationToken cancellationToken = default)
        {
            if (ModelState.IsValid)
            {
                await _produtos.CreateAsync(produto, cancellationToken);
                return CreatedAtAction(nameof(Details), new { id = produto.Id }, new { produto = ProdutoResponseDtoMapping.Map(produto) });
            }
            return BadRequest(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = DropdownSelectLists.FamiliasParaDropdown(),
                grupoCompatibilidade = DropdownSelectLists.GruposParaDropdown(),
                filtroTecnico = DropdownSelectLists.FiltrosTecnicosParaDropdown(),
                calibre = DropdownSelectLists.CalibresParaDropdown(),
                errors = ModelState
            });
        }

        // GET: formulário edição com dropdowns
        [HttpGet("{id:int}/edit")]
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var produto = await _produtos.GetByIdAsync(id.Value, cancellationToken);
            if (produto == null) return NotFound();
            return Ok(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = DropdownSelectLists.FamiliasParaDropdown(),
                grupoCompatibilidade = DropdownSelectLists.GruposParaDropdown(),
                filtroTecnico = DropdownSelectLists.FiltrosTecnicosParaDropdown(),
                calibre = DropdownSelectLists.CalibresParaDropdown()
            });
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Edit(int id, [FromBody] Produto produto, CancellationToken cancellationToken = default)
        {
            if (id != produto.Id) return NotFound();
            if (ModelState.IsValid)
            {
                var updated = await _produtos.UpdateAsync(id, produto, cancellationToken);
                if (updated == null)
                    return NotFound();
                return Ok(new { produto = ProdutoResponseDtoMapping.Map(updated) });
            }
            return BadRequest(new
            {
                produto = ProdutoResponseDtoMapping.Map(produto),
                familiaRisco = DropdownSelectLists.FamiliasParaDropdown(),
                grupoCompatibilidade = DropdownSelectLists.GruposParaDropdown(),
                filtroTecnico = DropdownSelectLists.FiltrosTecnicosParaDropdown(),
                calibre = DropdownSelectLists.CalibresParaDropdown(),
                errors = ModelState
            });
        }

        // GET: confirmação antes de apagar
        [HttpGet("{id:int}/delete")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null) return NotFound();
            var produto = await _produtos.GetByIdAsync(id.Value, cancellationToken);
            if (produto == null) return NotFound();
            return Ok(ProdutoResponseDtoMapping.Map(produto));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            await _produtos.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
    }
}
