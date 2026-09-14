namespace Belife.API.DTOs.Auth;

public class LoginRequestDto
{
    public string Nombre { get; set; } = null!;

    public string Password { get; set; } = null!;
}