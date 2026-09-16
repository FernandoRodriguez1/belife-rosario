using Belife.API.Data;
using Belife.API.DTOs.Producto;
using Belife.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/productos")]
[Authorize]
public class ProductoController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public ProductoController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoResponseDto>>> GetProductos()
    {
        var productos = await _context.Productos
            .AsNoTracking()
            .Select(p => new ProductoResponseDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                MarcaId = p.MarcaId,
                MarcaNombre = p.Marca.Nombre,
                PrecioActual = p.PrecioActual,
                Stock = p.Stock,
                Estado = p.Estado,
                UnidadMedida = p.UnidadMedida,
                UnidadPrecio = p.UnidadPrecio,
                FechaCreacion = p.FechaCreacion,
                FechaUltimaModificacion = p.FechaUltimaModificacion
            })
            .ToListAsync();

        return Ok(productos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductoResponseDto>> GetProducto(int id)
    {
        var producto = await _context.Productos
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductoResponseDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                MarcaId = p.MarcaId,
                MarcaNombre = p.Marca.Nombre,
                PrecioActual = p.PrecioActual,
                Stock = p.Stock,
                Estado = p.Estado,
                UnidadMedida = p.UnidadMedida,
                UnidadPrecio = p.UnidadPrecio,
                FechaCreacion = p.FechaCreacion,
                FechaUltimaModificacion = p.FechaUltimaModificacion
            })
            .FirstOrDefaultAsync();

        if (producto is null)
            return NotFound();

        return Ok(producto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductoResponseDto>> CreateProducto(CreateProductoDto dto)
    {
        if (!await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId))
            return BadRequest("La categoría indicada no existe.");

        if (!await _context.Marcas.AnyAsync(m => m.Id == dto.MarcaId))
            return BadRequest("La marca indicada no existe.");

        var producto = new Producto
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            CategoriaId = dto.CategoriaId,
            MarcaId = dto.MarcaId,
            PrecioActual = dto.PrecioActual,
            Stock = dto.Stock,
            Estado = dto.Estado,
            UnidadMedida = dto.UnidadMedida,
            UnidadPrecio = dto.UnidadPrecio
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, await MapToResponse(producto.Id));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProducto(int id, UpdateProductoDto dto)
    {
        if (id != dto.Id)
            return BadRequest("El id de la ruta no coincide con el del cuerpo.");

        var producto = await _context.Productos.FindAsync(id);

        if (producto is null)
            return NotFound();

        if (!await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId))
            return BadRequest("La categoría indicada no existe.");

        if (!await _context.Marcas.AnyAsync(m => m.Id == dto.MarcaId))
            return BadRequest("La marca indicada no existe.");

        producto.Codigo = dto.Codigo;
        producto.Nombre = dto.Nombre;
        producto.CategoriaId = dto.CategoriaId;
        producto.MarcaId = dto.MarcaId;
        producto.PrecioActual = dto.PrecioActual;
        producto.Stock = dto.Stock;
        producto.Estado = dto.Estado;
        producto.UnidadMedida = dto.UnidadMedida;
        producto.UnidadPrecio = dto.UnidadPrecio;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProducto(int id)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto is null)
            return NotFound();

        _context.Productos.Remove(producto);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("No se puede eliminar el producto porque tiene ventas asociadas.");
        }

        return NoContent();
    }

    private async Task<ProductoResponseDto> MapToResponse(int id)
    {
        return await _context.Productos
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductoResponseDto
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nombre = p.Nombre,
                CategoriaId = p.CategoriaId,
                CategoriaNombre = p.Categoria.Nombre,
                MarcaId = p.MarcaId,
                MarcaNombre = p.Marca.Nombre,
                PrecioActual = p.PrecioActual,
                Stock = p.Stock,
                Estado = p.Estado,
                UnidadMedida = p.UnidadMedida,
                UnidadPrecio = p.UnidadPrecio,
                FechaCreacion = p.FechaCreacion,
                FechaUltimaModificacion = p.FechaUltimaModificacion
            })
            .FirstAsync();
    }
}