using Belife.API.Data;
using Belife.API.DTOs.Categoria;
using Belife.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/categorias")]
[Authorize]
public class CategoriaController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public CategoriaController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaResponseDto>>> GetCategorias()
    {
        var categorias = await _context.Categorias
            .AsNoTracking()
            .Select(c => new CategoriaResponseDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                CantidadProductos = c.Productos.Count
            })
            .ToListAsync();

        return Ok(categorias);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoriaResponseDto>> GetCategoria(int id)
    {
        var categoria = await _context.Categorias
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoriaResponseDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                CantidadProductos = c.Productos.Count
            })
            .FirstOrDefaultAsync();

        if (categoria is null)
            return NotFound();

        return Ok(categoria);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaResponseDto>> CreateCategoria(CreateCategoriaDto dto)
    {
        var categoria = new Categoria { Nombre = dto.Nombre };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        var response = new CategoriaResponseDto
        {
            Id = categoria.Id,
            Nombre = categoria.Nombre,
            CantidadProductos = 0
        };

        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategoria(int id, UpdateCategoriaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria is null)
            return NotFound();

        categoria.Nombre = dto.Nombre;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);

        if (categoria is null)
            return NotFound();

        _context.Categorias.Remove(categoria);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("No se puede eliminar la categoría porque tiene productos asociados.");
        }

        return NoContent();
    }
}