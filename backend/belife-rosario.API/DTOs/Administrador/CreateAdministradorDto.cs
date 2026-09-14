namespace Belife.API.DTOs.Administrador;

public class CreateAdministradorDto
{
    public string Nombre { get; set; } = null!;

    public string Password { get; set; } = null!;

    public bool Activo { get; set; } = true;
}