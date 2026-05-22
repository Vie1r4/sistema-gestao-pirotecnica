using Finalproj.Authorization;
using Finalproj.Application.Features.Compilados.DTOs;
using Finalproj.Application.Features.Compilados.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers;

/// <summary>Atalhos (compilados) que expandem para vários produtos nas encomendas.</summary>
[Route("api/compilados")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class CompiladosController(ICompiladoApplicationService compilados) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
    public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
    {
        var items = await compilados.ListAsync(cancellationToken);
        return Ok(new { items });
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
    public async Task<IActionResult> Details(int id, CancellationToken cancellationToken = default)
    {
        var c = await compilados.GetByIdAsync(id, cancellationToken);
        if (c == null) return NotFound();
        return Ok(c);
    }

    [HttpPost]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
    public async Task<IActionResult> Create([FromBody] SaveCompiladoDto input, CancellationToken cancellationToken = default)
    {
        var (result, erro) = await compilados.CreateAsync(input, cancellationToken);
        if (erro != null) return BadRequest(new { error = erro });
        return CreatedAtAction(nameof(Details), new { id = result!.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
    public async Task<IActionResult> Update(int id, [FromBody] SaveCompiladoDto input, CancellationToken cancellationToken = default)
    {
        var (result, erro) = await compilados.UpdateAsync(id, input, cancellationToken);
        if (result == null && erro == null) return NotFound();
        if (erro != null) return BadRequest(new { error = erro });
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirProdutos)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        if (!await compilados.DeleteAsync(id, cancellationToken))
            return NotFound();
        return NoContent();
    }
}
