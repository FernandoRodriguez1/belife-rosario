using Belife.API.Data;
using Belife.API.DTOs.HistorialPrecio;
using Belife.API.Models;
using Belife.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/historial-precios")]
[Authorize]
public class HistorialPrecioController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public HistorialPrecioController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HistorialPrecioResponseDto>>> GetHistorialPrecios()
    {
        var historiales = await _context.HistorialPrecios
            .AsNoTracking()
            .OrderByDescending(h => h.Fecha)
            .Select(h => new HistorialPrecioResponseDto
            {
                Id = h.Id,
                ProductoId = h.ProductoId,
                ProductoNombre = h.Producto.Nombre,
                PrecioAnterior = h.PrecioAnterior,
                PrecioNuevo = h.PrecioNuevo,
                Fecha = h.Fecha,
                AdministradorId = h.AdministradorId,
                AdministradorNombre = h.Administrador.Nombre
            })
            .ToListAsync();

        return Ok(historiales);
    }

    [HttpGet("producto/{productoId:int}")]
    public async Task<ActionResult<IEnumerable<HistorialPrecioResponseDto>>> GetHistorialPreciosByProducto(int productoId)
    {
        if (!await _context.Productos.AnyAsync(p => p.Id == productoId))
            return NotFound($"El producto {productoId} no existe.");

        var historiales = await _context.HistorialPrecios
            .AsNoTracking()
            .Where(h => h.ProductoId == productoId)
            .OrderByDescending(h => h.Fecha)
            .Select(h => new HistorialPrecioResponseDto
            {
                Id = h.Id,
                ProductoId = h.ProductoId,
                ProductoNombre = h.Producto.Nombre,
                PrecioAnterior = h.PrecioAnterior,
                PrecioNuevo = h.PrecioNuevo,
                Fecha = h.Fecha,
                AdministradorId = h.AdministradorId,
                AdministradorNombre = h.Administrador.Nombre
            })
            .ToListAsync();

        return Ok(historiales);
    }

    [HttpPost]
    public async Task<ActionResult<HistorialPrecioResponseDto>> CreateHistorialPrecio(CreateHistorialPrecioDto dto)
    {
        var producto = await _context.Productos.FindAsync(dto.ProductoId);

        if (producto is null)
            return BadRequest("El producto indicado no existe.");

        if (!await _context.Administradores.AnyAsync(a => a.Id == dto.AdministradorId))
            return BadRequest("El administrador indicado no existe.");

        var historial = new Belife.API.Models.HistorialPrecio
        {
            ProductoId = dto.ProductoId,
            PrecioAnterior = producto.PrecioActual,
            PrecioNuevo = dto.PrecioNuevo,
            Fecha = HoraArgentina.Ahora(),
            AdministradorId = dto.AdministradorId
        };

        producto.PrecioActual = dto.PrecioNuevo;

        _context.HistorialPrecios.Add(historial);
        await _context.SaveChangesAsync();

        var response = new HistorialPrecioResponseDto
        {
            Id = historial.Id,
            ProductoId = historial.ProductoId,
            ProductoNombre = producto.Nombre,
            PrecioAnterior = historial.PrecioAnterior,
            PrecioNuevo = historial.PrecioNuevo,
            Fecha = historial.Fecha,
            AdministradorId = historial.AdministradorId,
            AdministradorNombre = (await _context.Administradores.FindAsync(historial.AdministradorId))!.Nombre
        };

        return CreatedAtAction(
            nameof(GetHistorialPreciosByProducto),
            new { productoId = historial.ProductoId },
            response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteHistorialPrecio(int id)
    {
        var historial = await _context.HistorialPrecios.FindAsync(id);

        if (historial is null)
            return NotFound();

        _context.HistorialPrecios.Remove(historial);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}