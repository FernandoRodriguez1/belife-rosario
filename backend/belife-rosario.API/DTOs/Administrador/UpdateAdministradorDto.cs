namespace Belife.API.DTOs.Administrador;

public class UpdateAdministradorDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Password { get; set; }

    public bool Activo { get; set; }
}