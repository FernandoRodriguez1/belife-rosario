using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Belife.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace Belife.API.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerarToken(Administrador administrador)
    {
        var issuer = _configuration["Jwt:Issuer"]!;
        var audience = _configuration["Jwt:Audience"]!;
        var secretKey = _configuration["Jwt:SecretKey"]!;
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"]!);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, administrador.Id.ToString()),
            new(ClaimTypes.Name, administrador.Nombre)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}