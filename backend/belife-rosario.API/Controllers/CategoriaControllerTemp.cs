using Belife.API.Data;
using Belife.API.DTOs.Categoria;
using Belife.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/categorias")]
public class CategoriaController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public CategoriaController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CrearCategoria(CreateCategoriaDto dto)
    {
        var categoria = new Categoria
        {
            Nombre = dto.Nombre
        };

        _context.Categorias.Add(categoria);

        await _context.SaveChangesAsync();

        return Ok(categoria);
    }
}