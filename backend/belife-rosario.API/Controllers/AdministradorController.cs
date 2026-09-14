using Belife.API.Data;
using Belife.API.DTOs.Administrador;
using Belife.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/administradores")]
[Authorize]
public class AdministradorController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public AdministradorController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdministradorResponseDto>>> GetAdministradores()
    {
        var administradores = await _context.Administradores
            .AsNoTracking()
            .Select(a => new AdministradorResponseDto
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Activo = a.Activo
            })
            .ToListAsync();

        return Ok(administradores);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdministradorResponseDto>> GetAdministrador(int id)
    {
        var administrador = await _context.Administradores
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AdministradorResponseDto
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Activo = a.Activo
            })
            .FirstOrDefaultAsync();

        if (administrador is null)
            return NotFound();

        return Ok(administrador);
    }

    [HttpPost]
    public async Task<ActionResult<AdministradorResponseDto>> CreateAdministrador(CreateAdministradorDto dto)
    {
        var hasher = new PasswordHasher<Administrador>();

        var administrador = new Administrador
        {
            Nombre = dto.Nombre,
            PasswordHash = hasher.HashPassword(null!, dto.Password),
            Activo = dto.Activo
        };

        _context.Administradores.Add(administrador);
        await _context.SaveChangesAsync();

        var response = new AdministradorResponseDto
        {
            Id = administrador.Id,
            Nombre = administrador.Nombre,
            Activo = administrador.Activo
        };

        return CreatedAtAction(nameof(GetAdministrador), new { id = administrador.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAdministrador(int id, UpdateAdministradorDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var administrador = await _context.Administradores.FindAsync(id);

        if (administrador is null)
            return NotFound();

        administrador.Nombre = dto.Nombre;
        administrador.Activo = dto.Activo;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var hasher = new PasswordHasher<Administrador>();
            administrador.PasswordHash = hasher.HashPassword(null!, dto.Password);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAdministrador(int id)
    {
        var administrador = await _context.Administradores.FindAsync(id);

        if (administrador is null)
            return NotFound();

        _context.Administradores.Remove(administrador);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("No se puede eliminar el administrador porque tiene cambios de precio asociados.");
        }

        return NoContent();
    }
}