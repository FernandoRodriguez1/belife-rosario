using Belife.API.Data;
using Belife.API.DTOs.Administrador;
using Belife.API.DTOs.Auth;
using Belife.API.Models;
using Belife.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Belife.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly BelifeDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        BelifeDbContext context,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
    {
        var administrador = await _context.Administradores
            .FirstOrDefaultAsync(a => a.Nombre == dto.Nombre);

        if (administrador is null || !administrador.Activo)
            return Unauthorized("Credenciales inválidas.");

        var hasher = new PasswordHasher<Administrador>();
        var result = hasher.VerifyHashedPassword(administrador, administrador.PasswordHash, dto.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Credenciales inválidas.");

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            administrador.PasswordHash = hasher.HashPassword(administrador, dto.Password);
            await _context.SaveChangesAsync();
        }

        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"]!);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        return Ok(new LoginResponseDto
        {
            Token = _tokenService.GenerarToken(administrador),
            TokenExpiracion = expiration,
            Administrador = new AdministradorResponseDto
            {
                Id = administrador.Id,
                Nombre = administrador.Nombre,
                Activo = administrador.Activo
            }
        });
    }
}