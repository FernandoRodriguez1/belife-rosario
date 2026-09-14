using Belife.API.Data;
using Belife.API.DTOs.Marca;
using Belife.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/marcas")]
[Authorize]
public class MarcaController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public MarcaController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MarcaResponseDto>>> GetMarcas()
    {
        var marcas = await _context.Marcas
            .AsNoTracking()
            .Select(m => new MarcaResponseDto
            {
                Id = m.Id,
                Nombre = m.Nombre,
                CantidadProductos = m.Productos.Count
            })
            .ToListAsync();

        return Ok(marcas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MarcaResponseDto>> GetMarca(int id)
    {
        var marca = await _context.Marcas
            .AsNoTracking()
            .Where(m => m.Id == id)
            .Select(m => new MarcaResponseDto
            {
                Id = m.Id,
                Nombre = m.Nombre,
                CantidadProductos = m.Productos.Count
            })
            .FirstOrDefaultAsync();

        if (marca is null)
            return NotFound();

        return Ok(marca);
    }

    [HttpPost]
    public async Task<ActionResult<MarcaResponseDto>> CreateMarca(CreateMarcaDto dto)
    {
        var marca = new Marca { Nombre = dto.Nombre };

        _context.Marcas.Add(marca);
        await _context.SaveChangesAsync();

        var response = new MarcaResponseDto
        {
            Id = marca.Id,
            Nombre = marca.Nombre,
            CantidadProductos = 0
        };

        return CreatedAtAction(nameof(GetMarca), new { id = marca.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateMarca(int id, UpdateMarcaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var marca = await _context.Marcas.FindAsync(id);

        if (marca is null)
            return NotFound();

        marca.Nombre = dto.Nombre;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteMarca(int id)
    {
        var marca = await _context.Marcas.FindAsync(id);

        if (marca is null)
            return NotFound();

        _context.Marcas.Remove(marca);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("No se puede eliminar la marca porque tiene productos asociados.");
        }

        return NoContent();
    }
}