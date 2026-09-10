using Belife.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly BelifeDbContext _context;

    public TestController(BelifeDbContext context)
    {
        _context = context;
    }

    [HttpGet("conexion")]
    public async Task<IActionResult> ProbarConexion()
    {
        var conectado = await _context.Database.CanConnectAsync();

        return Ok(new
        {
            conectado
        });
    }
}