using Belife.API.DTOs.Administrador;

namespace Belife.API.DTOs.Auth;

public class LoginResponseDto
{
    public string Token { get; set; } = null!;

    public DateTime TokenExpiracion { get; set; }

    public AdministradorResponseDto Administrador { get; set; } = null!;
}