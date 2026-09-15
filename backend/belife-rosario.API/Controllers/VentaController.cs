using Belife.API.Data;
using Belife.API.DTOs.DetalleVenta;
using Belife.API.DTOs.Venta;
using Belife.API.Models;
using Belife.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/ventas")]
[Authorize]
public class VentaController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public VentaController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaResponseDto>>> GetVentas()
    {
        var ventas = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
            .OrderByDescending(v => v.FechaHora)
            .ToListAsync();

        return Ok(ventas.Select(MapToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VentaResponseDto>> GetVenta(int id)
    {
        var venta = await _context.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta is null)
            return NotFound();

        return Ok(MapToResponse(venta));
    }

    [HttpPost]
    public async Task<ActionResult<VentaResponseDto>> CreateVenta(CreateVentaDto dto)
    {
        if (dto.Detalles is null || dto.Detalles.Count == 0)
            return BadRequest("La venta debe incluir al menos un detalle.");

        var venta = new Venta
        {
            FormaPago = dto.FormaPago,
            FechaHora = HoraArgentina.Ahora()
        };

        foreach (var detalleDto in dto.Detalles)
        {
            var producto = await _context.Productos.FindAsync(detalleDto.ProductoId);

            if (producto is null)
                return BadRequest($"El producto {detalleDto.ProductoId} no existe.");

            if (!producto.Estado)
                return Conflict($"El producto {producto.Nombre} está inactivo y no se puede vender.");

            if (detalleDto.Cantidad <= 0)
                return BadRequest($"La cantidad del producto {producto.Nombre} debe ser mayor a 0.");

            if (detalleDto.Cantidad > producto.Stock)
                return BadRequest($"Stock insuficiente para el producto {producto.Nombre}.");

            var subtotal = detalleDto.Cantidad * detalleDto.PrecioUnitario;

            venta.Detalles.Add(new DetalleVenta
            {
                ProductoId = detalleDto.ProductoId,
                Cantidad = detalleDto.Cantidad,
                PrecioUnitario = detalleDto.PrecioUnitario,
                Subtotal = subtotal
            });

            producto.Stock -= detalleDto.Cantidad;
        }

        venta.Monto = venta.Detalles.Sum(d => d.Subtotal);

        _context.Ventas.Add(venta);
        await _context.SaveChangesAsync();

        var response = MapToResponse(
            await _context.Ventas
                .AsNoTracking()
                .Include(v => v.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstAsync(v => v.Id == venta.Id));

        return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVenta(int id, UpdateVentaDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var venta = await _context.Ventas
            .Include(v => v.Detalles)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (venta is null)
            return NotFound();

        venta.FormaPago = dto.FormaPago;
        venta.Monto = venta.Detalles.Sum(d => d.Subtotal);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVenta(int id)
    {
        var venta = await _context.Ventas.FindAsync(id);

        if (venta is null)
            return NotFound();

        _context.Ventas.Remove(venta);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static VentaResponseDto MapToResponse(Venta venta)
    {
        return new VentaResponseDto
        {
            Id = venta.Id,
            Monto = venta.Monto,
            FormaPago = venta.FormaPago,
            FechaHora = venta.FechaHora,
            CantidadDetalles = venta.Detalles.Count,
            Detalles = venta.Detalles.Select(d => new DetalleVentaResponseDto
            {
                Id = d.Id,
                VentaId = d.VentaId,
                ProductoId = d.ProductoId,
                ProductoNombre = d.Producto.Nombre,
                UnidadMedida = d.Producto.UnidadMedida,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            }).ToList()
        };
    }
}